import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import Standard from "../models/Standard.js";
import Subject from "../models/Subject.js";

// Get all batches
export const getAllBatches = async (req, res) => {
  try {
    // Import Student model
    const Student = (await import("../models/Student.js")).default;

    // Check if we should populate enrolledStudents
    const { populate } = req.query;
    const shouldPopulateEnrolledStudents =
      populate && populate.includes("enrolledStudents");

    // Create a query and apply populate operations
    let query = Batch.find()
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    // Conditionally populate enrolledStudents with student details
    if (shouldPopulateEnrolledStudents) {
      query = query.populate("enrolledStudents", "name email phone studentId");
    }

    // Execute the query
    const batches = await query;

    // If we need to populate enrolled students, also check for students that have these batches in their batches array
    if (shouldPopulateEnrolledStudents && batches.length > 0) {
      // Get all batch IDs
      const batchIds = batches.map((batch) => batch._id);

      // Find all students that have any of these batches in their batches array
      const studentsWithBatches = await Student.find({
        batches: { $in: batchIds },
      }).select("_id name email phone studentId batches");

      // Group students by the batches they belong to
      const studentsByBatch = {};
      studentsWithBatches.forEach((student) => {
        student.batches.forEach((batchId) => {
          const batchIdStr = batchId.toString();
          if (!studentsByBatch[batchIdStr]) {
            studentsByBatch[batchIdStr] = [];
          }
          studentsByBatch[batchIdStr].push({
            _id: student._id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            studentId: student.studentId,
          });
        });
      });

      // Add missing students to each batch
      for (const batch of batches) {
        const batchIdStr = batch._id.toString();
        const studentsForBatch = studentsByBatch[batchIdStr] || [];

        if (studentsForBatch.length > 0) {
          // Create a set of existing student IDs
          const existingStudentIds = new Set(
            (batch.enrolledStudents || []).map((s) =>
              s._id ? s._id.toString() : s.toString()
            )
          );

          // Add any missing students to enrolledStudents
          const studentsToAdd = [];
          studentsForBatch.forEach((student) => {
            if (!existingStudentIds.has(student._id.toString())) {
              studentsToAdd.push(student._id);

              // Also add to the populated array for the response
              if (Array.isArray(batch.enrolledStudents)) {
                batch.enrolledStudents.push(student);
              } else {
                batch.enrolledStudents = [student];
              }
            }
          });

          // If we found students to add, update the batch
          if (studentsToAdd.length > 0) {
            console.log(
              `Adding ${studentsToAdd.length} missing students to batch ${batch._id}`
            );
            await Batch.updateOne(
              { _id: batch._id },
              { $addToSet: { enrolledStudents: { $each: studentsToAdd } } }
            );
          }
        }
      }
    }

    // Log the batch data for debugging
    console.log(
      `Fetched ${batches.length} batches, populating enrolledStudents: ${shouldPopulateEnrolledStudents}`
    );

    res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Error fetching all batches:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single batch
export const getBatchById = async (req, res) => {
  try {
    // Import Student model
    const Student = (await import("../models/Student.js")).default;

    // Check if we should populate enrolledStudents
    const { populate } = req.query;
    const shouldPopulateEnrolledStudents =
      populate && populate.includes("enrolledStudents");

    // Create a query and apply populate operations
    let query = Batch.findById(req.params.id)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    // Conditionally populate enrolledStudents with student details
    if (shouldPopulateEnrolledStudents) {
      query = query.populate("enrolledStudents", "name email phone studentId");
    }

    // Execute the query
    const batch = await query;

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Create a copy of the batch that we can modify
    const batchData = batch.toObject();

    // If we need to populate enrolled students, also check for students that have this batch in their batches array
    if (shouldPopulateEnrolledStudents) {
      // Find students that have this batch in their batches array
      const studentsWithBatch = await Student.find({
        batches: batch._id,
      }).select("_id name email phone studentId");

      // Create a set of existing student IDs
      const existingStudentIds = new Set(
        (batch.enrolledStudents || []).map((s) =>
          s._id ? s._id.toString() : s.toString()
        )
      );

      // Add any missing students to the enrolledStudents array
      studentsWithBatch.forEach((student) => {
        if (!existingStudentIds.has(student._id.toString())) {
          // Found a student with this batch in their batches array that isn't in enrolledStudents
          console.log(
            `Adding missing student ${student._id} to batch ${batch._id} enrolledStudents`
          );

          // Add to the existing batch document
          if (!batch.enrolledStudents) {
            batch.enrolledStudents = [student._id];
          } else {
            batch.enrolledStudents.push(student._id);
          }

          // Also add to our response data
          if (!batchData.enrolledStudents) {
            batchData.enrolledStudents = [student];
          } else {
            batchData.enrolledStudents.push(student);
          }
        }
      });

      // Update the batch document to ensure data consistency
      if (studentsWithBatch.length > 0) {
        await batch.save();
      }
    }

    // Log the batch data for debugging
    console.log(
      `Batch ${batch._id} enrolledStudents:`,
      shouldPopulateEnrolledStudents
        ? batchData.enrolledStudents?.length || 0
        : "not populated"
    );

    res.json({
      success: true,
      data: batchData,
    });
  } catch (error) {
    console.error("Error fetching batch details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new batch
export const createBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { standard, subject } = req.body;

    // Check if standard exists
    const standardExists = await Standard.findById(standard);
    if (!standardExists) {
      return res.status(404).json({ message: "Standard not found" });
    }

    // Check if subject exists and belongs to the standard
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const batch = new Batch(req.body);
    const newBatch = await batch.save();

    const populatedBatch = await Batch.findById(newBatch._id)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    res.status(201).json(populatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a batch
export const updateBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { standard, subject } = req.body;

    // Check if standard exists
    if (standard) {
      const standardExists = await Standard.findById(standard);
      if (!standardExists) {
        return res.status(404).json({ message: "Standard not found" });
      }
    }

    // Check if subject exists
    if (subject) {
      const subjectExists = await Subject.findById(subject);
      if (!subjectExists) {
        return res.status(404).json({ message: "Subject not found" });
      }
    }

    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    Object.assign(batch, req.body);
    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a batch
export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    await batch.deleteOne();
    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get batches by subject
export const getBatchesBySubject = async (req, res) => {
  try {
    // Import Student model
    const Student = (await import("../models/Student.js")).default;

    let { subjects, standard, populate } = req.query;
    // Validate query parameters
    if (!subjects) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required",
      });
    }

    // Convert subjects to array if it's a string
    if (!Array.isArray(subjects)) {
      // If multiple subjects are passed as comma-separated string
      if (subjects.includes(",")) {
        subjects = subjects.split(",");
      } else {
        subjects = [subjects];
      }
    }
    // Build the query
    let query = { subject: { $in: subjects } };

    // Add standard filter if provided
    if (standard) {
      query.standard = standard;
    }

    // Create a query and apply populate operations
    let batchQuery = Batch.find(query)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    // Conditionally populate enrolledStudents with student details
    const shouldPopulateEnrolledStudents =
      populate && populate.includes("enrolledStudents");
    if (shouldPopulateEnrolledStudents) {
      batchQuery = batchQuery.populate(
        "enrolledStudents",
        "name email phone studentId"
      );
    }

    // Execute the query
    const batches = await batchQuery;

    // If we need to populate enrolled students, also check for students that have these batches in their batches array
    if (shouldPopulateEnrolledStudents && batches.length > 0) {
      // Get all batch IDs
      const batchIds = batches.map((batch) => batch._id);

      // Find all students that have any of these batches in their batches array
      const studentsWithBatches = await Student.find({
        batches: { $in: batchIds },
      }).select("_id name email phone studentId batches");

      // Group students by the batches they belong to
      const studentsByBatch = {};
      studentsWithBatches.forEach((student) => {
        student.batches.forEach((batchId) => {
          const batchIdStr = batchId.toString();
          if (!studentsByBatch[batchIdStr]) {
            studentsByBatch[batchIdStr] = [];
          }
          studentsByBatch[batchIdStr].push({
            _id: student._id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            studentId: student.studentId,
          });
        });
      });

      // Add missing students to each batch
      for (const batch of batches) {
        const batchIdStr = batch._id.toString();
        const studentsForBatch = studentsByBatch[batchIdStr] || [];

        if (studentsForBatch.length > 0) {
          // Create a set of existing student IDs
          const existingStudentIds = new Set(
            (batch.enrolledStudents || []).map((s) =>
              s._id ? s._id.toString() : s.toString()
            )
          );

          // Add any missing students to enrolledStudents
          const studentsToAdd = [];
          studentsForBatch.forEach((student) => {
            if (!existingStudentIds.has(student._id.toString())) {
              studentsToAdd.push(student._id);

              // Also add to the populated array for the response
              if (Array.isArray(batch.enrolledStudents)) {
                batch.enrolledStudents.push(student);
              } else {
                batch.enrolledStudents = [student];
              }
            }
          });

          // If we found students to add, update the batch
          if (studentsToAdd.length > 0) {
            await Batch.updateOne(
              { _id: batch._id },
              { $addToSet: { enrolledStudents: { $each: studentsToAdd } } }
            );
          }
        }
      }
    }

    res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("Error fetching batches by subject:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a student to a batch
export const addStudentToBatch = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;

    if (!batchId || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Batch ID and Student ID are required",
      });
    }

    // Import Student model
    const Student = (await import("../models/Student.js")).default;

    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Find the student by _id
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = batch.enrolledStudents.some(
      (enrolledStudent) => enrolledStudent.toString() === student._id.toString()
    );

    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this batch",
      });
    }

    // Add student to batch
    batch.enrolledStudents = batch.enrolledStudents || [];
    batch.enrolledStudents.push(student._id);

    // Add batch to student's batches array if not already there
    if (!student.batches.includes(batchId)) {
      student.batches.push(batchId);
      await student.save();
    }

    // Save the batch
    await batch.save();

    // Get the updated batch with populated students
    const updatedBatch = await Batch.findById(batchId).populate('enrolledStudents');

    return res.json({
      success: true,
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Error adding student to batch:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove a student from a batch
export const removeStudentFromBatch = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;

    // Import Student model
    const Student = (await import("../models/Student.js")).default;

    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student is enrolled
    if (
      !batch.enrolledStudents ||
      !batch.enrolledStudents.includes(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in this batch",
      });
    }

    // Remove student from batch
    batch.enrolledStudents = batch.enrolledStudents.filter(
      (student) => student.toString() !== studentId
    );

    // Also remove batch from student's batches array
    student.batches = student.batches.filter(
      (batch) => batch.toString() !== batchId
    );

    // Save both documents
    await student.save();
    await batch.save();

    console.log(
      `Removed student ${studentId} from batch ${batchId}, batch now has ${batch.enrolledStudents.length} students`
    );

    // Return the updated batch with populated data
    const updatedBatch = await Batch.findById(batchId)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name")
      .populate("enrolledStudents", "name email phone studentId");

    res.json({
      success: true,
      data: updatedBatch,
    });
  } catch (error) {
    console.error("Error removing student from batch:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Synchronize batch students with student batches
export const syncBatchStudents = async (req, res) => {
  try {
    // Import Student model
    const Student = (await import("../models/Student.js")).default;

    // Get all batches
    const batches = await Batch.find();
    console.log(`Found ${batches.length} batches to sync`);

    // Get all students
    const students = await Student.find();
    console.log(`Found ${students.length} students to check`);

    let updatedBatches = 0;
    let updatedStudents = 0;
    let errors = [];

    // For each batch, ensure all enrolledStudents have this batch in their batches array
    for (const batch of batches) {
      const batchId = batch._id.toString();
      let batchUpdated = false;

      // Skip if no enrolledStudents
      if (!batch.enrolledStudents || !Array.isArray(batch.enrolledStudents)) {
        batch.enrolledStudents = [];
        batchUpdated = true;
      }

      // Fix any non-existing students in enrolledStudents
      const validStudentIds = [];
      for (const studentId of batch.enrolledStudents) {
        const studentExists = students.some(
          (s) => s._id.toString() === studentId.toString()
        );
        if (studentExists) {
          validStudentIds.push(studentId);
        } else {
          console.log(
            `Removing non-existent student ${studentId} from batch ${batchId}`
          );
        }
      }

      if (validStudentIds.length !== batch.enrolledStudents.length) {
        batch.enrolledStudents = validStudentIds;
        batchUpdated = true;
      }

      // For each student in enrolledStudents
      for (const studentId of batch.enrolledStudents) {
        try {
          const student = students.find(
            (s) => s._id.toString() === studentId.toString()
          );
          if (student) {
            // Ensure student has this batch in their batches array
            if (!student.batches || !Array.isArray(student.batches)) {
              student.batches = [batch._id];
              await student.save();
              updatedStudents++;
            } else if (!student.batches.some((b) => b.toString() === batchId)) {
              student.batches.push(batch._id);
              await student.save();
              updatedStudents++;
            }
          }
        } catch (error) {
          errors.push(`Error updating student ${studentId}: ${error.message}`);
        }
      }

      // Find students who have this batch in their batches array but aren't in enrolledStudents
      for (const student of students) {
        try {
          if (
            student.batches &&
            Array.isArray(student.batches) &&
            student.batches.some((b) => b.toString() === batchId)
          ) {
            if (
              !batch.enrolledStudents.some(
                (s) => s.toString() === student._id.toString()
              )
            ) {
              // Add student to batch.enrolledStudents
              batch.enrolledStudents.push(student._id);
              batchUpdated = true;
            }
          }
        } catch (error) {
          errors.push(
            `Error checking student ${student._id}: ${error.message}`
          );
        }
      }

      // Save batch if updated
      if (batchUpdated) {
        await batch.save();
        updatedBatches++;
      }
    }

    res.json({
      success: true,
      message: `Sync complete: Updated ${updatedBatches} batches and ${updatedStudents} students`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error synchronizing batch students:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if a student is enrolled in a batch
export const checkStudentEnrollment = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;

    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // Import Student model
    const Student = (await import("../models/Student.js")).default;

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student is already enrolled
    const isEnrolled =
      batch.enrolledStudents && batch.enrolledStudents.includes(studentId);

    res.json({
      success: true,
      data: {
        isEnrolled,
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          studentId: student.studentId,
        },
      },
    });
  } catch (error) {
    console.error("Error checking student enrollment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
