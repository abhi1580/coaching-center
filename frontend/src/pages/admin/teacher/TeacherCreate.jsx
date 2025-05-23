import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import {
    Box,
    Button,
    Typography,
    Grid,
    TextField,
    MenuItem,
    FormControl,
    FormHelperText,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
    Paper,
    Breadcrumbs,
    CircularProgress,
    InputAdornment,
    Alert,
    Autocomplete,
    Chip,
    Select,
    InputLabel,
    OutlinedInput,
    ListItemText,
    Checkbox,
    IconButton,
} from "@mui/material";
import {
    Person as PersonIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    CalendarMonth as CalendarMonthIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { createTeacher } from "../../../store/slices/teacherSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import Swal from 'sweetalert2';

const TeacherCreate = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    const { loading, error } = useSelector((state) => state.teachers);
    const { subjects } = useSelector((state) => state.subjects);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        dispatch(fetchSubjects());
    }, [dispatch]);

    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(50, "Name must be less than 50 characters")
            .required("Name is required"),
        email: Yup.string()
            .email("Invalid email address format")
            .matches(/@[^.]*\./, "Email must include a domain (e.g., @example.com)")
            .required("Email is required"),
        phone: Yup.string()
            .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
            .required("Phone number is required"),
        gender: Yup.string()
            .oneOf(["male", "female", "other"], "Please select a valid gender")
            .required("Gender is required"),
        qualification: Yup.string()
            .trim()
            .min(2, "Qualification must be at least 2 characters")
            .max(100, "Qualification must be less than 100 characters")
            .required("Qualification is required"),
        experience: Yup.number()
            .typeError("Experience must be a number")
            .min(0, "Experience cannot be negative")
            .max(50, "Experience must be less than 50 years")
            .required("Experience is required"),
        joiningDate: Yup.date()
            .max(new Date(), "Joining date cannot be in the future")
            .required("Joining date is required"),
        status: Yup.string()
            .oneOf(["active", "inactive"], "Please select a valid status")
            .required("Status is required"),
        address: Yup.string()
            .trim()
            .min(5, "Address must be at least 5 characters")
            .max(200, "Address must be less than 200 characters")
            .required("Address is required"),
        salary: Yup.number()
            .typeError("Salary must be a number")
            .positive("Salary must be a positive number")
            .required("Salary is required"),
        subjects: Yup.array()
            .min(1, "At least one subject is required")
            .required("Please assign at least one subject"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .max(30, "Password must be less than 30 characters")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            )
            .required("Password is required"),
    });

    const initialValues = {
        name: "",
        email: "",
        phone: "",
        gender: "male",
        qualification: "",
        experience: "",
        joiningDate: new Date().toISOString().split("T")[0],
        status: "active",
        address: "",
        salary: "",
        subjects: [],
        password: "",
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setSubmitError(null);
            setSubmitSuccess(false);

            // Create new teacher
            await dispatch(createTeacher(values)).unwrap();

            // Show success alert with SweetAlert
            Swal.fire({
                icon: 'success',
                title: 'Teacher Created!',
                text: `${values.name} has been successfully added as a teacher.`,
                showConfirmButton: true,
                confirmButtonColor: theme.palette.primary.main,
                timer: 3000
            });

            // Reset form after successful submission
            resetForm();

            // Set success state for in-page notification
            setSubmitSuccess(true);

            // Navigate to teachers list after delay
            setTimeout(() => {
                navigate("/app/teachers");
            }, 1500);
        } catch (error) {
            console.error("Error creating teacher:", error);

            // Show error alert with SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Error Creating Teacher',
                text: error.message || 'An unknown error occurred while creating the teacher.',
                confirmButtonColor: theme.palette.primary.main
            });

            setSubmitError(error.message || "Failed to create teacher. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{ mb: 2, mt: 1 }}
                separator="›"
            >
                <RouterLink
                    to="/app/dashboard"
                    style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Dashboard
                </RouterLink>
                <RouterLink
                    to="/app/teachers"
                    style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                >
                    <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Teachers
                </RouterLink>
                <Typography color="text.primary">
                    Add New Teacher
                </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? theme.palette.grey[800]
                        : theme.palette.grey[50],
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 1
                    }}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    Add New Teacher
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Fill in the details to create a new teacher account
                </Typography>
            </Paper>

            {submitSuccess && (
                <Alert
                    severity="success"
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    Teacher created successfully!
                </Alert>
            )}

            {submitError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    {submitError}
                </Alert>
            )}

            {/* Create Form */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
                        <Form>
                            <Grid container spacing={3}>
                                {/* Personal Information Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                                        Personal Information
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="name"
                                        name="name"
                                        label="Full Name"
                                        variant="outlined"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="gender"
                                        name="gender"
                                        label="Gender"
                                        select
                                        variant="outlined"
                                        value={values.gender}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.gender && Boolean(errors.gender)}
                                        helperText={touched.gender && errors.gender}
                                        disabled={isSubmitting}
                                        required
                                    >
                                        <MenuItem value="">Select Gender</MenuItem>
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email Address"
                                        variant="outlined"
                                        type="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="phone"
                                        name="phone"
                                        label="Phone Number"
                                        variant="outlined"
                                        value={values.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.phone && Boolean(errors.phone)}
                                        helperText={touched.phone && errors.phone}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="password"
                                        name="password"
                                        label="Password"
                                        variant="outlined"
                                        type={showPassword ? "text" : "password"}
                                        value={values.password}
                                        onChange={handleChange}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={touched.password && errors.password ? errors.password :
                                            "Password must contain at least 6 characters, one uppercase letter, one lowercase letter, and one number"}
                                        disabled={isSubmitting}
                                        required
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="address"
                                        name="address"
                                        label="Address"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        value={values.address}
                                        onChange={handleChange}
                                        error={touched.address && Boolean(errors.address)}
                                        helperText={touched.address && errors.address}
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                {/* Professional Information Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 2 }}>
                                        Professional Information
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="qualification"
                                        name="qualification"
                                        label="Qualification"
                                        variant="outlined"
                                        value={values.qualification}
                                        onChange={handleChange}
                                        error={touched.qualification && Boolean(errors.qualification)}
                                        helperText={touched.qualification && errors.qualification}
                                        disabled={isSubmitting}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="experience"
                                        name="experience"
                                        label="Experience (years)"
                                        variant="outlined"
                                        type="number"
                                        value={values.experience}
                                        onChange={handleChange}
                                        error={touched.experience && Boolean(errors.experience)}
                                        helperText={touched.experience && errors.experience}
                                        disabled={isSubmitting}
                                        InputProps={{ inputProps: { min: 0 } }}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="salary"
                                        name="salary"
                                        label="Salary"
                                        type="number"
                                        variant="outlined"
                                        value={values.salary}
                                        onChange={handleChange}
                                        error={touched.salary && Boolean(errors.salary)}
                                        helperText={touched.salary && errors.salary}
                                        disabled={isSubmitting}
                                        InputProps={{ inputProps: { min: 0 } }}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        id="joiningDate"
                                        name="joiningDate"
                                        label="Joining Date"
                                        variant="outlined"
                                        type="date"
                                        value={values.joiningDate}
                                        onChange={handleChange}
                                        error={touched.joiningDate && Boolean(errors.joiningDate)}
                                        helperText={touched.joiningDate && errors.joiningDate}
                                        disabled={isSubmitting}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="status"
                                        name="status"
                                        label="Status"
                                        select
                                        variant="outlined"
                                        value={values.status}
                                        onChange={handleChange}
                                        error={touched.status && Boolean(errors.status)}
                                        helperText={touched.status && errors.status}
                                        disabled={isSubmitting}
                                    >
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                    </TextField>
                                </Grid>

                                {/* Subject Assignment */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 2 }}>
                                        Subject Assignment
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl
                                        fullWidth
                                        error={touched.subjects && Boolean(errors.subjects)}
                                    >
                                        <InputLabel id="subjects-label">Assigned Subjects</InputLabel>
                                        <Select
                                            labelId="subjects-label"
                                            id="subjects"
                                            name="subjects"
                                            multiple
                                            value={values.subjects}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            input={<OutlinedInput label="Assigned Subjects" />}
                                            renderValue={(selected) => {
                                                if (!subjects) return "Loading subjects...";
                                                return selected
                                                    .map(
                                                        (value) =>
                                                            subjects.find((subject) => subject._id === value)?.name ||
                                                            value
                                                    )
                                                    .join(", ");
                                            }}
                                            disabled={isSubmitting || !subjects}
                                        >
                                            {subjects && subjects.map((subject) => (
                                                <MenuItem key={subject._id} value={subject._id}>
                                                    <Checkbox checked={values.subjects.indexOf(subject._id) > -1} />
                                                    <ListItemText primary={subject.name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>
                                            {touched.subjects && errors.subjects ? errors.subjects :
                                                "Select subjects that will be taught by this teacher"}
                                        </FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate("/app/teachers")}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <AddIcon />}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Creating..." : "Create Teacher"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Form>
                    )}
                </Formik>
            </Paper>
        </Box>
    );
};

export default TeacherCreate; 