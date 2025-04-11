import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { batchService } from "../services/api";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  FormHelperText,
  Tooltip,
  // SyncIcon,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarTodayIcon,
  School as SchoolIcon,
  Sync as SyncIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  fetchBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  resetStatus,
  updateBatchEnrollment,
  updateBatchById,
} from "../store/slices/batchSlice";
import { fetchStandards } from "../store/slices/standardSlice";
import { fetchSubjects } from "../store/slices/subjectSlice";
import { fetchTeachers } from "../store/slices/teacherSlice";
import { fetchStudents, createStudent } from "../store/slices/studentSlice";
import * as Yup from "yup";
import { useFormik } from "formik";
import RefreshButton from "../components/RefreshButton";
import { alpha } from "@mui/material/styles";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATUS_OPTIONS = ["upcoming", "active", "completed", "cancelled"];

const Batches = () => {
  const dispatch = useDispatch();
  const { batches, loading, error, success } = useSelector(
    (state) => state.batches
  );
  const { standards } = useSelector((state) => state.standards);
  const { subjects } = useSelector((state) => state.subjects);
  const { teachers } = useSelector((state) => state.teachers);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    standard: "",
    subject: "",
    startDate: "",
    endDate: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: "",
    },
    capacity: "",
    fees: "",
    status: "upcoming",
    description: "",
    teacher: "",
  });

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Student enrollment state
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [enrollingToBatch, setEnrollingToBatch] = useState(null);

  // Student validation schema
  const studentValidationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    gender: Yup.string().required("Gender is required"),
    address: Yup.string().required("Address is required"),
    parentName: Yup.string().required("Parent name is required"),
    parentPhone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Parent phone number is required"),
    dateOfBirth: Yup.date().required("Date of birth is required"),
    joiningDate: Yup.date().required("Joining date is required"),
    board: Yup.string().required("Board is required"),
    schoolName: Yup.string().required("School name is required"),
  });

  // At the beginning of the component, add new state variables
  const [existingStudentDialogOpen, setExistingStudentDialogOpen] =
    useState(false);
  const [availableStudentsForBatch, setAvailableStudentsForBatch] = useState(
    []
  );
  const [selectedExistingStudent, setSelectedExistingStudent] = useState("");
  const [selectedExistingStudents, setSelectedExistingStudents] = useState([]);
  const [existingStudentSearchTerm, setExistingStudentSearchTerm] =
    useState("");
  const [loadingAvailableStudents, setLoadingAvailableStudents] =
    useState(false);
  // Add state variables for edit student functionality
  const [editStudentDialogOpen, setEditStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Helper function to format error message
  const formatErrorMessage = (error) => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.errors) {
      if (Array.isArray(error.errors)) return error.errors.join(", ");
      if (typeof error.errors === "object")
        return Object.values(error.errors).join(", ");
    }
    return "An error occurred";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(
          fetchBatches({
            populateEnrolledStudents: true,
          })
        ).unwrap();
        // console.log("Fetched batches:", result);
      } catch (err) {
        console.error("Error fetching batches:", err);
      }
    };

    fetchData();
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  // Add debug logging for batches
  useEffect(() => {
    // console.log("Current batches:", batches);
  }, [batches]);

  useEffect(() => {
    if (success) {
      handleClose();
      // Refresh the batches data after successful operation
      dispatch(fetchBatches());
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  // Initialize filtered batches when batches data loads
  useEffect(() => {
    setFilteredBatches(getBatchesArray(batches) || []);
  }, [batches]);

  // Ensure the UI is refreshed when batch data changes
  useEffect(() => {
    const currentBatchArray = getBatchesArray(batches);
    // Force an update of the filtered batches using the current filters
    let results = [...currentBatchArray];

    // Apply current filters
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter((batch) =>
        batch.name?.toLowerCase().includes(searchTerm)
      );
    }

    if (subjectFilter) {
      results = results.filter(
        (batch) =>
          batch.subject?._id === subjectFilter ||
          batch.subject === subjectFilter
      );
    }

    if (standardFilter) {
      results = results.filter(
        (batch) =>
          batch.standard?._id === standardFilter ||
          batch.standard === standardFilter
      );
    }

    if (teacherFilter) {
      results = results.filter(
        (batch) =>
          batch.teacher?._id === teacherFilter ||
          batch.teacher === teacherFilter
      );
    }

    if (statusFilter) {
      results = results.filter((batch) => batch.status === statusFilter);
    }

    setFilteredBatches(results);
  }, [
    batches,
    nameFilter,
    subjectFilter,
    standardFilter,
    teacherFilter,
    statusFilter,
  ]);

  // Student form handling
  const studentFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      standard: "",
      gender: "",
      address: "",
      parentName: "",
      parentPhone: "",
      dateOfBirth: "",
      board: "",
      schoolName: "",
      joiningDate: "",
    },
    validationSchema: studentValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setStatus }) => {
      setStatus(null);
      try {
        // Use the systematic function to handle student enrollment
        const createdStudent = await handleEnrollStudent(
          values,
          enrollingToBatch
        );

        if (createdStudent) {
          alert(
            `Student ${createdStudent.name} successfully added to ${enrollingToBatch.name}`
          );
          setStudentDialogOpen(false);
          resetForm();
        }
      } catch (error) {
        console.error("Error enrolling student:", error);
        setStatus(error.message || "Failed to enroll student");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle opening the student enrollment dialog
  const handleOpenStudentDialog = (batch) => {
    setEnrollingToBatch(batch);

    // Set the standard from the batch
    studentFormik.setValues({
      ...studentFormik.initialValues,
      standard: batch.standard._id || batch.standard,
      joiningDate: new Date().toISOString().split("T")[0], // Set current date as joining date
    });

    setStudentDialogOpen(true);
  };

  // Handle closing the student enrollment dialog
  const handleCloseStudentDialog = () => {
    setStudentDialogOpen(false);
    setEnrollingToBatch(null);
    studentFormik.resetForm();
  };

  // Apply filters whenever batches data or filter values change
  useEffect(() => {
    const batchesArray = getBatchesArray(batches);
    if (!batchesArray || batchesArray.length === 0) {
      setFilteredBatches([]);
      return;
    }

    let results = [...batchesArray];

    // Filter by name
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter((batch) =>
        batch.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by subject
    if (subjectFilter) {
      results = results.filter(
        (batch) =>
          batch.subject?._id === subjectFilter ||
          batch.subject === subjectFilter
      );
    }

    // Filter by standard
    if (standardFilter) {
      results = results.filter(
        (batch) =>
          batch.standard?._id === standardFilter ||
          batch.standard === standardFilter
      );
    }

    // Filter by teacher
    if (teacherFilter) {
      results = results.filter(
        (batch) =>
          batch.teacher?._id === teacherFilter ||
          batch.teacher === teacherFilter
      );
    }

    // Filter by status
    if (statusFilter) {
      results = results.filter((batch) => batch.status === statusFilter);
    }

    setFilteredBatches(results);
  }, [
    batches,
    nameFilter,
    subjectFilter,
    standardFilter,
    teacherFilter,
    statusFilter,
  ]);

  // Add debug logging for related data
  useEffect(() => {
    // console.log("Standards:", standards);
    // console.log("Subjects:", subjects);
    // console.log("Teachers:", teachers);
  }, [standards, subjects, teachers]);

  const handleOpen = (batch = null) => {
    if (batch) {
      // console.log("Opening edit form with batch:", batch);
      setSelectedBatch(batch);

      // Filter subjects based on the batch's standard
      const relatedStandard = standards.find(
        (s) => s._id === batch.standard?._id || s._id === batch.standard
      );
      const standardSubjects = relatedStandard
        ? subjects.filter((subject) =>
            relatedStandard.subjects?.some((s) => (s._id || s) === subject._id)
          )
        : [];
      setFilteredSubjects(standardSubjects);

      // Filter teachers for the batch's subject
      const subjectId = batch.subject?._id || batch.subject;
      const subjectTeachers = teachers.filter((teacher) =>
        teacher.subjects?.some((s) => (s._id || s) === subjectId)
      );
      setFilteredTeachers(subjectTeachers);

      // Format the dates properly
      const startDate = batch.startDate
        ? new Date(batch.startDate).toISOString().split("T")[0]
        : "";
      const endDate = batch.endDate
        ? new Date(batch.endDate).toISOString().split("T")[0]
        : "";

      // Set the form data with proper formatting
      setFormData({
        name: batch.name || "",
        standard: batch.standard?._id || batch.standard || "",
        subject: batch.subject?._id || batch.subject || "",
        startDate: startDate,
        endDate: endDate,
        schedule: {
          days: batch.schedule?.days || [],
          startTime: batch.schedule?.startTime || "",
          endTime: batch.schedule?.endTime || "",
        },
        capacity: batch.capacity || "",
        fees: batch.fees || "",
        status: batch.status || "upcoming",
        description: batch.description || "",
        teacher: batch.teacher?._id || batch.teacher || "",
      });

      // console.log("Set form data for editing:", {
      //   name: batch.name,
      //   standard: batch.standard?._id || batch.standard,
      //   subject: batch.subject?._id || batch.subject,
      //   startDate,
      //   endDate,
      //   schedule: {
      //     days: batch.schedule?.days,
      //     startTime: batch.schedule?.startTime,
      //     endTime: batch.schedule?.endTime,
      //   },
      //   capacity: batch.capacity,
      //   fees: batch.fees,
      //   status: batch.status,
      //   description: batch.description,
      //   teacher: batch.teacher?._id || batch.teacher,
      // });
    } else {
      // Reset form data for creating a new batch
      setSelectedBatch(null);
      setFilteredSubjects([]);
      setFilteredTeachers([]);
      setFormData({
        name: "",
        standard: "",
        subject: "",
        startDate: "",
        endDate: "",
        schedule: {
          days: [],
          startTime: "",
          endTime: "",
        },
        capacity: "",
        fees: "",
        status: "upcoming",
        description: "",
        teacher: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBatch(null);
    setFilteredSubjects([]);
    setFilteredTeachers([]);
    setFormData({
      name: "",
      standard: "",
      subject: "",
      startDate: "",
      endDate: "",
      schedule: {
        days: [],
        startTime: "",
        endTime: "",
      },
      capacity: "",
      fees: "",
      status: "upcoming",
      description: "",
      teacher: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validate required fields
    if (!formData.name || !formData.standard || !formData.subject) {
      alert("Please fill all required fields: Name, Standard, and Subject");
      return;
    }

    try {
      if (selectedBatch) {
        // Update existing batch
        await handleUpdateBatch(selectedBatch._id, formData);
      } else {
        // Create new batch
        await handleCreateBatch(formData);
      }
    } catch (error) {
      console.error("Error submitting batch form:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      setSubmitting(true);
      await dispatch(deleteBatch(id)).unwrap();

      // If we were viewing this batch, close the details dialog
      if (detailsOpen && selectedBatch && selectedBatch._id === id) {
        setDetailsOpen(false);
        setSelectedBatch(null);
      }

      alert("Batch deleted successfully");
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("Failed to delete batch: " + formatErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      // When standard changes, filter subjects based on selected standard
      const standard = standards.find((s) => s._id === value);
      const standardSubjects = standard
        ? subjects.filter((subject) =>
            standard.subjects?.some((s) => (s._id || s) === subject._id)
          )
        : [];
      setFilteredSubjects(standardSubjects);
      setFilteredTeachers([]);
      setFormData({
        ...formData,
        standard: value,
        subject: "",
        teacher: "",
      });
    } else if (name === "subject") {
      // When subject changes, filter teachers based on selected subject
      const subjectTeachers = teachers.filter((teacher) =>
        teacher.subjects?.some((s) => (s._id || s) === value)
      );
      setFilteredTeachers(subjectTeachers);
      setFormData({
        ...formData,
        subject: value,
        teacher: "",
      });
    } else if (name.startsWith("schedule.")) {
      const scheduleField = name.split(".")[1];
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          [scheduleField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDayToggle = (day) => {
    const days = [...formData.schedule.days];
    const index = days.indexOf(day);
    if (index === -1) {
      days.push(day);
    } else {
      days.splice(index, 1);
    }
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days,
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "upcoming":
        return "info";
      case "completed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getBatchStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "upcoming":
        return "info";
      case "completed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const clearFilters = () => {
    setNameFilter("");
    setSubjectFilter("");
    setStandardFilter("");
    setTeacherFilter("");
    setStatusFilter("");
  };

  const handleViewDetails = async (batch) => {
    try {
      // First set the selected batch with what we have
      setSelectedBatch(batch);
      setDetailsOpen(true);

      console.log(
        `Fetching details for batch ${batch._id}, name: ${batch.name}`
      );

      // Directly fetch the specific batch with all its data
      const response = await batchService.getById(batch._id, {
        populateEnrolledStudents: true,
      });

      if (response && response.data) {
        // Handle the response data - it might be in response.data.data or just response.data
        const updatedBatch = response.data.data || response.data;

        // Log the student count
        const enrolledStudentsCount = updatedBatch.enrolledStudents
          ? updatedBatch.enrolledStudents.length
          : 0;
        console.log(
          `Fetched batch details: ${updatedBatch.name}, students: ${enrolledStudentsCount}`,
          updatedBatch.enrolledStudents
        );

        // Update the selected batch in the view
        setSelectedBatch(updatedBatch);

        // Also update this batch in Redux store to ensure data consistency
        dispatch(
          updateBatchById({
            batchId: batch._id,
            batchData: updatedBatch,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching batch details:", error);
    }
  };

  // Helper function to safely get batches array
  const getBatchesArray = (batchesData) => {
    if (!batchesData) return [];
    if (Array.isArray(batchesData)) return [...batchesData];
    if (batchesData.batches && Array.isArray(batchesData.batches))
      return [...batchesData.batches];
    // If it's a single batch object
    if (batchesData._id) return [batchesData];
    return [];
  };

  // Get related entity name
  const getRelatedData = (id, array) => {
    if (!id || !array || !Array.isArray(array)) return "Not assigned";
    const found = array.find((item) => item._id === id);
    return found ? found.name : "Not assigned";
  };

  // Get teacher full name
  const getTeacherName = (teacher) => {
    if (!teacher) return "Not assigned";

    // Handle populated teacher object with firstName/lastName
    if (typeof teacher === "object") {
      const firstName = teacher.firstName || teacher.name || "";
      const lastName = teacher.lastName || "";
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }

    // Handle teacher ID by looking up in teachers array
    if (typeof teacher === "string") {
      const foundTeacher = teachers.find((t) => t._id === teacher);
      if (foundTeacher) {
        const firstName = foundTeacher.firstName || foundTeacher.name || "";
        const lastName = foundTeacher.lastName || "";
        return `${firstName} ${lastName}`.trim();
      }
    }

    return "Not assigned";
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      // Handle different formats
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${hour12}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    dispatch(fetchBatches());
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  // Get students count safely for a batch
  const getStudentsCount = (batch) => {
    if (!batch) return { enrolled: 0, capacity: 0, remaining: 0 };

    let enrolledCount = 0;
    let studentSource = "";

    // Check if enrolledStudents exists and is an array (main way students are tracked in batch model)
    if (batch.enrolledStudents && Array.isArray(batch.enrolledStudents)) {
      enrolledCount = batch.enrolledStudents.length;
      studentSource = "enrolledStudents";
    }
    // Check if students exists and is an array (secondary way)
    else if (batch.students && Array.isArray(batch.students)) {
      enrolledCount = batch.students.length;
      studentSource = "students";
    }
    // Check if studentCount property exists (API might provide this)
    else if (typeof batch.studentCount === "number") {
      enrolledCount = batch.studentCount;
      studentSource = "studentCount";
    }

    // Log for debugging
    if (enrolledCount === 0) {
      console.log(
        `Batch ${batch.name} (${batch._id}) has zero students:`,
        batch.enrolledStudents
      );
    } else {
      console.log(
        `Batch ${batch.name} has ${enrolledCount} students from ${studentSource}`
      );
    }

    const capacity = batch.capacity ? parseInt(batch.capacity, 10) : 0;
    const remainingSeats = Math.max(0, capacity - enrolledCount);

    return {
      enrolled: enrolledCount,
      capacity: capacity,
      remaining: remainingSeats,
    };
  };

  // Get color for remaining seats
  const getRemainingSeatsColor = (batch) => {
    const { remaining, capacity } = getStudentsCount(batch);

    if (remaining === 0) return "error";
    if (capacity > 0) {
      const percentRemaining = (remaining / capacity) * 100;
      if (percentRemaining <= 10) return "error";
      if (percentRemaining <= 25) return "warning";
    }
    return "success";
  };

  // Refresh batch details when dialog opens
  useEffect(() => {
    if (detailsOpen && selectedBatch) {
      const fetchBatchDetails = async () => {
        try {
          // Fetch the most up-to-date batch data directly from the API
          const response = await batchService.getById(selectedBatch._id, {
            populateEnrolledStudents: true,
          });

          if (response && response.data) {
            // Handle the response data - it might be in response.data.data or just response.data
            const updatedBatch = response.data.data || response.data;
            console.log(
              "Refreshed batch details on dialog open:",
              updatedBatch
            );

            // Update the selected batch for the current view
            setSelectedBatch(updatedBatch);

            // Also update the batch in the Redux store to maintain consistency
            dispatch(
              updateBatchById({
                batchId: selectedBatch._id,
                batchData: updatedBatch,
              })
            );
          }
        } catch (error) {
          console.error("Error refreshing batch details:", error);
        }
      };

      fetchBatchDetails();
    }
  }, [detailsOpen, selectedBatch?._id, dispatch]);

  // Batch Management Functions

  // Function to handle batch creation
  const handleCreateBatch = async (batchData) => {
    try {
      setSubmitting(true);
      const newBatch = await dispatch(createBatch(batchData)).unwrap();
      alert(`Batch "${newBatch.name}" created successfully`);
      handleClose();
      return newBatch;
    } catch (error) {
      console.error("Error creating batch:", error);
      alert("Failed to create batch: " + formatErrorMessage(error));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle batch update
  const handleUpdateBatch = async (batchId, batchData) => {
    try {
      setSubmitting(true);
      const updatedBatch = await dispatch(
        updateBatch({
          id: batchId,
          data: batchData,
        })
      ).unwrap();
      alert(`Batch "${updatedBatch.name}" updated successfully`);
      handleClose();
      return updatedBatch;
    } catch (error) {
      console.error("Error updating batch:", error);
      alert("Failed to update batch: " + formatErrorMessage(error));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle batch deletion with confirmation
  const handleDeleteBatchWithConfirmation = (batch) => {
    if (
      window.confirm(`Are you sure you want to delete batch "${batch.name}"?`)
    ) {
      handleDelete(batch._id);
    }
  };

  // Student Management Functions

  // Function to handle student enrollment to batch
  const handleEnrollStudent = async (studentData, batch) => {
    try {
      // Generate student ID
      const currentYear = new Date().getFullYear();

      // Get students to determine the next sequence number
      const studentsResponse = await dispatch(fetchStudents()).unwrap();

      // Find students from current year to determine next sequence number
      const yearPrefix = `${currentYear}-`;
      const currentYearStudents = studentsResponse.filter(
        (student) =>
          student.studentId && student.studentId.startsWith(yearPrefix)
      );

      // Find the highest sequence number
      let maxSequence = 0;
      currentYearStudents.forEach((student) => {
        const sequencePart = student.studentId.split("-")[1];
        const sequence = parseInt(sequencePart, 10);
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence;
        }
      });

      // Generate next sequence number
      const nextSequence = maxSequence + 1;
      const sequenceFormatted = nextSequence.toString().padStart(3, "0");
      const studentId = `${currentYear}-${sequenceFormatted}`;

      // Prepare student data with batch information
      const completeStudentData = {
        ...studentData,
        studentId: studentId,
        batches: [batch._id], // Initialize with this batch
        standard: batch.standard._id || batch.standard,
        subjects: [batch.subject._id || batch.subject],
      };

      // Create the student
      const createdStudent = await dispatch(
        createStudent(completeStudentData)
      ).unwrap();

      console.log("Student created successfully:", createdStudent);

      // Explicitly add the student to the batch using the API
      const enrollResponse = await batchService.addStudentToBatch(
        batch._id,
        createdStudent._id
      );

      if (
        enrollResponse &&
        enrollResponse.data &&
        enrollResponse.data.success
      ) {
        const updatedBatch = enrollResponse.data.data;
        console.log("Student added to batch successfully:", updatedBatch);

        // Update batch data in Redux store
        dispatch(
          updateBatchById({
            batchId: batch._id,
            batchData: updatedBatch,
          })
        );

        // Update UI if details are open
        if (detailsOpen && selectedBatch && selectedBatch._id === batch._id) {
          setSelectedBatch(updatedBatch);
        }
      } else {
        console.warn("Batch update response not as expected:", enrollResponse);
      }

      return createdStudent;
    } catch (error) {
      console.error("Error enrolling student:", error);
      alert("Failed to enroll student: " + formatErrorMessage(error));
      return null;
    }
  };

  // Function to remove student from batch
  const handleRemoveStudentFromBatch = async (student, batch) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${student.name} from "${batch.name}"?`
      )
    ) {
      try {
        // Call API to remove student from batch
        const response = await batchService.removeStudentFromBatch(
          batch._id,
          student._id
        );

        // Check if response was successful and get updated batch data
        if (response && response.data && response.data.success) {
          const updatedBatch = response.data.data;

          // Update the batch in Redux store
          dispatch(
            updateBatchById({
              batchId: batch._id,
              batchData: updatedBatch,
            })
          );

          // Update UI if details are open
          if (detailsOpen && selectedBatch && selectedBatch._id === batch._id) {
            setSelectedBatch(updatedBatch);
          }

          alert(`Student ${student.name} removed from batch "${batch.name}"`);
          return true;
        } else {
          throw new Error(
            "Failed to remove student: No data returned from API"
          );
        }
      } catch (error) {
        console.error("Error removing student from batch:", error);
        alert("Failed to remove student: " + formatErrorMessage(error));
        return false;
      }
    }
    return false;
  };

  // Function to handle student data update
  const handleUpdateStudent = async (studentId, updatedData) => {
    try {
      const updatedStudent = await dispatch(
        updateStudent({
          id: studentId,
          data: updatedData,
        })
      ).unwrap();

      // Refresh any open batch details that might contain this student
      if (detailsOpen && selectedBatch) {
        await handleViewDetails(selectedBatch);
      }

      alert(`Student ${updatedStudent.name} updated successfully`);
      return updatedStudent;
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student: " + formatErrorMessage(error));
      return null;
    }
  };

  // Function to handle student deletion with confirmation
  const handleDeleteStudentWithConfirmation = async (student) => {
    if (
      window.confirm(
        `Are you sure you want to delete student "${student.name}"?`
      )
    ) {
      try {
        await dispatch(deleteStudent(student._id)).unwrap();

        // Refresh any open batch details
        if (detailsOpen && selectedBatch) {
          await handleViewDetails(selectedBatch);
        }

        alert(`Student ${student.name} deleted successfully`);
        return true;
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student: " + formatErrorMessage(error));
        return false;
      }
    }
    return false;
  };

  // Function to synchronize batch-student relationships
  const handleSyncBatchStudents = async () => {
    try {
      setLoading(true);
      const response = await batchService.syncBatchStudents();

      if (response && response.data && response.data.success) {
        console.log("Batch-student sync completed:", response.data.message);
        alert("Batch-student relationships synchronized successfully!");

        // Refresh data
        await dispatch(
          fetchBatches({
            populateEnrolledStudents: true,
            forceRefresh: true,
          })
        ).unwrap();

        // Refresh any open batch details
        if (detailsOpen && selectedBatch) {
          await handleViewDetails(selectedBatch);
        }
      } else {
        console.error("Sync response error:", response);
        alert(
          "Error synchronizing: " + (response?.data?.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error synchronizing batch-student relationships:", error);
      alert("Error synchronizing: " + formatErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding an existing student to a batch
  const handleAddExistingStudentToBatch = async (batch) => {
    try {
      setLoadingAvailableStudents(true);
      setEnrollingToBatch(batch);

      // Get all students
      const studentsResponse = await dispatch(fetchStudents()).unwrap();

      // Filter out students already enrolled in this batch
      const batchStudentIds = (batch.enrolledStudents || []).map((student) =>
        typeof student === "object" ? student._id : student
      );

      const availableStudents = studentsResponse.filter(
        (student) => !batchStudentIds.includes(student._id)
      );

      setAvailableStudentsForBatch(availableStudents);
      setExistingStudentDialogOpen(true);
    } catch (error) {
      console.error("Error fetching available students:", error);
      alert("Failed to fetch available students: " + formatErrorMessage(error));
    } finally {
      setLoadingAvailableStudents(false);
    }
  };

  // Function to handle enrolling an existing student to a batch
  const handleEnrollExistingStudent = async () => {
    try {
      if (!selectedExistingStudents.length || !enrollingToBatch) {
        alert("Please select at least one student to enroll");
        return;
      }

      setSubmitting(true);

      let successCount = 0;
      let failCount = 0;

      // Process each selected student
      for (const studentId of selectedExistingStudents) {
        try {
          // Call the API to add the student to the batch
          const response = await batchService.addStudentToBatch(
            enrollingToBatch._id,
            studentId
          );

          if (response && response.data && response.data.success) {
            successCount++;
          } else {
            failCount++;
            console.error("Batch update response not as expected:", response);
          }
        } catch (err) {
          failCount++;
          console.error("Error enrolling student:", err);
        }
      }

      // After processing all students, get the fully populated updated batch with complete student data
      const updatedBatchResponse = await batchService.getById(
        enrollingToBatch._id,
        {
          populateEnrolledStudents: true, // Make sure to request fully populated student data
        }
      );

      if (
        updatedBatchResponse &&
        updatedBatchResponse.data &&
        updatedBatchResponse.data.success
      ) {
        const updatedBatch = updatedBatchResponse.data.data;

        console.log("Updated batch with full student data:", updatedBatch);

        // Update Redux store with complete student data
        dispatch(
          updateBatchById({
            batchId: enrollingToBatch._id,
            batchData: updatedBatch,
          })
        );

        // Update UI if details are open - use the fully populated batch data
        if (
          detailsOpen &&
          selectedBatch &&
          selectedBatch._id === enrollingToBatch._id
        ) {
          setSelectedBatch(updatedBatch);
        }
      }

      // Show appropriate message based on results
      if (successCount > 0 && failCount === 0) {
        alert(`Successfully enrolled ${successCount} students`);
      } else if (successCount > 0 && failCount > 0) {
        alert(
          `Enrolled ${successCount} students. Failed to enroll ${failCount} students.`
        );
      } else {
        alert("Failed to enroll any students");
      }

      handleCloseExistingStudentDialog();
    } catch (error) {
      console.error("Error enrolling existing students:", error);
      alert("Failed to enroll students: " + formatErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseExistingStudentDialog = () => {
    setExistingStudentDialogOpen(false);
    setEnrollingToBatch(null);
    setSelectedExistingStudents([]);
    setExistingStudentSearchTerm("");
  };

  // Add these functions for handling the edit student dialog
  const handleOpenEditStudentDialog = async (student) => {
    try {
      setSubmitting(true);

      // Fetch the complete student data to ensure we have all fields
      const response = await fetch(`/api/students/${student._id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch complete student data");
      }

      const completeStudent = await response.json();

      // If the API response has a data property, extract the student from it
      const studentData = completeStudent.data
        ? completeStudent.data
        : completeStudent;

      console.log("Complete student data fetched:", studentData);

      // Set the student with complete data
      setEditingStudent(studentData);
      setEditStudentDialogOpen(true);
    } catch (error) {
      console.error("Error fetching complete student data:", error);
      // Fall back to the existing student data if fetch fails
      setEditingStudent(student);
      setEditStudentDialogOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseEditStudentDialog = () => {
    setEditStudentDialogOpen(false);
    setEditingStudent(null);
  };

  // Effect to auto-select first matching student when search term changes
  useEffect(() => {
    if (existingStudentSearchTerm && availableStudentsForBatch.length > 0) {
      const filteredStudents = availableStudentsForBatch.filter((student) => {
        const searchTerm = existingStudentSearchTerm.toLowerCase();
        return (
          (student.name && student.name.toLowerCase().includes(searchTerm)) ||
          (student.email && student.email.toLowerCase().includes(searchTerm)) ||
          (student.phone && student.phone.includes(searchTerm)) ||
          (student.studentId &&
            student.studentId.toLowerCase().includes(searchTerm))
        );
      });

      if (filteredStudents.length > 0) {
        setSelectedExistingStudent(filteredStudents[0]._id);
      }
    }
  }, [existingStudentSearchTerm, availableStudentsForBatch]);

  if (loading && getBatchesArray(batches).length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            Batches
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh batches data"
            sx={{ ml: 1 }}
          />
          <Tooltip title="Sync batch-student relationships">
            <IconButton
              color="secondary"
              onClick={handleSyncBatchStudents}
              disabled={loading}
              sx={{ ml: 1 }}
            >
              <SyncIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Batch
        </Button>
      </Box>

      {/* Filters */}
      <Accordion
        expanded={filtersExpanded}
        onChange={() => setFiltersExpanded(!filtersExpanded)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography>Filters</Typography>
            {(nameFilter ||
              subjectFilter ||
              standardFilter ||
              teacherFilter ||
              statusFilter) && (
              <Chip
                label={`${[
                  nameFilter ? 1 : 0,
                  subjectFilter ? 1 : 0,
                  standardFilter ? 1 : 0,
                  teacherFilter ? 1 : 0,
                  statusFilter ? 1 : 0,
                ].reduce((a, b) => a + b, 0)} active`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: existingStudentSearchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setExistingStudentSearchTerm("");
                          // Also reset the selection when clearing search
                          setSelectedExistingStudents([]);
                        }}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Standard"
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value)}
              >
                <MenuItem value="">All Standards</MenuItem>
                {standards.map((standard) => (
                  <MenuItem key={standard._id} value={standard._id}>
                    {standard.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Teacher"
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
              >
                <MenuItem value="">All Teachers</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={
                    !nameFilter &&
                    !subjectFilter &&
                    !standardFilter &&
                    !teacherFilter &&
                    !statusFilter
                  }
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Results count */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredBatches.length} of {getBatchesArray(batches).length}{" "}
          batches
        </Typography>
        {filteredBatches.length === 0 &&
          getBatchesArray(batches).length > 0 && (
            <Alert
              severity="info"
              sx={{ py: 0, width: { xs: "100%", sm: "auto" } }}
            >
              No batches match your filter criteria
            </Alert>
          )}
      </Box>

      {isMobile ? (
        // Mobile view - cards instead of table
        <Stack spacing={2}>
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch) => (
              <Card
                key={batch._id}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                }}
                elevation={2}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {batch.name}
                    </Typography>
                    <Chip
                      label={
                        batch.status.charAt(0).toUpperCase() +
                        batch.status.slice(1)
                      }
                      size="small"
                      color={getStatusColor(batch.status)}
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Standard:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {batch.standard?.name || "Not specified"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Subject:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {batch.subject?.name || "Not specified"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Teacher:
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PersonIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {getTeacherName(batch.teacher)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Schedule:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {batch.schedule
                          ? `${formatTime(
                              batch.schedule.startTime
                            )} - ${formatTime(batch.schedule.endTime)}, ${
                              batch.schedule.days?.join(", ") || "No days set"
                            }`
                          : "Not set"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        mb: 1,
                        gap: { xs: 2, sm: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{ fontWeight: 600 }}
                        >
                          Students{" "}
                          <Typography
                            component="span"
                            sx={{ fontWeight: 400, fontSize: "0.9rem" }}
                          >
                            ({getStudentsCount(batch).enrolled}/
                            {batch.capacity || "∞"})
                          </Typography>
                        </Typography>
                        {batch.capacity && (
                          <Chip
                            size="small"
                            label={`${
                              getStudentsCount(batch).remaining
                            } seats remaining`}
                            color={getRemainingSeatsColor(batch)}
                            sx={{ ml: 1, fontWeight: 500 }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "row", sm: "row" },
                          alignItems: { xs: "stretch", sm: "center" },
                          gap: { xs: 1, sm: 1.5 },
                          width: "100%",
                          mt: { xs: 1, sm: 0 },
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          startIcon={<PersonAddIcon fontSize="small" />}
                          onClick={() => handleAddExistingStudentToBatch(batch)}
                          disabled={
                            batch.capacity &&
                            getStudentsCount(batch).remaining <= 0
                          }
                          sx={{
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            py: { xs: 0.5, sm: 0.75 },
                            minHeight: { xs: "32px", sm: "36px" },
                            flex: 1,
                          }}
                        >
                          Add Existing
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<PersonAddIcon fontSize="small" />}
                          onClick={() => handleOpenStudentDialog(batch)}
                          disabled={
                            batch.capacity &&
                            getStudentsCount(batch).remaining <= 0
                          }
                          sx={{
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            py: { xs: 0.5, sm: 0.75 },
                            minHeight: { xs: "32px", sm: "36px" },
                            flex: 1,
                          }}
                        >
                          Add New
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 1,
                    justifyContent: "flex-start",
                    gap: 1,
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(batch)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpen(batch)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(batch._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography align="center" sx={{ py: 3 }}>
              No batches found
            </Typography>
          )}
        </Stack>
      ) : (
        // Desktop/tablet view - table
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table size={isTablet ? "small" : "medium"}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              >
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Standard
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Subject
                </TableCell>
                {!isTablet && (
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Teacher
                  </TableCell>
                )}
                {!isTablet && (
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Schedule
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Students
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch) => (
                  <TableRow
                    key={batch._id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                      },
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewDetails(batch)}
                  >
                    <TableCell sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                      {batch.name || "—"}
                    </TableCell>
                    <TableCell>{batch.standard?.name || "—"}</TableCell>
                    <TableCell>{batch.subject?.name || "—"}</TableCell>
                    {!isTablet && (
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PersonIcon
                            fontSize="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {getTeacherName(batch.teacher)}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {!isTablet && (
                      <TableCell>
                        {batch.schedule
                          ? `${formatTime(
                              batch.schedule.startTime
                            )} - ${formatTime(batch.schedule.endTime)}, ${
                              batch.schedule.days?.join(", ") || ""
                            }`
                          : "—"}
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: "medium" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={`${getStudentsCount(batch).enrolled}/${
                            batch.capacity || "∞"
                          }`}
                          size="small"
                          color={
                            getStudentsCount(batch).enrolled > 0
                              ? "primary"
                              : "default"
                          }
                          sx={{ fontWeight: 600 }}
                          icon={<PersonIcon fontSize="small" />}
                        />
                        {batch.capacity > 0 && (
                          <Chip
                            label={`${
                              getStudentsCount(batch).remaining
                            } seats left`}
                            size="small"
                            color={getRemainingSeatsColor(batch)}
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          batch.status.charAt(0).toUpperCase() +
                          batch.status.slice(1)
                        }
                        size="small"
                        color={getStatusColor(batch.status)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(batch);
                          }}
                          title="View Details"
                          sx={{
                            color: theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(batch);
                          }}
                          title="Edit Batch"
                          sx={{
                            color: theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(batch._id);
                          }}
                          title="Delete Batch"
                          sx={{
                            color: theme.palette.error.main,
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.error.main,
                                0.1
                              ),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isTablet ? 6 : 8} align="center">
                    No batches found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        {selectedBatch && (
          <>
            <DialogTitle
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {selectedBatch.name}
              </Typography>
              <Chip
                label={
                  selectedBatch.status
                    ? selectedBatch.status.charAt(0).toUpperCase() +
                      selectedBatch.status.slice(1)
                    : "Unknown"
                }
                color={getBatchStatusColor(selectedBatch.status)}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </DialogTitle>
            <DialogContent
              dividers
              sx={{
                p: { xs: 2, sm: 3 },
                overflowY: "auto",
                flexGrow: 1,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      height: "100%",
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      Batch Information
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Standard:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.standard?.name || "Not specified"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Subject:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.subject?.name || "Not specified"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Teacher:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {getTeacherName(selectedBatch.teacher)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Duration:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {`${formatDate(
                            selectedBatch.startDate
                          )} - ${formatDate(selectedBatch.endDate)}`}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Capacity:
                        </Typography>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedBatch.capacity
                              ? `${getStudentsCount(selectedBatch).enrolled}/${
                                  selectedBatch.capacity
                                }`
                              : "Not specified"}
                          </Typography>
                          {selectedBatch.capacity && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={`${
                                  getStudentsCount(selectedBatch).remaining
                                } seats remaining`}
                                size="small"
                                color={getRemainingSeatsColor(selectedBatch)}
                                sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Fees:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.fees
                            ? `$${selectedBatch.fees}`
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      height: "100%",
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      Schedule
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Days:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            justifyContent: "flex-end",
                          }}
                        >
                          {selectedBatch.schedule?.days &&
                          selectedBatch.schedule.days.length > 0 ? (
                            selectedBatch.schedule.days.map((day) => (
                              <Chip
                                key={day}
                                label={day}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 24, fontWeight: 500 }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2">
                              Not specified
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Time:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.schedule?.startTime &&
                          selectedBatch.schedule?.endTime
                            ? `${formatTime(
                                selectedBatch.schedule.startTime
                              )} - ${formatTime(
                                selectedBatch.schedule.endTime
                              )}`
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                {selectedBatch.description && (
                  <Grid item xs={12}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        fontWeight="bold"
                        color="primary"
                        sx={{
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        }}
                      >
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1.5 }}>
                        {selectedBatch.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1, sm: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <PersonIcon />
                        <span>
                          Students ({getStudentsCount(selectedBatch).enrolled}/
                          {selectedBatch.capacity || "∞"})
                        </span>
                        {selectedBatch.capacity && (
                          <Chip
                            size="small"
                            label={`${
                              getStudentsCount(selectedBatch).remaining
                            } seats remaining`}
                            color={getRemainingSeatsColor(selectedBatch)}
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexDirection: { xs: "column", sm: "row" },
                          width: { xs: "100%", sm: "auto" },
                          mt: { xs: 1, sm: 0 },
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          startIcon={<PersonAddIcon />}
                          onClick={() =>
                            handleAddExistingStudentToBatch(selectedBatch)
                          }
                          disabled={
                            !selectedBatch ||
                            (selectedBatch.capacity &&
                              getStudentsCount(selectedBatch).remaining <= 0)
                          }
                          sx={{
                            borderRadius: 1.5,
                            textTransform: "none",
                            width: { xs: "100%", sm: "auto" },
                            minWidth: { xs: "100%", sm: "140px" },
                          }}
                        >
                          Add Existing Student
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleOpenStudentDialog(selectedBatch)}
                          disabled={
                            !selectedBatch ||
                            (selectedBatch.capacity &&
                              getStudentsCount(selectedBatch).remaining <= 0)
                          }
                          sx={{
                            borderRadius: 1.5,
                            textTransform: "none",
                            width: { xs: "100%", sm: "auto" },
                            minWidth: { xs: "100%", sm: "140px" },
                          }}
                        >
                          Add New Student
                        </Button>
                      </Box>
                    </Typography>
                    {selectedBatch.enrolledStudents &&
                    selectedBatch.enrolledStudents.length > 0 ? (
                      <Box sx={{ mt: 1.5, overflowX: "auto" }}>
                        <TableContainer
                          sx={{
                            minWidth: { xs: 600, sm: "100%" },
                            borderRadius: 1,
                          }}
                        >
                          <Table size={isMobile ? "small" : "medium"}>
                            <TableHead>
                              <TableRow
                                sx={{
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                }}
                              >
                                <TableCell sx={{ fontWeight: 600 }}>
                                  Name
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  ID
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    display: { xs: "none", sm: "table-cell" },
                                  }}
                                >
                                  Email
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    display: { xs: "none", md: "table-cell" },
                                  }}
                                >
                                  Phone
                                </TableCell>
                                <TableCell
                                  sx={{ fontWeight: 600 }}
                                  align="center"
                                >
                                  Actions
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedBatch.enrolledStudents.map((student) => (
                                <TableRow
                                  key={student._id}
                                  sx={{
                                    "&:hover": {
                                      backgroundColor: alpha(
                                        theme.palette.primary.light,
                                        0.05
                                      ),
                                    },
                                  }}
                                >
                                  <TableCell>
                                    <Typography
                                      noWrap
                                      sx={{
                                        maxWidth: { xs: 120, sm: "none" },
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {student.name ||
                                        `${student.firstName || ""} ${
                                          student.lastName || ""
                                        }`}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {student.studentId || "N/A"}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      display: { xs: "none", sm: "table-cell" },
                                    }}
                                  >
                                    {student.email}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      display: { xs: "none", md: "table-cell" },
                                    }}
                                  >
                                    {student.phone}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Tooltip title="Edit Student">
                                        <IconButton
                                          size="small"
                                          color="primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditStudentDialog(
                                              student
                                            );
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Remove from Batch">
                                        <IconButton
                                          size="small"
                                          color="warning"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveStudentFromBatch(
                                              student,
                                              selectedBatch
                                            );
                                          }}
                                        >
                                          <PersonIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete Student">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteStudentWithConfirmation(
                                              student
                                            );
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ) : selectedBatch.students &&
                      selectedBatch.students.length > 0 ? (
                      <TableContainer sx={{ mt: 1.5 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>
                                Name
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Email
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Phone
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: 600 }}
                                align="center"
                              >
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedBatch.students.map((student) => (
                              <TableRow
                                key={student._id}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      theme.palette.primary.light,
                                      0.05
                                    ),
                                  },
                                }}
                              >
                                <TableCell>
                                  {student.name ||
                                    `${student.firstName || ""} ${
                                      student.lastName || ""
                                    }`}
                                </TableCell>
                                <TableCell>
                                  {student.studentId || "N/A"}
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phone}</TableCell>
                                <TableCell align="center">
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Tooltip title="Edit Student">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Open edit student dialog (to be implemented)
                                          alert(
                                            "Edit student functionality coming soon"
                                          );
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Remove from Batch">
                                      <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveStudentFromBatch(
                                            student,
                                            selectedBatch
                                          );
                                        }}
                                      >
                                        <PersonIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Student">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteStudentWithConfirmation(
                                            student
                                          );
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.05
                          ),
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          No students enrolled in this batch yet.
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                position: isMobile ? "sticky" : "relative",
                bottom: 0,
                backgroundColor: "background.paper",
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                zIndex: 1,
                mt: "auto",
                flexShrink: 0,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  setDetailsOpen(false);
                  handleOpen(selectedBatch);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(selectedBatch._id)}
              >
                Delete
              </Button>
              <Button
                onClick={() => setDetailsOpen(false)}
                variant="contained"
                sx={{ ml: "auto" }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Batch Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            p: 2,
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {selectedBatch ? "Edit Batch" : "Add New Batch"}
          </Typography>
        </DialogTitle>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "100%" : "auto",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          <DialogContent
            dividers
            sx={{
              p: { xs: 2, sm: 3 },
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Fill in the details below to{" "}
                {selectedBatch ? "update" : "create"} a batch. Fields marked
                with * are required.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Batch Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Standard</InputLabel>
                  <Select
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                    label="Standard"
                    sx={{ borderRadius: 1 }}
                  >
                    {standards.map((standard) => (
                      <MenuItem key={standard._id} value={standard._id}>
                        {standard.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  required
                  disabled={!formData.standard}
                  variant="outlined"
                >
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    label="Subject"
                    sx={{ borderRadius: 1 }}
                  >
                    {filteredSubjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  disabled={!formData.subject}
                  variant="outlined"
                >
                  <InputLabel>Teacher</InputLabel>
                  <Select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleChange}
                    label="Teacher"
                    sx={{ borderRadius: 1 }}
                  >
                    {filteredTeachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Date and Time
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    fontWeight={600}
                    gutterBottom
                  >
                    Schedule Days
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <Chip
                        key={day}
                        label={day}
                        onClick={() => handleDayToggle(day)}
                        color={
                          formData.schedule.days.includes(day)
                            ? "primary"
                            : "default"
                        }
                        variant={
                          formData.schedule.days.includes(day)
                            ? "filled"
                            : "outlined"
                        }
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="schedule.startTime"
                  label="Start Time"
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="schedule.endTime"
                  label="End Time"
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Capacity and Fees
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="capacity"
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    inputProps: { min: 1 },
                    sx: { borderRadius: 1 },
                  }}
                  helperText="Maximum number of students that can be enrolled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="fees"
                  label="Fees"
                  type="number"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                    sx={{ borderRadius: 1 }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                  placeholder="Add any additional details about this batch"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              position: isMobile ? "sticky" : "relative",
              bottom: 0,
              backgroundColor: "background.paper",
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              zIndex: 1,
              mt: "auto",
              flexShrink: 0,
            }}
          >
            {/* Show only Cancel and Submit when adding, include Delete when editing */}
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>

            {/* Only show Delete button when editing an existing batch */}
            {selectedBatch && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteBatchWithConfirmation(selectedBatch)}
                disabled={submitting}
              >
                Delete
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              sx={{ ml: "auto" }}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {submitting ? "Saving..." : selectedBatch ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog
        open={studentDialogOpen}
        onClose={handleCloseStudentDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(to right, ${alpha(
              theme.palette.primary.main,
              0.8
            )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
            color: "white",
            p: 2.5,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <PersonAddIcon sx={{ fontSize: "1.8rem" }} />
          <Typography variant="h6" fontWeight={600}>
            Add Student to {enrollingToBatch?.name || "Batch"}
          </Typography>
        </DialogTitle>
        <form
          onSubmit={studentFormik.handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "100%" : "auto",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          <DialogContent
            dividers
            sx={{
              p: { xs: 2, sm: 3 },
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {studentFormik.status && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 1.5,
                }}
              >
                {studentFormik.status}
              </Alert>
            )}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.light, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                This student will be added to{" "}
                <b>{enrollingToBatch?.name || "Batch"}</b> and assigned to{" "}
                <b>
                  {getRelatedData(
                    enrollingToBatch?.standard?._id ||
                      enrollingToBatch?.standard,
                    standards
                  )?.name || "Standard"}
                </b>{" "}
                and{" "}
                <b>
                  {getRelatedData(
                    enrollingToBatch?.subject?._id || enrollingToBatch?.subject,
                    subjects
                  )?.name || "Subject"}
                </b>{" "}
                automatically.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    pb: 1,
                    mb: 1,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.3
                    )}`,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    fontWeight={600}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PersonIcon fontSize="small" />
                    Basic Information
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Name"
                  value={studentFormik.values.name}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.name &&
                    Boolean(studentFormik.errors.name)
                  }
                  helperText={
                    studentFormik.touched.name && studentFormik.errors.name
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={studentFormik.values.gender}
                    onChange={studentFormik.handleChange}
                    error={
                      studentFormik.touched.gender &&
                      Boolean(studentFormik.errors.gender)
                    }
                    label="Gender"
                  >
                    <MenuItem value="">
                      <em>Select Gender</em>
                    </MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {studentFormik.touched.gender &&
                    studentFormik.errors.gender && (
                      <FormHelperText error>
                        {studentFormik.errors.gender}
                      </FormHelperText>
                    )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={studentFormik.values.dateOfBirth}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.dateOfBirth &&
                    Boolean(studentFormik.errors.dateOfBirth)
                  }
                  helperText={
                    studentFormik.touched.dateOfBirth &&
                    studentFormik.errors.dateOfBirth
                  }
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  value={studentFormik.values.address}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.address &&
                    Boolean(studentFormik.errors.address)
                  }
                  helperText={
                    studentFormik.touched.address &&
                    studentFormik.errors.address
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    pt: 2,
                    pb: 1,
                    mb: 1,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.3
                    )}`,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    fontWeight={600}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PhoneIcon fontSize="small" />
                    Contact Information
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={studentFormik.values.email}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.email &&
                    Boolean(studentFormik.errors.email)
                  }
                  helperText={
                    studentFormik.touched.email && studentFormik.errors.email
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={studentFormik.values.phone}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.phone &&
                    Boolean(studentFormik.errors.phone)
                  }
                  helperText={
                    studentFormik.touched.phone && studentFormik.errors.phone
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="parentName"
                  label="Parent Name"
                  value={studentFormik.values.parentName}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.parentName &&
                    Boolean(studentFormik.errors.parentName)
                  }
                  helperText={
                    studentFormik.touched.parentName &&
                    studentFormik.errors.parentName
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="parentPhone"
                  label="Parent Phone Number"
                  value={studentFormik.values.parentPhone}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.parentPhone &&
                    Boolean(studentFormik.errors.parentPhone)
                  }
                  helperText={
                    studentFormik.touched.parentPhone &&
                    studentFormik.errors.parentPhone
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    pt: 2,
                    pb: 1,
                    mb: 1,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.divider,
                      0.3
                    )}`,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    fontWeight={600}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <SchoolIcon fontSize="small" />
                    Academic Information
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="joiningDate"
                  label="Joining Date"
                  type="date"
                  value={studentFormik.values.joiningDate}
                  onChange={studentFormik.handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={
                    studentFormik.touched.joiningDate &&
                    Boolean(studentFormik.errors.joiningDate)
                  }
                  helperText={
                    studentFormik.touched.joiningDate &&
                    studentFormik.errors.joiningDate
                      ? studentFormik.errors.joiningDate
                      : "Required"
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="schoolName"
                  label="School Name"
                  value={studentFormik.values.schoolName}
                  onChange={studentFormik.handleChange}
                  error={
                    studentFormik.touched.schoolName &&
                    Boolean(studentFormik.errors.schoolName)
                  }
                  helperText={
                    studentFormik.touched.schoolName &&
                    studentFormik.errors.schoolName
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={
                    studentFormik.touched.board &&
                    Boolean(studentFormik.errors.board)
                  }
                  required
                >
                  <InputLabel>Board</InputLabel>
                  <Select
                    name="board"
                    value={studentFormik.values.board}
                    onChange={studentFormik.handleChange}
                    label="Board"
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="" disabled>
                      Select a board
                    </MenuItem>
                    <MenuItem value="CBSE">CBSE</MenuItem>
                    <MenuItem value="ICSE">ICSE</MenuItem>
                    <MenuItem value="State Board">State Board</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {studentFormik.touched.board &&
                    studentFormik.errors.board && (
                      <FormHelperText>
                        {studentFormik.errors.board}
                      </FormHelperText>
                    )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              backgroundColor: "background.paper",
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              zIndex: 1,
              mt: "auto",
              flexShrink: 0,
              gap: 1,
            }}
          >
            <Button
              onClick={handleCloseStudentDialog}
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              disabled={studentFormik.isSubmitting}
              startIcon={
                studentFormik.isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PersonAddIcon />
                )
              }
              sx={{
                ml: "auto",
                borderRadius: 1.5,
                textTransform: "none",
                px: { xs: 2, sm: 3 },
              }}
            >
              {studentFormik.isSubmitting
                ? "Processing..."
                : "Add Student to Batch"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Existing Student Dialog */}
      <Dialog
        open={existingStudentDialogOpen}
        onClose={handleCloseExistingStudentDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(to right, ${alpha(
              theme.palette.primary.main,
              0.8
            )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
            color: "white",
            p: 2.5,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonAddIcon sx={{ fontSize: "1.8rem" }} />
            <Typography variant="h6" fontWeight={600}>
              Add Existing Student to {enrollingToBatch?.name || "Batch"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            p: { xs: 2, sm: 3 },
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Select an existing student to enroll in {enrollingToBatch?.name}.
              This will add this student to this batch for a different subject.
            </Typography>
          </Box>

          {/* Student Count */}
          {!loadingAvailableStudents && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight={500} color="primary">
                {(() => {
                  const filteredCount = availableStudentsForBatch.filter(
                    (student) => {
                      if (!existingStudentSearchTerm) return true;
                      const searchTerm =
                        existingStudentSearchTerm.toLowerCase();
                      return (
                        (student.name &&
                          student.name.toLowerCase().includes(searchTerm)) ||
                        (student.email &&
                          student.email.toLowerCase().includes(searchTerm)) ||
                        (student.phone && student.phone.includes(searchTerm)) ||
                        (student.studentId &&
                          student.studentId.toLowerCase().includes(searchTerm))
                      );
                    }
                  ).length;

                  if (existingStudentSearchTerm) {
                    return `${filteredCount} ${
                      filteredCount === 1 ? "student" : "students"
                    } found`;
                  } else {
                    return `${filteredCount} available ${
                      filteredCount === 1 ? "student" : "students"
                    }`;
                  }
                })()}
              </Typography>
              {existingStudentSearchTerm && (
                <Chip
                  label="Clear search"
                  size="small"
                  onDelete={() => {
                    setExistingStudentSearchTerm("");
                    // Reset selection to make it easier to start fresh
                    if (selectedExistingStudents.length > 0) {
                      setSelectedExistingStudents([]);
                    }
                  }}
                  color="primary"
                  variant="outlined"
                  clickable
                />
              )}
            </Box>
          )}

          {/* Student Search */}
          <TextField
            fullWidth
            label="Search Student"
            placeholder="Search by name, email, or ID"
            value={existingStudentSearchTerm}
            onChange={(e) => {
              setExistingStudentSearchTerm(e.target.value);
              // Open the select dropdown when typing
              if (e.target.value) {
                setTimeout(() => {
                  const selectElement = document.getElementById(
                    "existing-student-select"
                  );
                  if (selectElement) selectElement.click();
                }, 100);
              }
            }}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: existingStudentSearchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setExistingStudentSearchTerm("");
                      // Reset selection to make it easier to start fresh
                      setSelectedExistingStudents([]);
                    }}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {loadingAvailableStudents ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : availableStudentsForBatch.length === 0 ? (
            <Alert severity="info">
              No available students found. All students are already enrolled in
              this batch.
            </Alert>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="existing-student-select-label">
                Select Students
              </InputLabel>
              <Select
                labelId="existing-student-select-label"
                multiple
                value={selectedExistingStudents}
                onChange={(e) => {
                  setSelectedExistingStudents(e.target.value);
                  // Keep the dropdown open
                }}
                label="Select Students"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const student = availableStudentsForBatch.find(
                        (s) => s._id === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={student ? student.name : value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
                id="existing-student-select"
              >
                <MenuItem value="" disabled>
                  <em>Select a student</em>
                </MenuItem>
                {availableStudentsForBatch
                  .filter((student) => {
                    if (!existingStudentSearchTerm) return true;

                    const searchTerm = existingStudentSearchTerm.toLowerCase();
                    return (
                      (student.name &&
                        student.name.toLowerCase().includes(searchTerm)) ||
                      (student.email &&
                        student.email.toLowerCase().includes(searchTerm)) ||
                      (student.phone && student.phone.includes(searchTerm)) ||
                      (student.studentId &&
                        student.studentId.toLowerCase().includes(searchTerm))
                    );
                  })
                  .map((student) => (
                    <MenuItem
                      key={student._id}
                      value={student._id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {student.name}{" "}
                        {student.studentId ? `(${student.studentId})` : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.email} • {student.phone}
                      </Typography>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            backgroundColor: "background.paper",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            zIndex: 1,
            mt: "auto",
            flexShrink: 0,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseExistingStudentDialog}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnrollExistingStudent}
            variant="contained"
            color="primary"
            disabled={!selectedExistingStudents.length || submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PersonAddIcon />
              )
            }
            sx={{
              ml: "auto",
              borderRadius: 1.5,
              textTransform: "none",
              px: { xs: 2, sm: 3 },
            }}
          >
            {submitting ? "Enrolling..." : "Enroll Selected Students"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={editStudentDialogOpen}
        onClose={handleCloseEditStudentDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(to right, ${alpha(
              theme.palette.primary.main,
              0.8
            )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
            color: "white",
            p: 2.5,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <EditIcon sx={{ fontSize: "1.8rem" }} />
            <Typography variant="h6" fontWeight={600}>
              Edit Student
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 3,
            pb: 2,
            p: { xs: 2, sm: 3 },
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          {editingStudent && (
            <Box sx={{ height: "100%" }}>
              <EditStudentForm
                student={editingStudent}
                onUpdate={async (updatedData) => {
                  try {
                    setSubmitting(true);
                    const result = await handleUpdateStudent(
                      editingStudent._id,
                      updatedData
                    );
                    if (result) {
                      handleCloseEditStudentDialog();
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
                onCancel={handleCloseEditStudentDialog}
                submitting={submitting}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Batches;
