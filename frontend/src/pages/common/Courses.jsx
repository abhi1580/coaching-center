import { Container, Row, Col, Accordion } from "react-bootstrap";
import { FaAtom, FaFlask, FaDna, FaBook, FaGraduationCap, FaMedal, FaTrophy, FaClock, FaUsers, FaChalkboardTeacher, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import "./Courses.css";

function Courses() {
  const courses = [
    {
      subject: "Physics",
      level: "Class 11-12",
      duration: "1 Hour",
      icon: <FaAtom size={45} className="course-icon" />,
      description: "Master physics concepts with our comprehensive course covering mechanics, thermodynamics, electromagnetism, and modern physics. Includes practical experiments and problem-solving sessions."
    },
    {
      subject: "Chemistry",
      level: "Class 11-12",
      duration: "1 Hour",
      icon: <FaFlask size={45} className="course-icon" />,
      description: "Explore the fascinating world of chemistry through our detailed program covering organic, inorganic, and physical chemistry. Features laboratory experiments and interactive learning."
    },
    {
      subject: "Biology",
      level: "Class 11-12",
      duration: "1 Hour",
      icon: <FaDna size={45} className="course-icon" />,
      description: "Dive deep into biological sciences with our comprehensive curriculum covering cell biology, genetics, human physiology, and ecology. Includes practical demonstrations and research projects."
    },
    {
      subject: "Math/English/Science",
      level: "Class 8-10",
      duration: "1 Hour",
      icon: <FaBook size={45} className="course-icon" />,
      description: "Build strong foundations in core subjects with our integrated learning approach. Features interactive sessions, regular assessments, and personalized attention for optimal understanding."
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className="courses-page">
      {/* Hero Section */}
      <section className="courses-hero">
        <Container>
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1>Unlock Your Academic Potential</h1>
            <p>Discover our comprehensive range of courses designed to help you excel in academics and competitive exams. Join us on your journey to success with expert guidance and proven teaching methods.</p>
          </motion.div>
        </Container>
      </section>

      {/* Main Courses Section */}
      <section className="main-courses">
        <Container>
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2>Regular Courses</h2>
            <p>Build a strong foundation with our comprehensive courses designed for academic excellence</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Row>
              {courses.map((course, i) => (
                <Col md={6} lg={3} key={i} className="mb-4">
                  <motion.div variants={itemVariants}>
                    <div className="course-card">
                      {course.icon}
                      <h3>{course.subject}</h3>
                      <p className="course-description">{course.description}</p>
                      <div className="course-details">
                        <span><FaUsers /> {course.level}</span>
                        <span><FaClock /> {course.duration}</span>
                      </div>
                      <button className="enroll-button">
                        Enroll Now <FaArrowRight />
                      </button>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Competitive Courses Section */}
      <section className="competitive-courses">
        <Container>
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2>Competitive Exam Preparation</h2>
            <p>Specialized courses designed to help you excel in competitive exams</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Row>
              <Col md={6} className="mb-4">
                <motion.div variants={itemVariants}>
                  <div className="competitive-card">
                    <FaGraduationCap size={45} className="course-icon" />
                    <h3>NEET Preparation</h3>
                    <p>Our NEET preparation course is designed to help students excel in the medical entrance exam. We provide comprehensive study materials, regular mock tests, personalized guidance, and doubt-solving sessions. Our experienced faculty ensures thorough coverage of Physics, Chemistry, and Biology syllabus.</p>
                    <button className="enroll-button">
                      Enroll Now <FaArrowRight />
                    </button>
                  </div>
                </motion.div>
              </Col>
              <Col md={6} className="mb-4">
                <motion.div variants={itemVariants}>
                  <div className="competitive-card">
                    <FaGraduationCap size={45} className="course-icon" />
                    <h3>JEE Preparation</h3>
                    <p>Our JEE preparation course provides comprehensive training in Physics, Chemistry, and Mathematics. We offer extensive practice problems, doubt-solving sessions, and regular assessments. Our structured approach helps students build strong concepts and develop problem-solving skills.</p>
                    <button className="enroll-button">
                      Enroll Now <FaArrowRight />
                    </button>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Other Courses Section */}
      <section className="other-courses">
        <Container>
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2>Additional Programs</h2>
            <p>Specialized courses and programs to enhance your academic journey</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Row>
              <Col md={4} className="mb-4">
                <motion.div variants={itemVariants}>
                  <div className="other-card">
                    <FaMedal size={45} className="course-icon" />
                    <h3>Homi Bhabha Exam</h3>
                    <p>Prepare for the Homi Bhabha Exam with our tailored course focused on building scientific aptitude and conceptual understanding. Our program includes practice tests, study materials, and expert guidance.</p>
                    <button className="enroll-button">
                      Enroll Now <FaArrowRight />
                    </button>
                  </div>
                </motion.div>
              </Col>
              <Col md={4} className="mb-4">
                <motion.div variants={itemVariants}>
                  <div className="other-card">
                    <FaMedal size={45} className="course-icon" />
                    <h3>Scholarship Exams</h3>
                    <p>We provide comprehensive guidance and training for various scholarship exams. Our program helps students secure financial aid and recognition through systematic preparation and regular practice.</p>
                    <button className="enroll-button">
                      Enroll Now <FaArrowRight />
                    </button>
                  </div>
                </motion.div>
              </Col>
              <Col md={4} className="mb-4">
                <motion.div variants={itemVariants}>
                  <div className="other-card">
                    <FaTrophy size={45} className="course-icon" />
                    <h3>Olympiads & Competitive Exams</h3>
                    <p>Our Olympiad preparation course sharpens analytical and problem-solving skills. We provide comprehensive training for Science and Math Olympiads with regular practice tests and expert guidance.</p>
                    <button className="enroll-button">
                      Enroll Now <FaArrowRight />
                    </button>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Syllabus Section */}
      <section className="syllabus-section">
        <Container>
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2>Course Syllabus</h2>
            <p>Detailed curriculum for each course to help you understand what you'll learn</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <Accordion defaultActiveKey="0" className="custom-accordion">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Physics (11th Standard)</Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Chapter 1: Units & Mathematical Tool</li>
                    <li>Chapter 2: Motion & Gravitation</li>
                    <li>Chapter 3: Properties of Matter</li>
                    <li>Chapter 4: Sound & Optics</li>
                    <li>Chapter 5: Electricity & Magnetism</li>
                    <li>Chapter 6: Communication & Semiconductors</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>Physics (12th Standard)</Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Chapter 1: Rotational Motion & Mechanical Properties of Fluids</li>
                    <li>Chapter 2: Kinetic theory & Thermodynamics</li>
                    <li>Chapter 3: Oscillation & Waves</li>
                    <li>Chapter 4: Electrostatics & Electric Current</li>
                    <li>Chapter 5: Magnetism</li>
                    <li>Chapter 6: Modern Physics</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </motion.div>
        </Container>
      </section>

      {/* Fees Section */}
      <section className="fees-section">
        <Container>
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2>Fees Structure</h2>
            <p>Transparent and competitive pricing for all our courses</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="fees-table-wrapper">
              <table className="fees-table">
                <thead>
                  <tr>
                    <th>Standard</th>
                    <th>Subject</th>
                    <th>Fees</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Class 8</td>
                    <td>Math/English/Science</td>
                    <td>9000 Rs. (Per Subject)</td>
                  </tr>
                  <tr>
                    <td>Class 9</td>
                    <td>Math/English/Science</td>
                    <td>10000 Rs. (Per Subject)</td>
                  </tr>
                  <tr>
                    <td>Class 10</td>
                    <td>Math/English/Science</td>
                    <td>11000 Rs. (Per Subject)</td>
                  </tr>
                  <tr>
                    <td>Class 11</td>
                    <td>Physics/Chemistry/Biology</td>
                    <td>22000 Rs. (Per Subject)</td>
                  </tr>
                  <tr>
                    <td>Class 12</td>
                    <td>Physics/Chemistry/Biology</td>
                    <td>25000 Rs. (Per Subject)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}

export default Courses;
