import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useSelector } from "react-redux";

function TeacherStudents() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // console.log(filteredStudents);
  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        // First try the dedicated students endpoint
        try {
          const studentsUrl = import.meta.env.VITE_API_URL
              ? import.meta.env.VITE_API_URL + "/teacher/students"
              : "http://localhost:5000/api/teacher/students";
              
          const studentsResponse = await axios.get(
            studentsUrl, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log("Direct students API response:", studentsResponse);
          const studentsData = studentsResponse.data?.data || studentsResponse.data || [];
          
          if (Array.isArray(studentsData) && studentsData.length > 0) {
            console.log(`Received ${studentsData.length} students directly from students endpoint`);
            
            // Make sure each student has the correct batch info structure
            const processedStudents = studentsData.map(student => {
              // Log the student structure to debug
              console.log("Student data:", student);
              
              // Check if student already has proper batches array
              if (student.batches && Array.isArray(student.batches)) {
                console.log(`Student ${student.name} has ${student.batches.length} batches`);
                return student;
              }
              
              // If student has batchInfo but no batches array, create it
              if (student.batchInfo && !student.batches) {
                console.log(`Converting batchInfo to batches array for ${student.name}`);
                return {
                  ...student,
                  batches: [student.batchInfo]
                };
              }
              
              // Fallback case - if neither structure exists
              return student;
            });
            
            setStudents(processedStudents);
            setFilteredStudents(processedStudents);
            setLoading(false);
            return; // Exit early if we got students directly
          } else {
            console.log("No students returned from direct endpoint, falling back to processing from batches");
          }
        } catch (err) {
          console.log("Error fetching from students endpoint, falling back to processing from batches:", err);
        }

        // Fall back to getting students from batches if direct endpoint fails
        const url = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL + "/teacher/batches"
            : "http://localhost:5000/api/teacher/batches";
        const batchesResponse = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

        // Debug what we're getting from the API
        console.log("API batches response:", batchesResponse);
        console.log("Raw batches data:", batchesResponse.data.data || batchesResponse.data || []);
        console.log("Students in batches:", 
          (batchesResponse.data.data || batchesResponse.data || []).map(
            batch => ({ 
              name: batch.name, 
              studentsCount: batch.enrolledStudents ? batch.enrolledStudents.length : 0,
              firstStudent: batch.enrolledStudents && batch.enrolledStudents.length > 0 
                ? batch.enrolledStudents[0] 
                : 'No students'
            })
          )
        );

        // Safely get batches data from response, ensuring it's an array
        const batchesData =
          batchesResponse.data?.data || batchesResponse.data || [];
        const batches = Array.isArray(batchesData) ? batchesData : [];
        
        console.log(`TeacherStudents: Received ${batches.length} batches`);
        
        if (batches.length > 0) {
          batches.forEach((batch, i) => {
            console.log(`Batch ${i+1} (${batch.name}): ${batch.enrolledStudents ? batch.enrolledStudents.length : 0} students`);
          });
        }

        // Extract and deduplicate students from all batches
        const uniqueStudentsMap = new Map();

        batches.forEach((batch) => {
          // Make sure batch and enrolledStudents exist and are valid
          if (
            batch &&
            batch.enrolledStudents &&
            Array.isArray(batch.enrolledStudents)
          ) {
            console.log(`Processing ${batch.enrolledStudents.length} students in batch ${batch.name}`);
            
            batch.enrolledStudents.forEach((student) => {
              // Skip if student is missing or doesn't have an id
              if (!student || !student._id) {
                console.log("Found invalid student without _id");
                return;
              }

              // Add batch info to student
              const batchInfo = {
                id: batch._id || "unknown",
                name: batch.name || "Unnamed Batch",
                subject: batch.subject?.name || "Not specified",
                standard: batch.standard?.name || "Not specified",
              };
              
              const studentWithBatch = {
                ...student,
                batchInfo
              };

              if (!uniqueStudentsMap.has(student._id)) {
                // First time seeing this student, add with first batch
                studentWithBatch.batches = [batchInfo];
                uniqueStudentsMap.set(student._id, studentWithBatch);
              } else {
                // Add this batch to existing student's batches array
                const existingStudent = uniqueStudentsMap.get(student._id);
                if (!existingStudent.batches) {
                  existingStudent.batches = [batchInfo];
                } else {
                  existingStudent.batches.push(batchInfo);
                }
                uniqueStudentsMap.set(student._id, existingStudent);
              }
            });
          } else {
            console.log(`Batch has invalid enrolledStudents: ${JSON.stringify(batch.enrolledStudents)}`);
          }
        });

        // Convert map to array
        const uniqueStudents = Array.from(uniqueStudentsMap.values());
        console.log(`Processed ${uniqueStudents.length} unique students`);
        console.log("First student with batches:", uniqueStudents.length > 0 ? uniqueStudents[0] : "No students");
        
        setStudents(uniqueStudents);
        setFilteredStudents(uniqueStudents);
        setError(null);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError(err.response?.data?.message || "Failed to load students data");
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
        student.batchInfo?.subject?.toLowerCase().includes(query) ||
        student.batchInfo?.standard?.toLowerCase().includes(query)
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '100%' }}>
      {filteredStudents.map((student) => (
        <Card 
          key={student._id} 
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden', 
            width: '100%',
            bgcolor: theme.palette.background.paper,
            boxShadow: 1
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Avatar 
                sx={{ 
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.8),
                  mr: 2,
                  width: 40,
                  height: 40,
                  flexShrink: 0
                }}
              >
                {getInitials(student.name)}
              </Avatar>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1rem', 
                  fontWeight: 'medium'
                }}
              >
                {student.name}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 1.5 }} />
            
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <EmailIcon 
                    fontSize="small" 
                    sx={{ mr: 1, color: 'text.secondary', flexShrink: 0, mt: 0.3 }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      wordBreak: 'break-word', 
                      fontSize: '0.875rem'
                    }}
                  >
                    {student.email}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <PhoneIcon 
                    fontSize="small" 
                    sx={{ mr: 1, color: 'text.secondary', flexShrink: 0 }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {student.phone || "N/A"}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 0.5, fontSize: '0.75rem', fontWeight: 'medium' }}
                >
                  ENROLLED IN
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {student.batches && student.batches.length > 0 ? (
                    student.batches.map((batch, index) => (
                      <Chip
                        key={index}
                        label={`${batch.name || 'Unnamed'} (${batch.subject || 'Unknown'})`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 0.5, maxWidth: '100%', overflow: 'hidden' }}
                      />
                    ))
                  ) : student.batchInfo ? (
                    <Chip
                      label={`${student.batchInfo.name || 'Unnamed'} (${student.batchInfo.subject || 'Unknown'})`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ maxWidth: '100%', overflow: 'hidden' }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">No batch information</Typography>
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
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: theme.palette.background.default,
            zIndex: -1,
          }
        }}
      >
        {/* Header section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
            borderRadius: 2,
            maxWidth: '100%'
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
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            View all students enrolled in your classes
          </Typography>
        </Paper>

        {/* Search bar */}
        <Paper sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          mb: 2, 
          borderRadius: 2, 
          maxWidth: '100%', 
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={isMobile ? "Search students..." : "Search students by name, email, or batch..."}
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
              maxWidth: '100%'
            }}
          >
            <PersonIcon
              color="disabled"
              sx={{ fontSize: { xs: 36, sm: 48 }, mb: 2, opacity: 0.6 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              No students found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {students.length === 0
                ? "You don't have any students enrolled in your batches yet."
                : "No students match your search criteria."}
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2, 
            width: '100%',
            maxWidth: '100%',
            bgcolor: theme.palette.background.paper,
            overflow: 'hidden'
          }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: "primary.main",
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Students ({filteredStudents.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {isMobile ? (
              <StudentMobileList />
            ) : (
              <TableContainer sx={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
                <Table sx={{ minWidth: { xs: 'auto', sm: 650 }, tableLayout: 'fixed' }}>
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
                        <TableCell sx={{ wordBreak: 'break-word' }}>
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
                            <Typography sx={{ wordBreak: 'break-word' }}>{student.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <EmailIcon
                              fontSize="small"
                              sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }}
                            />
                            <Typography sx={{ wordBreak: 'break-word' }}>{student.email}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PhoneIcon
                              fontSize="small"
                              sx={{ mr: 1, color: "text.secondary", flexShrink: 0 }}
                            />
                            <Typography sx={{ wordBreak: 'break-word' }}>{student.phone || "N/A"}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ wordBreak: 'break-word' }}>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {student.batches ? (
                              student.batches.map((batch, index) => (
                                <Chip
                                  key={index}
                                  label={`${batch.name || 'Unnamed'} (${batch.subject || 'Unknown'})`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mb: 0.5, maxWidth: '100%', overflow: 'hidden' }}
                                />
                              ))
                            ) : student.batchInfo ? (
                              <Chip
                                label={`${student.batchInfo.name || 'Unnamed'} (${student.batchInfo.subject || 'Unknown'})`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ maxWidth: '100%', overflow: 'hidden' }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">No batch info</Typography>
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
