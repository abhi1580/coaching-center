import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  CssBaseline,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import api from "../../services/common/apiClient";

function TeacherStudents() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to fetch from students endpoint
        try {
          const response = await api.get("/teacher/students");
          const studentsData = response.data.data || response.data || [];
          setStudents(studentsData);
          setFilteredStudents(studentsData);
        } catch (err) {
          console.error("Error fetching from students endpoint, falling back to processing from batches:", err);
          
          // If students endpoint fails, fetch from batches and process
          const batchesResponse = await api.get("/teacher/batches", {
            params: {
              populate: "enrolledStudents"
            }
          });
          
          const batchesData = batchesResponse.data.data || batchesResponse.data || [];
          const allStudents = new Map();
          
          batchesData.forEach(batch => {
            if (batch.enrolledStudents && Array.isArray(batch.enrolledStudents)) {
              batch.enrolledStudents.forEach(student => {
                if (!allStudents.has(student._id)) {
                  allStudents.set(student._id, {
                    ...student,
                    batches: [{
                      id: batch._id,
                      name: batch.name,
                      subject: batch.subject?.name,
                      standard: batch.standard?.name
                    }]
                  });
                } else {
                  const existingStudent = allStudents.get(student._id);
                  existingStudent.batches.push({
                    id: batch._id,
                    name: batch.name,
                    subject: batch.subject?.name,
                    standard: batch.standard?.name
                  });
                }
              });
            }
          });
          
          const studentsArray = Array.from(allStudents.values());
          setStudents(studentsArray);
          setFilteredStudents(studentsArray);
        }

        // Extract unique standards and subjects for filters
        const uniqueStandards = [...new Set(students.map(student => 
          student.batches?.map(batch => batch.standard).filter(Boolean)
        ).flat())];
        
        const uniqueSubjects = [...new Set(students.map(student => 
          student.batches?.map(batch => batch.subject).filter(Boolean)
        ).flat())];

        setStandards(uniqueStandards);
        setSubjects(uniqueSubjects);

      } catch (err) {
        console.error("Error fetching student data:", err);
        setError(err.response?.data?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsData();
  }, [user]);

  // Apply search filter when search query changes
  useEffect(() => {
    if (!students.length) {
      setFilteredStudents([]);
      return;
    }

    if (!searchQuery) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.phone?.includes(query) ||
        student.batches?.some(batch => batch.standard?.name.toLowerCase().includes(query) || batch.subject?.name.toLowerCase().includes(query)) ||
        student.batches?.some(batch => batch.standard?.name.toLowerCase().includes(query) || batch.subject?.name.toLowerCase().includes(query))
    );

    setFilteredStudents(filtered);
  }, [students, searchQuery]);

  // Generate initials for Avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Mobile view for student list using Cards
  const StudentMobileList = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {filteredStudents.map((student) => (
        <Card
          key={student._id}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            width: "100%",
            bgcolor: theme.palette.background.paper,
            boxShadow: 1,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.8),
                  mr: 2,
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                {getInitials(student.name)}
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1rem",
                  fontWeight: "medium",
                }}
              >
                {student.name}
              </Typography>
            </Box>

            <Divider sx={{ mb: 1.5 }} />

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                  <EmailIcon
                    fontSize="small"
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                      flexShrink: 0,
                      mt: 0.3,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: "break-word",
                      fontSize: "0.875rem",
                    }}
                  >
                    {student.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                  <PhoneIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {student.phone || "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontSize: "0.75rem", fontWeight: "medium" }}
                >
                  ENROLLED IN
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {student.batches && student.batches.length > 0 ? (
                    student.batches.map((batch, index) => (
                      <Chip
                        key={index}
                        label={`${batch.name || "Unnamed"} (${
                          batch.subject || "Unknown"
                        })`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 0.5, maxWidth: "100%", overflow: "hidden" }}
                      />
                    ))
                  ) : student.batches?.some(batch => batch.standard?.name.toLowerCase().includes(query) || batch.subject?.name.toLowerCase().includes(query)) ? (
                    <Chip
                      label={`${student.batches[0].name || "Unnamed"} (${
                        student.batches[0].subject || "Unknown"
                      })`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ maxWidth: "100%", overflow: "hidden" }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No batch information
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          "&:after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: theme.palette.background.default,
            zIndex: -1,
          },
        }}
      >
        {/* Header section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 2,
            backgroundColor: (theme) =>
              alpha(theme.palette.primary.light, 0.05),
            borderRadius: 2,
            maxWidth: "100%",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              fontWeight: 600,
              color: "primary.main",
              mb: 1,
            }}
          >
            My Students
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            View all students enrolled in your classes
          </Typography>
        </Paper>

        {/* Search bar */}
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: 2,
            maxWidth: "100%",
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder={
              isMobile
                ? "Search students..."
                : "Search students by name, email, or batch..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize={isMobile ? "small" : "medium"} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
            size="small"
          />
        </Paper>

        {/* Students list */}
        {filteredStudents.length === 0 ? (
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              textAlign: "center",
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              maxWidth: "100%",
            }}
          >
            <PersonIcon
              color="disabled"
              sx={{ fontSize: { xs: 36, sm: 48 }, mb: 2, opacity: 0.6 }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              No students found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {students.length === 0
                ? "You don't have any students enrolled in your batches yet."
                : "No students match your search criteria."}
            </Typography>
          </Paper>
        ) : (
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              width: "100%",
              maxWidth: "100%",
              bgcolor: theme.palette.background.paper,
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "primary.main",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Students ({filteredStudents.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {isMobile ? (
              <StudentMobileList />
            ) : (
              <TableContainer
                sx={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}
              >
                <Table
                  sx={{
                    minWidth: { xs: "auto", sm: 650 },
                    tableLayout: "fixed",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell width="25%">Student</TableCell>
                      <TableCell width="25%">Email</TableCell>
                      <TableCell width="20%">Phone</TableCell>
                      <TableCell width="30%">Batches</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student._id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.light,
                              0.1
                            ),
                          },
                        }}
                      >
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.8),
                                mr: 2,
                              }}
                            >
                              {getInitials(student.name)}
                            </Avatar>
                            <Typography sx={{ wordBreak: "break-word" }}>
                              {student.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon
                              fontSize="small"
                              sx={{
                                mr: 1,
                                color: "text.secondary",
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ wordBreak: "break-word" }}>
                              {student.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PhoneIcon
                              fontSize="small"
                              sx={{
                                mr: 1,
                                color: "text.secondary",
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ wordBreak: "break-word" }}>
                              {student.phone || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ wordBreak: "break-word" }}>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {student.batches ? (
                              student.batches.map((batch, index) => (
                                <Chip
                                  key={index}
                                  label={`${batch.name || "Unnamed"} (${
                                    batch.subject || "Unknown"
                                  })`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    mb: 0.5,
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                  }}
                                />
                              ))
                            ) : student.batches?.some(batch => batch.standard?.name.toLowerCase().includes(query) || batch.subject?.name.toLowerCase().includes(query)) ? (
                              <Chip
                                label={`${student.batches[0].name || "Unnamed"} (${
                                  student.batches[0].subject || "Unknown"
                                })`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ maxWidth: "100%", overflow: "hidden" }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No batch info
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Box>
    </>
  );
}

export default TeacherStudents;
