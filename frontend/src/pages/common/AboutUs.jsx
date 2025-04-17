import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PsychologyIcon from "@mui/icons-material/Psychology";

const AboutUs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: "Quality Education",
      description:
        "We provide high-quality education with experienced teachers and modern teaching methods.",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: "Small Class Sizes",
      description:
        "Our small class sizes ensure personalized attention for every student.",
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: "Proven Track Record",
      description:
        "Consistently producing excellent results and helping students achieve their goals.",
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: "Holistic Development",
      description:
        "Focusing on both academic excellence and personal development of students.",
    },
  ];

  const teamMembers = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      image: "https://via.placeholder.com/150",
      bio: "John has over 15 years of experience in education and believes in transforming the traditional coaching methods through technology.",
    },
    {
      name: "Jane Smith",
      role: "Academic Director",
      image: "https://via.placeholder.com/150",
      bio: "With a PhD in Education, Jane oversees all academic programs and ensures quality teaching across all courses.",
    },
    {
      name: "Mike Johnson",
      role: "Technology Head",
      image: "https://via.placeholder.com/150",
      bio: "Mike leads our technology initiatives, ensuring seamless digital experiences for students and teachers alike.",
    },
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            mb: { xs: 3, md: 6 },
            fontWeight: 700,
          }}
        >
          About Our Coaching Center
        </Typography>

        <Box sx={{ mb: { xs: 4, md: 8 } }}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600,
              }}
            >
              Our Mission
            </Typography>

            <Typography
              paragraph
              sx={{
                mb: 3,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                lineHeight: 1.7,
              }}
            >
              We are dedicated to providing exceptional educational coaching
              that empowers students to achieve academic excellence. Our
              personalized approach focuses on developing critical thinking
              skills, building confidence, and fostering a lifelong love for
              learning.
            </Typography>

            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600,
              }}
            >
              Our Vision
            </Typography>

            <Typography
              paragraph
              sx={{
                mb: 3,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                lineHeight: 1.7,
              }}
            >
              To be the leading educational institution that transforms students
              into confident, knowledgeable individuals prepared for future
              academic and career challenges. We strive to create an inclusive
              learning environment that adapts to each student's needs.
            </Typography>

            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                mb: 2,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 600,
              }}
            >
              Our Approach
            </Typography>

            <Typography
              paragraph
              sx={{
                fontSize: { xs: "0.9rem", sm: "1rem" },
                lineHeight: 1.7,
              }}
            >
              We believe that every student has unique abilities and learning
              styles. Our coaching methodology combines traditional teaching
              with modern technology to deliver customized learning experiences.
              We focus on conceptual understanding rather than memorization,
              enabling students to apply their knowledge effectively.
            </Typography>
          </Paper>
        </Box>

        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
            mb: { xs: 3, md: 4 },
            fontWeight: 600,
          }}
        >
          Our Team
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height={isMobile ? "180" : "200"}
                  image={member.image}
                  alt={member.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      fontWeight: 600,
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      mb: 1.5,
                    }}
                  >
                    {member.role}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    {member.bio}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: { xs: 4, md: 8 },
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: theme.palette.primary.main,
            color: "white",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              fontWeight: 600,
            }}
          >
            Join Our Coaching Center
          </Typography>
          <Typography
            align="center"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              lineHeight: 1.7,
            }}
          >
            Experience excellence in education with our personalized coaching
            programs. We are committed to helping you achieve your academic
            goals through quality teaching and innovative learning strategies.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUs;
