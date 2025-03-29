import React from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PsychologyIcon from "@mui/icons-material/Psychology";

function AboutUs() {
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

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 8, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Our Coaching Center
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Empowering minds, shaping futures, and building tomorrow's leaders
        </Typography>
      </Box>

      {/* Mission and Vision */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: "100%" }}>
            <Typography variant="h4" gutterBottom color="primary">
              Our Mission
            </Typography>
            <Typography paragraph>
              To provide quality education and guidance to students, helping
              them achieve academic excellence and personal growth. We strive to
              create an environment that fosters learning, creativity, and
              critical thinking.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: "100%" }}>
            <Typography variant="h4" gutterBottom color="primary">
              Our Vision
            </Typography>
            <Typography paragraph>
              To be the leading coaching center that sets the standard for
              excellence in education, known for producing well-rounded
              individuals who are prepared for the challenges of tomorrow.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Features */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Why Choose Us
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Box sx={{ color: "primary.main", mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* History Section */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Our Journey
        </Typography>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography paragraph>
            Founded in 2010, our coaching center has grown from a small tutoring
            center to a comprehensive educational institution. Over the years,
            we have helped thousands of students achieve their academic goals
            and develop into confident individuals.
          </Typography>
          <Typography paragraph>
            Our success is built on the dedication of our experienced teachers,
            the hard work of our students, and the trust of parents who have
            chosen us as their educational partner.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default AboutUs;
