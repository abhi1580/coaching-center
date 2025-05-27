import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  School,
  Assignment,
  MenuBook,
  Quiz,
  EventNote,
  Devices,
  Star,
  ArrowForward,
  KeyboardArrowUp,
  EmojiEvents,
  Groups,
  Science,
} from "@mui/icons-material";
import img1 from "../../assets/images/img1.jpg";
import img2 from "../../assets/images/img2.jpg";
import img3 from "../../assets/images/img3.jpg";
import img4 from "../../assets/images/img4.jpg";
import img5 from "../../assets/images/img5.jpg";
import img6 from "../../assets/images/img6.jpg";
import einstein from "../../assets/images/header-bg.png";
import "./LandingPage.css";
import {
  FaGraduationCap,
  FaBook,
  FaUsers,
  FaChalkboardTeacher,
  FaArrowUp,
} from "react-icons/fa";
import { Typography } from "@mui/material";

function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const features = [
    {
      title: "Expert Faculty",
      text: "Learn from experienced teachers with proven track records",
      icon: <Groups sx={{ fontSize: 40 }} />,
    },
    {
      title: "Comprehensive Study",
      text: "Access to extensive study materials and resources",
      icon: <MenuBook sx={{ fontSize: 40 }} />,
    },
    {
      title: "Regular Tests",
      text: "Weekly assessments to track your progress",
      icon: <Quiz sx={{ fontSize: 40 }} />,
    },
    {
      title: "Success Stories",
      text: "Join our community of successful students",
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
    },
    {
      title: "Practical Learning",
      text: "Hands-on experiments and real-world applications",
      icon: <Science sx={{ fontSize: 40 }} />,
    },
    {
      title: "Flexible Schedule",
      text: "Choose between online and offline classes",
      icon: <Devices sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="hero-badge"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Welcome to Imperial Academy
                </motion.div>
                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Discover the{" "}
                  <span className="gradient-text">Magic of Physics</span>
                </motion.h1>
                <motion.p
                  className="hero-subtitle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  Join our community of learners and explore the fascinating
                  world of physics with expert guidance and hands-on experience
                </motion.p>
                <motion.div
                  className="hero-features"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="feature-item">
                    <FaGraduationCap className="feature-icon" />
                    <div>
                      <h3>Expert Guidance</h3>
                      <p>Learn from IIT & NIT graduates</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <FaBook className="feature-icon" />
                    <div>
                      <h3>Smart Learning</h3>
                      <p>AI-powered personalized study plans</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <FaUsers className="feature-icon" />
                    <div>
                      <h3>Live Classes</h3>
                      <p>Interactive online & offline sessions</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  className="hero-buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <a href="/admission" className="primary-button">
                    Start Learning
                  </a>
                  <a href="/courses" className="secondary-button">
                    Explore Courses
                  </a>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Why Choose Imperial Academy?</h2>
            <p>Experience excellence in physics education</p>
          </motion.div>
          <Row>
            {features.map((feature, index) => (
              <Col xs={12} sm={6} md={4} key={index}>
                <motion.div
                  className="m-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="feature-card">
                    <Card.Body>
                      <div className="feature-icon">{feature.icon}</div>
                      <h3>{feature.title}</h3>
                      <p>{feature.text}</p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Container>
          <Row>
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="stat-card"
              >
                <h3>1000+</h3>
                <p>Students</p>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="stat-card"
              >
                <h3>50+</h3>
                <p>Expert Teachers</p>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="stat-card"
              >
                <h3>95%</h3>
                <p>Success Rate</p>
              </motion.div>
            </Col>
            <Col md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="stat-card"
              >
                <h3>10+</h3>
                <p>Years Experience</p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Our Learning Environment</h2>
            <p>Take a look at our state-of-the-art facilities</p>
          </motion.div>
          <Row className="g-2">
            {[img1, img2, img3, img4, img5, img6].map((image, i) => (
              <Col xs={12} sm={6} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="gallery-item"
                >
                  <img
                    src={image}
                    alt={`Gallery ${i + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Image+Not+Found";
                    }}
                  />
                  <div className="gallery-overlay">
                    <span>View Details</span>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <h2>Ready to Start Your Physics Journey?</h2>
            <p>Join us today and transform your understanding of physics</p>
            <Button className="primary-button" size="lg" href="/admission">
              Get Started Now <ArrowForward />
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* Scroll to Top Button */}
      {isVisible && (
        <motion.button
          className="scroll-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowUp />
        </motion.button>
      )}
    </div>
  );
}

export default LandingPage;
