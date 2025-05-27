import { Container, Row, Col, Card } from "react-bootstrap";
import founderImg from "../../assets/images/founderImg.jpg";
import profImg from "../../assets/images/profImg.jpg";
import coordinatorImg from "../../assets/images/coordinatorImg.jpg";

function AboutUs() {
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
    <div className="py-5">
      <Container>
        {/* Mission */}
        <section className="mb-5">
          <h2 className="text-center mb-4 section-title">Our Mission</h2>
          <p className="text-start lead">
            At Imperial Academy, our mission is to ignite a passion for physics
            through clear, concept-based learning and personalized guidance. We
            aim to build strong foundational understanding, foster critical
            thinking, and equip students with the problem-solving skills needed
            to excel in academic and competitive examinations. By creating an
            engaging and supportive environment, we strive to make physics
            approachable, enjoyable, and deeply rewarding for every learner.
          </p>
        </section>

        {/* Vision */}
        <section className="mb-5">
          <h2 className="text-center mb-4 section-title">Our Vision</h2>
          <p className="text-start lead">
            Our vision at Imperial Academy is to become a leading center of
            excellence in physics education, inspiring students to explore,
            innovate, and achieve their full potential. We envision a future
            where every learner, regardless of background, gains the confidence
            and curiosity to pursue science with enthusiasm. Through continuous
            innovation in teaching methods and commitment to academic integrity,
            we aim to shape future scientists, engineers, and thinkers who will
            contribute meaningfully to society.
          </p>
        </section>

        {/* Teaching Method */}
        <section className="mb-5">
          <h2 className="text-center mb-4 section-title">
            Rules and Regulations
          </h2>
          <div className="custom-accordion">
            <ul className="list-unstyled">
              <li>
                <strong>Punctuality:</strong> Students must arrive on time for
                all classes. Late entry beyond 10 minutes may result in denied
                entry for that session.
              </li>
              <li>
                <strong>Attendance:</strong> Regular attendance is mandatory. In
                case of absence, prior notice must be given, and students are
                responsible for covering missed topics.
              </li>
              <li>
                <strong>Respect:</strong> Students are expected to maintain a
                respectful and positive environment. Disruptive behavior will
                not be tolerated.
              </li>
              <li>
                <strong>Discipline:</strong> Maintain decorum and respect in the
                classroom. Misbehavior or disruptive conduct will lead to
                disciplinary action.
              </li>
              <li>
                <strong>Mobile Phones:</strong> Mobile phones must be on silent
                or switched off during class. Unauthorized use during lectures
                is prohibited.
              </li>
              <li>
                <strong>Assignments & Tests:</strong> Timely submission of
                homework and active participation in tests is expected from all
                students.
              </li>
              <li>
                <strong>Fees:</strong> All fees must be paid in advance as per
                the schedule. No refunds will be entertained once the payment is
                made.
              </li>
              <li>
                <strong>Materials:</strong> Students must bring their notebooks,
                textbooks, and writing tools to every class. Borrowing during
                class is discouraged.
              </li>
              <li>
                <strong>Classroom Cleanliness:</strong> Maintain cleanliness and
                avoid littering in and around the premises.
              </li>
              <li>
                <strong>Parental Involvement:</strong> Parents are encouraged to
                track their child's progress. Regular parent-teacher
                interactions will be held.
              </li>
              <li>
                <strong>Property Damage:</strong> Any damage to institute
                property will be charged to the student responsible.
              </li>
            </ul>
          </div>
        </section>

        {/* Founders/Teachers */}
        <section>
          <h2 className="text-center mb-4 section-title">Meet Our Team</h2>
          <Row>
            {teamMembers.map((teacher, i) => (
              <Col md={4} key={i} className="mb-4">
                <Card className="why-card h-100">
                  <Card.Img
                    variant="top"
                    src={teacher.image}
                    style={{
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />
                  <Card.Body>
                    <Card.Title className="why-card-title">
                      {teacher.name}
                    </Card.Title>
                    <Card.Text className="why-card-text">
                      {teacher.title}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </div>
  );
}

export default AboutUs;
