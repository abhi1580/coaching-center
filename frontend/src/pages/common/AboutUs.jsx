import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./AboutUs.css";
import founderImg from "../../assets/images/founderImg.jpg";
import profImg from "../../assets/images/profImg.jpg";
import coordinatorImg from "../../assets/images/coordinatorImg.jpg";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Prof. Abhishek Ankulge (Founder & Main Professor)",
      title:
        "M.Sc.(General & Nuclear Physics), B.Ed, GATE(IIT Kanpur), SET(SPPU), PhD(Pursuing)",
      image: profImg,
    },
    { name: "Mrs. Gitanjali Kale", title: "Co-Founder", image: founderImg },
    {
      name: "Mr. Abhijit Ankulge",
      title: "Management Head",
      image: coordinatorImg,
    },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <Container>
          <div className="hero-content">
            <h1>About Our Coaching Center</h1>
            <p>
              Empowering students with quality education and personalized
              guidance since 2010
            </p>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <Container>
          <div className="section-header">
            <h2>Our Mission</h2>
            <p>
              To provide exceptional education and guidance to help students
              achieve their academic goals
            </p>
          </div>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="about-card">
                <Card.Body>
                  <Card.Title>Academic Excellence</Card.Title>
                  <Card.Text>
                    We are committed to delivering high-quality education
                    through experienced faculty, comprehensive study materials,
                    and regular assessments to ensure academic excellence.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="about-card">
                <Card.Body>
                  <Card.Title>Student Success</Card.Title>
                  <Card.Text>
                    Our focus is on nurturing each student's potential through
                    personalized attention, regular doubt-clearing sessions, and
                    continuous progress monitoring.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Vision Section */}
      <section
        className="about-section"
        style={{ background: "rgba(255, 255, 255, 0.02)" }}
      >
        <Container>
          <div className="section-header">
            <h2>Our Vision</h2>
            <p>
              To be the leading coaching center that transforms students into
              confident, knowledgeable individuals
            </p>
          </div>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="about-card">
                <Card.Body>
                  <Card.Title>Quality Education</Card.Title>
                  <Card.Text>
                    Providing comprehensive and up-to-date curriculum aligned
                    with current educational standards.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="about-card">
                <Card.Body>
                  <Card.Title>Personal Growth</Card.Title>
                  <Card.Text>
                    Fostering an environment that promotes critical thinking,
                    problem-solving, and leadership skills.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="about-card">
                <Card.Body>
                  <Card.Title>Future Success</Card.Title>
                  <Card.Text>
                    Preparing students for future challenges through practical
                    knowledge and real-world applications.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Rules Section */}
      <section className="about-section">
        <Container>
          <div className="section-header">
            <h2>Rules and Regulations</h2>
            <p>
              Guidelines to ensure a productive learning environment for all
              students
            </p>
          </div>
          <Row>
            <Col lg={8} className="mx-auto">
              <ul className="rules-list">
                <li>
                  <strong>Attendance:</strong> Regular attendance is mandatory
                  for all students.
                </li>
                <li>
                  <strong>Punctuality:</strong> Students must arrive on time for
                  all classes and tests.
                </li>
                <li>
                  <strong>Discipline:</strong> Maintain proper decorum and
                  respect for teachers and fellow students.
                </li>
                <li>
                  <strong>Assignments:</strong> Complete and submit all
                  assignments within the given deadline.
                </li>
                <li>
                  <strong>Tests:</strong> Regular tests will be conducted to
                  assess progress.
                </li>
                <li>
                  <strong>Communication:</strong> Keep parents informed about
                  academic progress and important updates.
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      <section
        className="about-section"
        style={{ background: "rgba(255, 255, 255, 0.02)" }}
      >
        <Container>
          <div className="section-header">
            <h2>Our Team</h2>
            <p>Meet our experienced and dedicated faculty members</p>
          </div>
          <Row>
            {teamMembers.map((teacher, i) => (
              <Col md={4} className="mb-4" key={i}>
                <Card className="team-card">
                  <Card.Img
                    variant="top"
                    src={teacher.image}
                    style={{
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />
                  <Card.Body>
                    <Card.Title>{teacher.name}</Card.Title>
                    <Card.Text>{teacher.title}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutUs;
