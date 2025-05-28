import { useState, useEffect } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  FormHelperText,
  LinearProgress,
  Tooltip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import InfoIcon from "@mui/icons-material/Info";
import { IMaskInput } from "react-imask";
import React from "react";

// Custom masked input component
const MaskedInput = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={props.mask}
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => {
        // Remove spaces before sending the value
        const cleanValue = value.replace(/\s/g, "");
        onChange({ target: { name: props.name, value: cleanValue } });
      }}
      overwrite
    />
  );
});

const steps = [
  "Personal Information",
  "Academic Details",
  "Contact Information",
  "Preview & Submit",
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

// Validation Schema
const validationSchema = Yup.object().shape({
  // Personal Information
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name should only contain letters and spaces")
    .required("Name is required"),
  motherName: Yup.string()
    .trim()
    .min(2, "Mother's name must be at least 2 characters")
    .max(50, "Mother's name must be less than 50 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name should only contain letters and spaces")
    .required("Mother's name is required"),
  fatherOccupation: Yup.string()
    .trim()
    .min(2, "Occupation must be at least 2 characters")
    .max(50, "Occupation must be less than 50 characters")
    .required("Father's occupation is required"),
  gender: Yup.string()
    .oneOf(["Male", "Female", "Other"], "Please select a valid gender")
    .required("Gender is required"),
  dob: Yup.date()
    .required("Date of birth is required")
    .test("age", "Age should be between 5 and 25 years", function (value) {
      if (!value) return false;
      const dob = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 14 && age <= 35;
    }),

  // Academic Details
  class: Yup.string()
    .oneOf(["11", "12"], "Please select a valid class")
    .required("Class is required"),
  subject: Yup.string()
    .oneOf(
      ["Physics", "Chemistry", "Biology", "Mathematics"],
      "Please select a valid subject"
    )
    .required("Subject is required"),
  medium: Yup.string()
    .oneOf(
      ["Marathi", "Semi-English", "English", "CBSE", "ICSE"],
      "Please select a valid medium"
    )
    .required("Medium is required"),
  percentage: Yup.number()
    .typeError("Percentage must be a number")
    .min(35, "Percentage cannot be less than 35")
    .max(100, "Percentage cannot exceed 100")
    .required("Percentage is required"),

  // Contact Information
  aadhar: Yup.string()
    .matches(/^\d{12}$/, "Aadhar number must be exactly 12 digits")
    .required("Aadhar number is required")
    .transform((value) => value?.replace(/\s/g, "")),
  parentsPhone: Yup.string()
    .matches(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit phone number starting with 6-9"
    )
    .required("Parent's phone number is required")
    .transform((value) => value?.replace(/\s/g, "")),
  studentPhone: Yup.string()
    .matches(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit phone number starting with 6-9"
    )
    .required("Student's phone number is required")
    .transform((value) => value?.replace(/\s/g, "")),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  address: Yup.string()
    .min(10, "Address must be at least 10 characters")
    .required("Address is required"),
});

const initialValues = {
  // Personal Information
  name: "",
  motherName: "",
  fatherOccupation: "",
  gender: "",
  dob: "",

  // Academic Details
  class: "",
  subject: "",
  medium: "",
  percentage: "",

  // Contact Information
  aadhar: "",
  parentsPhone: "",
  studentPhone: "",
  email: "",
  address: "",
};

function Admission() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved form data
  const loadFormData = () => {
    const savedData = localStorage.getItem("admissionFormData");
    return savedData ? JSON.parse(savedData) : initialValues;
  };

  // Save form data
  const saveFormData = (values) => {
    localStorage.setItem("admissionFormData", JSON.stringify(values));
    Swal.fire({
      title: "Progress Saved!",
      text: "Your form progress has been saved.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  // Calculate form progress
  const getStepProgress = () => {
    return ((activeStep + 1) / steps.length) * 100;
  };

  // Handle form reset
  const handleReset = (resetForm) => {
    Swal.fire({
      title: "Reset Form?",
      text: "Are you sure you want to reset the form? All entered data will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset it!",
      cancelButtonText: "No, keep it",
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm();
        setActiveStep(0);
        localStorage.removeItem("admissionFormData");
      }
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const form = document.querySelector("form");
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]');
          const nextButton = form.querySelector('button:not([type="submit"])');
          if (activeStep === steps.length - 1) {
            submitButton?.click();
          } else {
            nextButton?.click();
          }
        }
      }
    };

    document.addEventListener("keypress", handleKeyPress);
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [activeStep]);

  const handleNext = (values, { setTouched, setErrors }) => {
    // Validate current step
    const currentStepFields = getStepFields(activeStep);
    const touchedFields = {};
    currentStepFields.forEach((field) => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);

    // Check if current step is valid
    const currentStepSchema = Yup.object().shape(
      currentStepFields.reduce((acc, field) => {
        acc[field] = validationSchema.fields[field];
        return acc;
      }, {})
    );

    currentStepSchema
      .validate(values, { abortEarly: false })
      .then(() => {
        // Move to next step
        setActiveStep((prevStep) => prevStep + 1);
      })
      .catch((err) => {
        // Set errors for the current step fields
        const stepErrors = {};
        err.inner.forEach((error) => {
          if (currentStepFields.includes(error.path)) {
            stepErrors[error.path] = error.message;
          }
        });
        setErrors(stepErrors);
      });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ["name", "motherName", "fatherOccupation", "gender", "dob"];
      case 1:
        return ["class", "subject", "medium", "percentage"];
      case 2:
        return ["aadhar", "parentsPhone", "studentPhone", "email", "address"];
      default:
        return [];
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted successfully:", values);

      Swal.fire({
        title: "Success!",
        text: "Your admission form has been submitted successfully.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#1976d2",
      }).then(() => {
        setSubmitSuccess(true);
        setSubmitting(false);
        resetForm();
        localStorage.removeItem("admissionFormData");
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveStep(0);
        }, 3000);
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#1976d2",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = (formikProps) => {
    const { values, submitForm, setErrors } = formikProps;
    validationSchema
      .validate(values, { abortEarly: false })
      .then(() => {
        submitForm();
      })
      .catch((err) => {
        const errors = {};
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setErrors(errors);

        Swal.fire({
          title: "Validation Error",
          text: "Please check all the fields and try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#1976d2",
        });
      });
  };

  const renderStepContent = (step, formikProps) => {
    const { values, errors, touched, handleChange, handleBlur } = formikProps;

    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Box
              sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}
            >
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter your full name as per official documents">
                        <IconButton>
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Mother's Name"
                name="motherName"
                value={values.motherName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.motherName && Boolean(errors.motherName)}
                helperText={touched.motherName && errors.motherName}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter your mother's full name">
                        <IconButton>
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Father's Occupation"
                name="fatherOccupation"
                value={values.fatherOccupation}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.fatherOccupation && Boolean(errors.fatherOccupation)
                }
                helperText={touched.fatherOccupation && errors.fatherOccupation}
                required
              />
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                name="dob"
                value={values.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.dob && Boolean(errors.dob)}
                helperText={touched.dob && errors.dob}
                required
                InputLabelProps={{ shrink: true }}
              />
              <FormControl
                error={touched.gender && Boolean(errors.gender)}
                required
              >
                <FormLabel>Gender</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                  />
                  <FormControlLabel
                    value="Other"
                    control={<Radio />}
                    label="Other"
                  />
                </RadioGroup>
                {touched.gender && errors.gender && (
                  <FormHelperText>{errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Academic Details
            </Typography>
            <Box
              sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}
            >
              <TextField
                select
                fullWidth
                label="Class"
                name="class"
                value={values.class}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.class && Boolean(errors.class)}
                helperText={touched.class && errors.class}
                required
              >
                <MenuItem value="11">Class 11</MenuItem>
                <MenuItem value="12">Class 12</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Subject"
                name="subject"
                value={values.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.subject && Boolean(errors.subject)}
                helperText={touched.subject && errors.subject}
                required
              >
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="Biology">Biology</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Medium"
                name="medium"
                value={values.medium}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.medium && Boolean(errors.medium)}
                helperText={touched.medium && errors.medium}
                required
              >
                <MenuItem value="Marathi">Marathi</MenuItem>
                <MenuItem value="Semi-English">Semi-English</MenuItem>
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="CBSE">CBSE</MenuItem>
                <MenuItem value="ICSE">ICSE</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Percentage in Last Year"
                name="percentage"
                type="number"
                value={values.percentage}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.percentage && Boolean(errors.percentage)}
                helperText={touched.percentage && errors.percentage}
                required
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box
              sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}
            >
              <TextField
                fullWidth
                label="Aadhar Number"
                name="aadhar"
                value={values.aadhar}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.aadhar && Boolean(errors.aadhar)}
                helperText={touched.aadhar && errors.aadhar}
                required
                InputProps={{
                  inputComponent: MaskedInput,
                  inputProps: {
                    mask: "0000 0000 0000",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter your 12-digit Aadhar number">
                        <IconButton>
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Parent's Phone"
                name="parentsPhone"
                value={values.parentsPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.parentsPhone && Boolean(errors.parentsPhone)}
                helperText={touched.parentsPhone && errors.parentsPhone}
                required
                InputProps={{
                  inputComponent: MaskedInput,
                  inputProps: {
                    mask: "0000000000",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter a valid 10-digit phone number">
                        <IconButton>
                          <InfoIcon color="action" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Student's Phone"
                name="studentPhone"
                value={values.studentPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.studentPhone && Boolean(errors.studentPhone)}
                helperText={touched.studentPhone && errors.studentPhone}
                required
              />
              <TextField
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
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={4}
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
                required
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview & Submit
            </Typography>
            <Box sx={{ display: "grid", gap: 3 }}>
              {/* Personal Information Section */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}
                >
                  Personal Information
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography>{values.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mother's Name
                    </Typography>
                    <Typography>{values.motherName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Father's Occupation
                    </Typography>
                    <Typography>{values.fatherOccupation}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography>
                      {new Date(values.dob).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography>{values.gender}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Academic Details Section */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}
                >
                  Academic Details
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Class
                    </Typography>
                    <Typography>Class {values.class}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Subject
                    </Typography>
                    <Typography>{values.subject}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Medium
                    </Typography>
                    <Typography>{values.medium}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Percentage in Last Year
                    </Typography>
                    <Typography>{values.percentage}%</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Contact Information Section */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}
                >
                  Contact Information
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: "1fr 1fr",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Aadhar Number
                    </Typography>
                    <Typography>{values.aadhar}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Parent's Phone
                    </Typography>
                    <Typography>{values.parentsPhone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Student's Phone
                    </Typography>
                    <Typography>{values.studentPhone}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography>{values.email}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: "span 2" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography>{values.address}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Instructions */}
              <Box sx={{ mt: 2, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
                <Typography variant="subtitle2" color="info.dark">
                  Please review all the information carefully before submitting.
                  You can go back to previous steps to make changes if needed.
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography variant="h4" align="center" gutterBottom>
          Admission Form
        </Typography>

        {/* Progress Indicator */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <LinearProgress variant="determinate" value={getStepProgress()} />
          <Typography
            variant="body2"
            color="text.secondary"
            align="right"
            sx={{ mt: 1 }}
          >
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Formik
          initialValues={loadFormData()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {(formikProps) => (
            <Form noValidate>
              {renderStepContent(activeStep, formikProps)}

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Box>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    type="button"
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleReset(formikProps.resetForm)}
                    type="button"
                  >
                    Reset Form
                  </Button>
                </Box>
                <Box>
                  {activeStep < steps.length - 1 ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => saveFormData(formikProps.values)}
                        sx={{ mr: 1 }}
                        type="button"
                      >
                        Save Progress
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          handleNext(formikProps.values, formikProps)
                        }
                        type="button"
                        disabled={isLoading}
                      >
                        Next
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleFinalSubmit(formikProps)}
                      disabled={isLoading}
                      type="button"
                    >
                      {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </StyledPaper>
    </Container>
  );
}

export default Admission;
