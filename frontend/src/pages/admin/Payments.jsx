import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  paymentService,
  studentService,
  batchService,
} from "../../services/api";
import RefreshButton from "../../components/common/RefreshButton";

const validationSchema = Yup.object({
  studentId: Yup.string().required("Student is required"),
  classId: Yup.string().required("Class is required"),
  amount: Yup.number()
    .required("Amount is required")
    .min(0, "Amount cannot be negative"),
  paymentDate: Yup.date().required("Payment date is required"),
  paymentMethod: Yup.string().required("Payment method is required"),
  status: Yup.string().required("Status is required"),
  notes: Yup.string(),
});

function Payments() {
  const [payments, setPayments] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchPayments();
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getAll();
      console.log("Payments API Response:", response);

      // Handle different possible response formats
      let paymentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          paymentsData = response.data;
        } else if (Array.isArray(response.data.payments)) {
          paymentsData = response.data.payments;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          paymentsData = response.data.data;
        }
      }

      console.log("Processed Payments Data:", paymentsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError(error.response?.data?.message || "Failed to fetch payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      console.log("Students API Response:", response);

      let studentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (Array.isArray(response.data.students)) {
          studentsData = response.data.students;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
      }

      console.log("Processed Students Data:", studentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await batchService.getAll();
      console.log("Batches API Response:", response);

      let classesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (Array.isArray(response.data.batches)) {
          classesData = response.data.batches;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }
      }

      console.log("Processed Batches Data:", classesData);
      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setClasses([]);
    }
  };

  const handleOpen = (payment = null) => {
    setSelectedPayment(payment);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedPayment(null);
    setOpen(false);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (selectedPayment) {
        await paymentService.update(selectedPayment._id, values);
      } else {
        await paymentService.create(values);
      }
      fetchPayments();
      handleClose();
      resetForm();
    } catch (error) {
      console.error("Error saving payment:", error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await paymentService.delete(id);
        fetchPayments();
      } catch (error) {
        console.error("Error deleting payment:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    fetchPayments();
    fetchStudents();
    fetchClasses();
  }, []);

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
            Payments
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh payments data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Add Payment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{payment.studentId}</TableCell>
                <TableCell>{payment.classId}</TableCell>
                <TableCell>₹{payment.amount}</TableCell>
                <TableCell>
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <Chip
                    label={payment.status}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(payment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(payment._id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton>
                    <ReceiptIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPayment ? "Edit Payment" : "Add New Payment"}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              studentId: selectedPayment?.studentId || "",
              classId: selectedPayment?.classId || "",
              amount: selectedPayment?.amount || "",
              paymentDate: selectedPayment?.paymentDate || "",
              paymentMethod: selectedPayment?.paymentMethod || "",
              status: selectedPayment?.status || "",
              notes: selectedPayment?.notes || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, resetForm }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="studentId"
                      label="Student"
                      value={selectedPayment?.studentId || ""}
                      onChange={(e) => {
                        // Handle student change
                      }}
                      error={
                        selectedPayment &&
                        Boolean(selectedPayment.errors?.studentId)
                      }
                      helperText={
                        selectedPayment && selectedPayment.errors?.studentId
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="classId"
                      label="Class"
                      value={selectedPayment?.classId || ""}
                      onChange={(e) => {
                        // Handle class change
                      }}
                      error={
                        selectedPayment &&
                        Boolean(selectedPayment.errors?.classId)
                      }
                      helperText={
                        selectedPayment && selectedPayment.errors?.classId
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="amount"
                      label="Amount"
                      type="number"
                      value={selectedPayment?.amount || ""}
                      onChange={(e) => {
                        // Handle amount change
                      }}
                      error={
                        selectedPayment &&
                        Boolean(selectedPayment.errors?.amount)
                      }
                      helperText={
                        selectedPayment && selectedPayment.errors?.amount
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="paymentDate"
                      label="Payment Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={selectedPayment?.paymentDate || ""}
                      onChange={(e) => {
                        // Handle payment date change
                      }}
                      error={
                        selectedPayment &&
                        Boolean(selectedPayment.errors?.paymentDate)
                      }
                      helperText={
                        selectedPayment && selectedPayment.errors?.paymentDate
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      name="paymentMethod"
                      label="Payment Method"
                      value={selectedPayment?.paymentMethod || ""}
                      onChange={(e) => {
                        // Handle payment method change
                      }}
                      error={
                        selectedPayment &&
                        Boolean(selectedPayment.errors?.paymentMethod)
                      }
                      helperText={
                        selectedPayment && selectedPayment.errors?.paymentMethod
                      }
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                      <MenuItem value="bank">Bank Transfer</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      name="status"
                      label="Status"
                      value={selectedPayment?.status || ""}
                      onChange={(e) => {
                        // Handle status change
                      }}
                      error={
                        selectedPayment &&
                        Boolean(selectedPayment.errors?.status)
                      }
                      helperText={
                        selectedPayment && selectedPayment.errors?.status
                      }
                    >
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="failed">Failed</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="notes"
                      label="Notes"
                      multiline
                      rows={2}
                      value={selectedPayment?.notes || ""}
                      onChange={(e) => {
                        // Handle notes change
                      }}
                      error={
                        selectedPayment &&
                        Boolean(selectedPayment.errors?.notes)
                      }
                      helperText={
                        selectedPayment && selectedPayment.errors?.notes
                      }
                    />
                  </Grid>
                </Grid>
                <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {selectedPayment ? "Update" : "Add"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Payments;
