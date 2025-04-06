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
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { staffService } from "../services/api";
import RefreshButton from "../components/RefreshButton";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  role: Yup.string().required("Role is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  joiningDate: Yup.date().required("Joining date is required"),
  salary: Yup.number()
    .required("Salary is required")
    .positive("Salary must be positive"),
  status: Yup.string().required("Status is required"),
  department: Yup.string().required("Department is required"),
  permissions: Yup.array().of(Yup.string()),
  reportingTo: Yup.string(),
});

const staffRoles = [
  {
    value: "admin",
    label: "Administrator",
    description: "Full system access and management",
  },
  {
    value: "receptionist",
    label: "Receptionist",
    description: "Front desk and student management",
  },
  {
    value: "accountant",
    label: "Accountant",
    description: "Financial management and billing",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    description: "Facility and equipment maintenance",
  },
  {
    value: "librarian",
    label: "Librarian",
    description: "Library and resource management",
  },
  {
    value: "counselor",
    label: "Counselor",
    description: "Student guidance and support",
  },
];

const departments = [
  "Administration",
  "Academic",
  "Finance",
  "Operations",
  "Student Services",
  "Library",
  "IT",
  "HR",
];

const permissions = [
  "View Students",
  "Edit Students",
  "View Classes",
  "Edit Classes",
  "View Payments",
  "Edit Payments",
  "View Reports",
  "Manage Staff",
  "Manage Settings",
];

function Staff() {
  const [staff, setStaff] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffService.getAll();
      console.log("Staff API Response:", response);

      // Handle different possible response formats
      let staffData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          staffData = response.data;
        } else if (Array.isArray(response.data.staff)) {
          staffData = response.data.staff;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          staffData = response.data.data;
        }
      }

      console.log("Processed Staff Data:", staffData);
      setStaff(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setError(error.response?.data?.message || "Failed to fetch staff");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (staffMember = null) => {
    setSelectedStaff(staffMember);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedStaff(null);
    setOpen(false);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (selectedStaff) {
        await staffService.update(selectedStaff._id, values);
      } else {
        await staffService.create(values);
      }
      fetchStaff();
      handleClose();
      resetForm();
    } catch (error) {
      console.error("Error saving staff member:", error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await staffService.delete(id);
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff member:", error);
      }
    }
  };

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    fetchStaff();
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
            Staff Management
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh staff data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Add Staff Member
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Joining Date</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              staff.map((staffMember) => (
                <TableRow key={staffMember._id}>
                  <TableCell>{staffMember.name}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {staffRoles.find((r) => r.value === staffMember.role)
                          ?.label || staffMember.role}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {
                          staffRoles.find((r) => r.value === staffMember.role)
                            ?.description
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{staffMember.department}</TableCell>
                  <TableCell>{staffMember.email}</TableCell>
                  <TableCell>{staffMember.phone}</TableCell>
                  <TableCell>
                    {new Date(staffMember.joiningDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>₹{staffMember.salary}</TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.status}
                      color={
                        staffMember.status === "active" ? "success" : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(staffMember)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(staffMember._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              name: selectedStaff?.name || "",
              role: selectedStaff?.role || "",
              department: selectedStaff?.department || "",
              email: selectedStaff?.email || "",
              phone: selectedStaff?.phone || "",
              joiningDate: selectedStaff?.joiningDate
                ? new Date(selectedStaff.joiningDate)
                    .toISOString()
                    .split("T")[0]
                : "",
              salary: selectedStaff?.salary || "",
              status: selectedStaff?.status || "",
              permissions: selectedStaff?.permissions || [],
              reportingTo: selectedStaff?.reportingTo || "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
            }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      name="role"
                      label="Role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.role && Boolean(errors.role)}
                      helperText={touched.role && errors.role}
                    >
                      {staffRoles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          <Box>
                            <Typography variant="body2">
                              {role.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {role.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      name="department"
                      label="Department"
                      value={values.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.department && Boolean(errors.department)}
                      helperText={touched.department && errors.department}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="joiningDate"
                      label="Joining Date"
                      type="date"
                      value={values.joiningDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.joiningDate && Boolean(errors.joiningDate)}
                      helperText={touched.joiningDate && errors.joiningDate}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="salary"
                      label="Salary"
                      type="number"
                      value={values.salary}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.salary && Boolean(errors.salary)}
                      helperText={touched.salary && errors.salary}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      name="status"
                      label="Status"
                      value={values.status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.status && Boolean(errors.status)}
                      helperText={touched.status && errors.status}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="on_leave">On Leave</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      multiple
                      name="permissions"
                      label="Permissions"
                      value={values.permissions}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.permissions && Boolean(errors.permissions)}
                      helperText={touched.permissions && errors.permissions}
                    >
                      {permissions.map((permission) => (
                        <MenuItem key={permission} value={permission}>
                          {permission}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="reportingTo"
                      label="Reports To"
                      value={values.reportingTo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.reportingTo && Boolean(errors.reportingTo)}
                      helperText={touched.reportingTo && errors.reportingTo}
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
                    {selectedStaff ? "Update" : "Add"}
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

export default Staff;
