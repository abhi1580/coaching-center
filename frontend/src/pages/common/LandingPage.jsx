import {
  Container,
  Row,
  Col,
  Button,
  Carousel,
  Card,
  Form,
} from "react-bootstrap";
import img1 from "../../assets/images/img1.jpg";
import img2 from "../../assets/images/img2.jpg";
import img3 from "../../assets/images/img3.jpg";
import img4 from "../../assets/images/img4.jpg";
import img5 from "../../assets/images/img5.jpg";
import img6 from "../../assets/images/img6.jpg";

function LandingPage() {
  return (
    <div>
      <section className="py-5 text-center hero-section">
        <Container>
          <h1 className="display-4">
            Welcome to <span className="hero-heading">Physics Station</span>{" "}
          </h1>
          <p className="lead">
            Your Journey to Academic Excellence Starts Here
          </p>
          <Button
            className="join-button"
            size="lg"
            href="/admission"
            aria-label="Join Now"
          >
            Join Now
          </Button>
        </Container>
      </section>

      {/* Highlights */}
      <section className="why-choose-us-section py-5">
        <Container>
          <h2 className="text-center section-title mb-4">Why Choose Us?</h2>
          <Row>
            {[
              {
                title: "Demo Class",
                text: "Experience our teaching approach with a complimentary free demo session.",
              },
              {
                title: "Online Registration",
                text: "Register online for our courses and start learning physics from today",
              },
              {
                title: "Study Materials",
                text: "Get access to a wide range of study materials and resources.",
              },
              {
                title: "Exam Preparation",
                text: "Weekly exams to test your knowledge and track your progress.",
              },
              {
                title: "Online Attendance",
                text: "Track your attendance online with our easy-to-use system.",
              },
              {
                title: "Flexible Learning",
                text: "Online and in-person classes to suit your schedule.",
              },
            ].map((item, index) => (
              <Col md={4} key={index}>
                <Card className="why-card mb-4 shadow-sm">
                  <Card.Body>
                    <Card.Title className="why-card-title">
                      {item.title}
                    </Card.Title>
                    <Card.Text className="why-card-text">{item.text}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4 section-title">About Us</h2>
          <p className="text-center">
            Physics Station is more than just a coaching center — it's a
            launchpad for future scientists, engineers, and thinkers. We
            specialize in preparing students for school exams, competitive
            entrance tests like JEE and NEET, and building a strong conceptual
            foundation. Our mission is to simplify complex concepts, encourage
            critical thinking, and ignite a genuine interest in science. With
            experienced faculty, personalized guidance, and a result-oriented
            approach, Physics Station is committed to helping every student
            realize their true potential.
          </p>

          <Button variant="accent" href="/about" className="d-block mx-auto">
            Learn More
          </Button>
        </Container>
      </section>

      {/* Gallery */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4 section-title">Gallery</h2>
          <Row>
            {[img1, img2, img3, img4, img5, img6].map((image, i) => (
              <Col md={4} key={i} className="mb-4">
                <img
                  src={image}
                  alt={`Gallery ${i + 1}`}
                  className="img-fluid rounded"
                />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4 section-title">
            What Our Students Say
          </h2>
          <Carousel>
            <Carousel.Item>
              <p className="text-center">
                "Physics Station made complex concepts so easy to understand!" -
                John D.
              </p>
            </Carousel.Item>
            <Carousel.Item>
              <p className="text-center">
                "The best place to learn physics with real-world applications."
                - Sarah K.
              </p>
            </Carousel.Item>
          </Carousel>
        </Container>
      </section>

      {/* Reviews Form */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4 section-title">Leave a Review</h2>
          <Form>
            <Row className="mb-3 justify-content-center">
              <Col md={6} className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Your Name"
                  aria-label="Your Name"
                />
              </Col>
            </Row>
            <Row className="mb-3 justify-content-center">
              <Col md={6}>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Your Review"
                  aria-label="Your Review"
                />
              </Col>
            </Row>
            <div className="text-center">
              <Button type="submit" variant="primary">
                Submit Review
              </Button>
            </div>
          </Form>
        </Container>
      </section>
    </div>
  );
}

export default LandingPage;
