import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  Download,
  MenuBook,
  Videocam,
  FilterList,
  Search,
  AccessTime,
} from "@mui/icons-material";
import "./Resources.css?v=1";
import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../services/common/apiClient";

function Resources() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
    },
  };

  // Notes data (static)
  const notes = [
    {
      title: "Mechanics Fundamentals",
      url: "/assets/mechanics.pdf",
      subject: "Physics",
      standard: "11-12",
      description:
        "Comprehensive notes covering Newton's laws, dynamics, and kinematics",
    },
    {
      title: "Electromagnetism Concepts",
      url: "/assets/electromagnetism.pdf",
      subject: "Physics",
      standard: "11-12",
      description:
        "Complete guide to electromagnetic fields, Maxwell's equations, and applications",
    },
    {
      title: "Thermodynamics",
      url: "/assets/thermodynamics.pdf",
      subject: "Physics",
      standard: "11-12",
      description:
        "Laws of thermodynamics, heat transfer, and thermal processes",
    },
    {
      title: "Organic Chemistry",
      url: "/assets/organic-chemistry.pdf",
      subject: "Chemistry",
      standard: "11-12",
      description:
        "Detailed notes on organic compounds, reactions and mechanisms",
    },
  ];

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/videos");
      console.log("API Response:", response.data);

      if (!response.data) {
        console.error("No data received from API");
        setVideos([]);
        setError("No videos found.");
        return;
      }

      // Ensure we have an array of videos
      const videoArray = Array.isArray(response.data) ? response.data : [];
      console.log("Processed videos:", videoArray.length);

      // Sort videos by createdAt (newest first)
      const sortedVideos = videoArray.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log("Setting videos state with:", sortedVideos.length, "videos");
      setVideos(sortedVideos);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setVideos([]);
      setError(
        err.response?.data?.message ||
          "Failed to fetch videos. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Memoize the video grid to prevent unnecessary re-renders
  const videoGrid = useMemo(() => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading videos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-5">
          <Videocam sx={{ fontSize: 48 }} color="disabled" />
          <h4 className="text-muted">{error}</h4>
        </div>
      );
    }

    if (videos.length === 0) {
      return (
        <div className="text-center py-5">
          <Videocam sx={{ fontSize: 48 }} color="disabled" />
          <h4 className="text-muted">No videos found</h4>
          <p className="text-muted">No videos available at the moment.</p>
        </div>
      );
    }

    return (
      <Row className="g-4">
        {videos.map((video) => (
          <Col key={video._id || video.id} xs={12} md={6} lg={4}>
            <motion.div variants={itemVariants}>
              <Card className="video-card h-100">
                <div className="video-thumbnail">
                  <Card.Img
                    variant="top"
                    src={
                      video.thumbnail ||
                      "https://via.placeholder.com/300x200?text=No+Thumbnail"
                    }
                    alt={video.title}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=No+Thumbnail";
                    }}
                  />
                  <div className="video-duration">
                    <AccessTime fontSize="small" />
                    {video.duration || "N/A"}
                  </div>
                </div>
                <Card.Body>
                  <div className="resource-header">
                    <div className="resource-icon">
                      <Videocam />
                    </div>
                    <h5>{video.title}</h5>
                  </div>
                  <div className="tags-container">
                    <span className="subject-tag">{video.subject}</span>
                    {video.channelName && (
                      <span className="subject-tag">{video.channelName}</span>
                    )}
                  </div>
                  {video.description && (
                    <p className="video-description">{video.description}</p>
                  )}
                  <Button
                    variant="primary"
                    className="watch-btn"
                    onClick={() => window.open(video.youtubeLink, "_blank")}
                  >
                    <Videocam className="me-2" />
                    Watch Video
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    );
  }, [videos, loading, error, itemVariants]);

  return (
    <div className="resources-page">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="resources-hero"
      >
        <Container>
          <motion.div
            className="hero-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1>Educational Resources</h1>
            <p>
              Access our comprehensive collection of study materials, video
              lectures and reference guides to enhance your learning journey.
            </p>
          </motion.div>
        </Container>
      </motion.section>

      {/* Notes Section */}
      <section className="notes-section">
        <Container>
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Downloadable Notes</h2>
            <p>High-quality study materials created by our expert teachers</p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Row className="mt-4">
              {notes.map((note, i) => (
                <Col md={6} lg={3} className="mb-4" key={i}>
                  <motion.div variants={itemVariants}>
                    <Card className="resource-card h-100">
                      <Card.Body>
                        <div className="resource-header">
                          <div className="resource-icon">
                            <MenuBook />
                          </div>
                          <h5>{note.title}</h5>
                        </div>
                        <div className="tags-container">
                          <span className="subject-tag">{note.subject}</span>
                          <span className="subject-tag">
                            Class {note.standard}
                          </span>
                        </div>
                        <p>{note.description}</p>
                        <a href={note.url} className="download-btn" download>
                          Download Notes <Download fontSize="small" />
                        </a>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Videos Section */}
      <section className="videos-section py-5">
        <Container>
          <motion.div
            className="section-header text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="display-5 mb-3">Video Lectures</h2>
            <p className="lead">
              Watch our expert-led video lectures to master your subjects
            </p>
          </motion.div>

          {/* Video Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {videoGrid}
          </motion.div>
        </Container>
      </section>
    </div>
  );
}

export default Resources;
