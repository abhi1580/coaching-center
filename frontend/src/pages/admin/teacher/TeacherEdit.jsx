import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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
    Link,
    CircularProgress,
    InputAdornment,
    Alert,
    Autocomplete,
    Chip,
    IconButton,
} from "@mui/material";
import {
    Person as PersonIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    CalendarMonth as CalendarMonthIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
    fetchTeacherById,
    updateTeacher
} from "../../../store/slices/teacherSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import { teacherService } from "../../../services/api";
import Loader from "../../../components/Loader";

// Define validation schema
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
        .matches(/^[0-9]{10,15}$/, "Phone number must be between 10-15 digits")
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
        .nullable()
        .transform(value => (value === "" ? null : value))
        .test(
            'password-validation',
            value => value === null || value === undefined,
            () => true
        )
        .test(
            'password-validation',
            'Password must be at least 6 characters',
            value => value === null || value === undefined || value.length >= 6
        )
        .test(
            'password-validation',
            'Password must be less than 30 characters',
            value => value === null || value === undefined || value.length <= 30
        )
        .test(
            'password-validation',
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            value => {
                if (value === null || value === undefined || value === '') return true;
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
                return regex.test(value);
            }
        ),
});

const TeacherEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentTeacher, loading, error } = useSelector((state) => state.teachers);
    const { subjects } = useSelector((state) => state.subjects);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchTeacherById(id));
            dispatch(fetchSubjects());
        }
    }, [dispatch, id]);

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            setSubmitError(null);
            setSubmitSuccess(false);

            // Format data for API - ensure all values are properly included
            const teacherData = {
                name: values.name.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                gender: values.gender,
                qualification: values.qualification.trim(),
                experience: Number(values.experience),
                joiningDate: values.joiningDate instanceof Date
                    ? values.joiningDate.toISOString()
                    : values.joiningDate,
                status: values.status,
                address: values.address.trim(),
                salary: Number(values.salary),
                // Convert subject objects to IDs if needed
                subjects: values.subjects?.map(subject =>
                    typeof subject === 'object' ? subject._id : subject
                ),
            };

            // Only include password if it's provided and not empty
            if (values.password && values.password.trim() !== '') {
                teacherData.password = values.password;
            }

            // Update the teacher data with all fields including email
            const resultAction = await dispatch(updateTeacher({ id, data: teacherData }));

            if (updateTeacher.fulfilled.match(resultAction)) {
                console.log('Update successful:', resultAction.payload);
                // Refresh the teacher data after successful update
                dispatch(fetchTeacherById(id));
                setSubmitSuccess(true);
                // Navigate after a short delay to show success message
                setTimeout(() => {
                    navigate(`/app/teachers/${id}`);
                }, 1500);
            } else {
                console.error("Update failed:", resultAction);

                // Handle validation errors from backend
                if (resultAction.payload?.validationErrors) {
                    setErrors(resultAction.payload.validationErrors);
                }

                setSubmitError(resultAction.payload?.message || resultAction.error?.message || "Failed to update teacher");
            }
        } catch (error) {
            console.error("Unexpected error during update:", error);
            setSubmitError(error.message || "An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/app/teachers")}
                >
                    Back to Teachers
                </Button>
            </Box>
        );
    }

    if (!currentTeacher) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6">
                    Teacher not found
                </Typography>
                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/app/teachers")}
                >
                    Back to Teachers
                </Button>
            </Box>
        );
    }

    // Initial form values from the fetched teacher
    const initialValues = {
        name: currentTeacher.name || "",
        email: currentTeacher.email || "",
        phone: currentTeacher.phone || "",
        gender: currentTeacher.gender || "",
        qualification: currentTeacher.qualification || "",
        experience: currentTeacher.experience || "",
        joiningDate: currentTeacher.joiningDate ? new Date(currentTeacher.joiningDate) : null,
        status: currentTeacher.status || "active",
        address: currentTeacher.address || "",
        salary: currentTeacher.salary || "",
        subjects: currentTeacher.subjects || [],
        password: "", // Empty by default
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{ mb: 2, mt: 1 }}
                separator="›"
            >
                <Link
                    underline="hover"
                    color="inherit"
                    href="/app/dashboard"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Dashboard
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href="/app/teachers"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Teachers
                </Link>
                <Typography color="text.primary">
                    Edit {currentTeacher.name}
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
                    <PersonIcon sx={{ mr: 1 }} />
                    Edit Teacher
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Update information for {currentTeacher.name}
                </Typography>
            </Paper>

            {/* Success/Error Alerts */}
            {submitSuccess && (
                <Alert
                    severity="success"
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    Teacher information updated successfully!
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

            {/* Form */}
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                    <Form>
                        <Grid container spacing={3}>
                            {/* Personal Information Section */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        sx={{
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontWeight: 500
                                        }}
                                    >
                                        <PersonIcon sx={{ mr: 1 }} />
                                        Personal Information
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Full Name"
                                                name="name"
                                                value={values.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.name && Boolean(errors.name)}
                                                helperText={touched.name && errors.name}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl
                                                component="fieldset"
                                                error={touched.gender && Boolean(errors.gender)}
                                                sx={{ width: '100%' }}
                                            >
                                                <FormLabel component="legend">Gender</FormLabel>
                                                <RadioGroup
                                                    row
                                                    name="gender"
                                                    value={values.gender}
                                                    onChange={handleChange}
                                                >
                                                    <FormControlLabel
                                                        value="male"
                                                        control={<Radio />}
                                                        label="Male"
                                                    />
                                                    <FormControlLabel
                                                        value="female"
                                                        control={<Radio />}
                                                        label="Female"
                                                    />
                                                    <FormControlLabel
                                                        value="other"
                                                        control={<Radio />}
                                                        label="Other"
                                                    />
                                                </RadioGroup>
                                                {touched.gender && errors.gender && (
                                                    <FormHelperText>{errors.gender}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={values.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.email && Boolean(errors.email)}
                                                helperText={touched.email && errors.email}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Phone Number"
                                                name="phone"
                                                value={values.phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.phone && Boolean(errors.phone)}
                                                helperText={touched.phone && errors.phone}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Password (Optional - leave blank to keep unchanged)"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={values.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.password && Boolean(errors.password)}
                                                helperText={touched.password && errors.password ? errors.password :
                                                    "If provided, password must contain at least 6 characters, one uppercase letter, one lowercase letter, and one number"}
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
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Address"
                                                name="address"
                                                value={values.address}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.address && Boolean(errors.address)}
                                                helperText={touched.address && errors.address}
                                                multiline
                                                rows={3}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Professional Information Section */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        sx={{
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontWeight: 500
                                        }}
                                    >
                                        <SchoolIcon sx={{ mr: 1 }} />
                                        Professional Information
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Qualification"
                                                name="qualification"
                                                value={values.qualification}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.qualification && Boolean(errors.qualification)}
                                                helperText={touched.qualification && errors.qualification}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Experience (Years)"
                                                name="experience"
                                                type="number"
                                                value={values.experience}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.experience && Boolean(errors.experience)}
                                                helperText={touched.experience && errors.experience}
                                                InputProps={{
                                                    inputProps: { min: 0 }
                                                }}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker
                                                    label="Joining Date"
                                                    value={values.joiningDate}
                                                    onChange={(newValue) => {
                                                        setFieldValue('joiningDate', newValue);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            fullWidth
                                                            name="joiningDate"
                                                            error={touched.joiningDate && Boolean(errors.joiningDate)}
                                                            helperText={touched.joiningDate && errors.joiningDate}
                                                            required
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <CalendarMonthIcon />
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                select
                                                fullWidth
                                                label="Status"
                                                name="status"
                                                value={values.status}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.status && Boolean(errors.status)}
                                                helperText={touched.status && errors.status}
                                                required
                                            >
                                                <MenuItem value="active">Active</MenuItem>
                                                <MenuItem value="inactive">Inactive</MenuItem>
                                            </Field>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Field
                                                as={TextField}
                                                fullWidth
                                                label="Salary"
                                                name="salary"
                                                type="number"
                                                value={values.salary}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.salary && Boolean(errors.salary)}
                                                helperText={touched.salary && errors.salary}
                                                required
                                                InputProps={{
                                                    inputProps: { min: 0 },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Subject Assignment Section */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        sx={{
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontWeight: 500
                                        }}
                                    >
                                        <SchoolIcon sx={{ mr: 1 }} />
                                        Subject Assignment
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />

                                    <Autocomplete
                                        multiple
                                        id="subjects"
                                        options={subjects || []}
                                        value={values.subjects}
                                        getOptionLabel={(option) =>
                                            typeof option === 'object' ? option.name :
                                                subjects?.find(s => s._id === option)?.name || ''
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                            option._id === (typeof value === 'object' ? value._id : value)
                                        }
                                        onChange={(event, newValue) => {
                                            setFieldValue('subjects', newValue);
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Assigned Subjects"
                                                placeholder="Select subjects"
                                                error={touched.subjects && Boolean(errors.subjects)}
                                                helperText={touched.subjects && errors.subjects}
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    label={typeof option === 'object' ? option.name :
                                                        subjects?.find(s => s._id === option)?.name || ''}
                                                    {...getTagProps({ index })}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ))
                                        }
                                    />
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Form Actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate(`/app/teachers/${id}`)}
                                startIcon={<ArrowBackIcon />}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                                startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default TeacherEdit; 