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

        // First get all batches for the teacher
        const batchesResponse = await axios.get(
          `${
            import.meta.env.VITE_API_URL
              ? import.meta.env.VITE_API_URL + "/teachers/batches"
              : "http://localhost:5000/api/teachers/batches"
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
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
              const studentWithBatch = {
                ...student,
                batchInfo: {
                  id: batch._id || "unknown",
                  name: batch.name || "Unnamed Batch",
                  subject: batch.subject?.name || "Not specified",
                  standard: batch.standard?.name || "Not specified",
                },
              };

              if (!uniqueStudentsMap.has(student._id)) {
                uniqueStudentsMap.set(student._id, studentWithBatch);
              } else {
                // If student already exists, add this batch to their batches array
                const existingStudent = uniqueStudentsMap.get(student._id);
                if (!existingStudent.batches) {
                  existingStudent.batches = [existingStudent.batchInfo];
                }

                existingStudent.batches.push(studentWithBatch.batchInfo);
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
                  {student.batches ? (
                    student.batches.map((batch, index) => (
                      <Chip
                        key={index}
                        label={`${batch.name} (${batch.subject})`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 0.5, maxWidth: '100%', overflow: 'hidden' }}
                      />
                    ))
                  ) : (
                    <Chip
                      label={`${student.batchInfo.name} (${student.batchInfo.subject})`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ maxWidth: '100%', overflow: 'hidden' }}
                    />
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
                                  label={`${batch.name} (${batch.subject})`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mb: 0.5, maxWidth: '100%', overflow: 'hidden' }}
                                />
                              ))
                            ) : (
                              <Chip
                                label={`${student.batchInfo.name} (${student.batchInfo.subject})`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ maxWidth: '100%', overflow: 'hidden' }}
                              />
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
