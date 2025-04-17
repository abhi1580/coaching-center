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

        // Extract and deduplicate students from all batches
        const uniqueStudentsMap = new Map();

        batches.forEach((batch) => {
          // Make sure batch and enrolledStudents exist and are valid
          if (
            batch &&
            batch.enrolledStudents &&
            Array.isArray(batch.enrolledStudents)
          ) {
            batch.enrolledStudents.forEach((student) => {
              // Skip if student is missing or doesn't have an id
              if (!student || !student._id) return;

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
          }
        });

        // Convert map to array
        const uniqueStudents = Array.from(uniqueStudentsMap.values());
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 600,
            color: "primary.main",
            mb: 1,
          }}
        >
          My Students
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View all students enrolled in your classes
        </Typography>
      </Paper>

      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search students by name, email, or batch..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
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
            p: 3,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
          }}
        >
          <PersonIcon
            color="disabled"
            sx={{ fontSize: 48, mb: 2, opacity: 0.6 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {students.length === 0
              ? "You don't have any students enrolled in your batches yet."
              : "No students match your search criteria."}
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
          >
            Students ({filteredStudents.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Batches</TableCell>
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
                    <TableCell>
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
                        <Typography>{student.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <EmailIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        {student.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PhoneIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        {student.phone || "N/A"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {student.batches ? (
                          student.batches.map((batch, index) => (
                            <Chip
                              key={index}
                              label={`${batch.name} (${batch.subject})`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Chip
                            label={`${student.batchInfo.name} (${student.batchInfo.subject})`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default TeacherStudents;
