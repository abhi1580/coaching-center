import Payment from "../models/Payment.js";
import { validateMongoDbId } from "../utils/validateMongoDbId.js";
import { handleError } from "../utils/errorHandler.js";

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("student", "name")
      .populate("class", "name")
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    handleError(res, error);
  }
};

// Get single payment
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const payment = await Payment.findById(id)
      .populate("student", "name")
      .populate("class", "name");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    handleError(res, error);
  }
};

// Get payments for a specific class
export const getClassPayments = async (req, res) => {
  try {
    const { classId } = req.params;
    validateMongoDbId(classId);
    const payments = await Payment.find({ class: classId })
      .populate("student", "name")
      .populate("class", "name")
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    handleError(res, error);
  }
};

// Get payments for a specific student
export const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    validateMongoDbId(studentId);
    const payments = await Payment.find({ student: studentId })
      .populate("student", "name")
      .populate("class", "name")
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    handleError(res, error);
  }
};

// Create payment
export const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    handleError(res, error);
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const payment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    handleError(res, error);
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
