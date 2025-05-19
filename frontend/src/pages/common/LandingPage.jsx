import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
} from "react-bootstrap";
import { motion } from "framer-motion";
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
import headerBg from "../../assets/images/header-bg.png";
import "./LandingPage.css";

function LandingPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hero-section"
      >
        <div className="hero-content">
          <Row className="align-items-center">
            <Col lg={6} className="hero-text">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hero-badge"
              >
                <span>Welcome to Physics Station</span>
              </motion.div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="hero-title"
              >
                Discover the
                <span className="gradient-text"> Magic of Physics</span>
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="hero-subtitle"
              >
                Join our community of learners and explore the fascinating world of physics with expert guidance and hands-on experience
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="hero-features"
              >
                <div className="feature-item">
                  <School className="feature-icon" />
                  <span>Expert Teachers</span>
                </div>
                <div className="feature-item">
                  <Science className="feature-icon" />
                  <span>Practical Learning</span>
                </div>
                <div className="feature-item">
                  <EmojiEvents className="feature-icon" />
                  <span>Success Stories</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="hero-buttons"
              >
                <Button
                  className="primary-button"
                  size="lg"
                  href="/admission"
                >
                  Start Learning <ArrowForward />
                </Button>
                <Button
                  className="secondary-button"
                  size="lg"
                  href="/courses"
                >
                  Explore Courses
                </Button>
              </motion.div>
            </Col>
            <Col lg={6} className="hero-image">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="image-container"
              >
                <motion.img
                  src={einstein}
                  alt="Physics Education"
                  className="einstein-image"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="floating-element element-1"
                  animate={{
                    y: [0, -15, 0],
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="element-content">
                    <span className="element-number">1000+</span>
                    <span className="element-text">Students</span>
                  </div>
                </motion.div>
                <motion.div
                  className="floating-element element-2"
                  animate={{
                    y: [0, -15, 0],
                    x: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                >
                  <div className="element-content">
                    <span className="element-number">95%</span>
                    <span className="element-text">Success Rate</span>
                  </div>
                </motion.div>
                <motion.div
                  className="floating-element element-3"
                  animate={{
                    y: [0, -15, 0],
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                >
                  <div className="element-content">
                    <span className="element-number">50+</span>
                    <span className="element-text">Expert Teachers</span>
                  </div>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </div>
        <div className="hero-shape"></div>
      </motion.section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Why Choose Physics Station?</h2>
            <p>Experience excellence in physics education</p>
          </motion.div>
          <Row>
            {features.map((feature, index) => (
              <Col md={4} key={index}>
                <motion.div
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
          <Row>
            {[img1, img2, img3, img4, img5, img6].map((image, i) => (
              <Col md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="gallery-item"
                >
                  <img src={image} alt={`Gallery ${i + 1}`} />
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
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="scroll-to-top"
        aria-label="Scroll to top"
      >
        <KeyboardArrowUp />
      </motion.button>
    </div>
  );
}

export default LandingPage;
