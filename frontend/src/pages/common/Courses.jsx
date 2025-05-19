import { Container, Row, Col, Card, Button, Accordion } from "react-bootstrap";
import { FaAtom, FaFlask, FaDna, FaBook, FaGraduationCap, FaMedal, FaTrophy } from "react-icons/fa";

function Courses() {
  const courses = [
    {
      subject: "Physics",
      level: "Class 11-12",
      duration: "1 Hour",
      icon: <FaAtom size={40} className="text-warning mb-3" />
    },
    {
      subject: "Chemistry",
      level: "Class 11-12",
      duration: "1 Hour",
      icon: <FaFlask size={40} className="text-warning mb-3" />
    },
    {
      subject: "Biology",
      level: "Class 11-12",
      duration: "1 Hour",
      icon: <FaDna size={40} className="text-warning mb-3" />
    },
    {
      subject: "Math/English/Sci",
      level: "Class 8 To 10",
      duration: "1 Hour",
      icon: <FaBook size={40} className="text-warning mb-3" />
    },
  ];

  return (
    <div className="py-5">
      <Container>
        <h2 className="text-center mb-4 section-title ">Our Courses</h2>
        <Row>
          {courses.map((course, i) => (
            <Col md={6} lg={3} key={i} className="mb-4">
              <Card className="h-100">
                <Card.Body className="text-center">
                  {course.icon}
                  <Card.Title>{course.subject}</Card.Title>
                  <Card.Text>
                    <strong>Level:</strong> {course.level}
                    <br />
                    <strong>Duration:</strong> {course.duration}
                  </Card.Text>
                  <Button variant="outline-warning" href="/admission">
                    Enroll Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mt-5">
          <h3 className="text-center mb-4 section-title">Preparation</h3>
          <Row>
            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Body className="text-center">
                  <FaGraduationCap size={40} className="text-warning mb-3" />
                  <Card.Title>NEET Preparation</Card.Title>
                  <Card.Text>
                    Our NEET preparation course is designed to help students
                    excel in the medical entrance exam with a focus on Physics,
                    Chemistry, and Biology.
                  </Card.Text>
                  <Button variant="outline-warning" href="/admission">
                    Enroll Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Body className="text-center">
                  <FaGraduationCap size={40} className="text-warning mb-3" />
                  <Card.Title>JEE Preparation</Card.Title>
                  <Card.Text>
                    Our JEE preparation course provides comprehensive training
                    in Physics, Chemistry, and Mathematics to help students
                    achieve their engineering dreams.
                  </Card.Text>
                  <Button variant="outline-warning" href="/admission">
                    Enroll Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="mt-5">
          <h3 className="text-center mb-4 section-title">Other Preparation</h3>
          <Row>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <FaMedal size={40} className="text-warning mb-3" />
                  <Card.Title>Homi Bhabha Exam</Card.Title>
                  <Card.Text>
                    Prepare for the Homi Bhabha Exam with our tailored course
                    focused on building scientific aptitude and conceptual
                    understanding.
                  </Card.Text>
                  <Button variant="outline-warning" href="/admission">
                    Enroll Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <FaMedal size={40} className="text-warning mb-3" />
                  <Card.Title>Scholarship Exams</Card.Title>
                  <Card.Text>
                    We provide guidance and training for various scholarship
                    exams to help students secure financial aid and recognition.
                  </Card.Text>
                  <Button variant="outline-warning" href="/admission">
                    Enroll Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={12}>
              <Card className="mb-4">
                <Card.Body className="text-center">
                  <FaTrophy size={40} className="text-warning mb-3" />
                  <Card.Title>Olympiads & Competitive Exams</Card.Title>
                  <Card.Text>
                    Olympiad preparation course sharpens analytical and
                    problem-solving skills for exams like Science, Math.
                  </Card.Text>
                  <Button variant="outline-warning" href="/admission">
                    Enroll Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        <hr />

        <div className="mt-5 syllabus-wrapper">
          <h3 className="text-center mb-5 section-title">Syllabus</h3>
          <Container className="text-start">
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
                    <li>
                      Chapter 1: Rataional Motion & Mechanical Properties of
                      Fluids
                    </li>
                    <li>Chapter 2: Kinetic theory & Thermodynamics</li>
                    <li>Chapter 3: Oscillation & Waves </li>
                    <li>Chapter 4: Electrostatics & Electric Current</li>
                    <li>Chapter 5: Magnetism</li>
                    <li>Chapter 6: Modern Physics</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>Chemistry (11th Standard)</Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Chapter 1: Cell Structure and Function</li>
                    <li>Chapter 2: Genetics and Evolution</li>
                    <li>Chapter 3: Human Physiology</li>
                    <li>Chapter 4: Plant Physiology</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>Chemistry (12th Standard)</Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Chapter 1: Cell Structure and Function</li>
                    <li>Chapter 2: Genetics and Evolution</li>
                    <li>Chapter 3: Human Physiology</li>
                    <li>Chapter 4: Plant Physiology</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="4">
                <Accordion.Header>Biology (12th Standard)</Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Chapter 1: Cell Structure and Function</li>
                    <li>Chapter 2: Genetics and Evolution</li>
                    <li>Chapter 3: Human Physiology</li>
                    <li>Chapter 4: Plant Physiology</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="5">
                <Accordion.Header>Biology (12th Standard)</Accordion.Header>
                <Accordion.Body>
                  <ul>
                    <li>Chapter 1: Cell Structure and Function</li>
                    <li>Chapter 2: Genetics and Evolution</li>
                    <li>Chapter 3: Human Physiology</li>
                    <li>Chapter 4: Plant Physiology</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Container>
        </div>
        <hr />

        <div className="mt-5">
          <h3 className="text-center mb-4 section-title">Fees Structure</h3>
          <p className="text-center mb-4">
            The fees structure for our courses is designed to be affordable and
            competitive. (We believe quality education should be accessible to
            everyone. That's why our <b>fees are negotiable</b> based on
            individual circumstances. Feel free to discuss your needs with
            us—we're here to help.)
          </p>
          <table className="table table-bordered text-center">
            <thead className="thead-light">
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
      </Container>
    </div>
  );
}

export default Courses;
