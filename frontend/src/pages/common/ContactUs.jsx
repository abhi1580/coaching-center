import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";

function ContactUs() {
  return (
    <div className="py-5">
      <Container>
        <h2 className="text-center mb-5 section-title">Contact Us</h2>
        <Row className="gy-4">
          {/* Contact Form */}
          <Col md={6} className="mb-4">
            <div className="admission-form-card h-100">
              <h3 className="mb-4">Send us a message</h3>
              <Form>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label className="form-label">Name</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="form-control"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="form-label">Email</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="form-control"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formMessage">
                  <Form.Label className="form-label">Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    required
                    placeholder="Type your message here..."
                    className="form-control"
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="btn-primary w-100">
                  Send Message
                </Button>
              </Form>
            </div>
          </Col>

          {/* Contact Info */}
          <Col md={6}>
            <div className="admission-form-card h-100">
              <h3 className="mb-4">Get in Touch</h3>
              <div className="d-flex align-items-center mb-4">
                <div className="me-3">
                  <FaPhone size={22} style={{ color: "var(--accent-yellow)" }} />
                </div>
                <div>
                  <h5 className="mb-1 why-card-title">Phone</h5>
                  <p className="mb-0 why-card-text">(+91) 7498289182</p>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="me-3">
                  <FaEnvelope size={22} style={{ color: "var(--accent-yellow)" }} />
                </div>
                <div>
                  <h5 className="mb-1 why-card-title">Email</h5>
                  <p className="mb-0 why-card-text">physicsstation@gmail.com</p>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="me-3">
                  <FaMapMarkerAlt size={22} style={{ color: "var(--accent-yellow)" }} />
                </div>
                <div>
                  <h5 className="mb-1 why-card-title">Location</h5>
                  <p className="mb-0 why-card-text">Ambajogai Road, Infront of Hotel Pahunchar, Latur -413512</p>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FaClock size={22} style={{ color: "var(--accent-yellow)" }} />
                </div>
                <div>
                  <h5 className="mb-1 why-card-title">Working Hours</h5>
                  <p className="mb-0 why-card-text">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                </div>
              </div>
            </div>
          </Col>

          <Col md={12}>
            <h3 className="section-title mt-5 mb-4">Our Location</h3>
            <div className="map-container" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3785.3982784369587!2d76.56850227596956!3d18.420217172230515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcf83788bf95f5b%3A0xa8b13ce5c3e5dd8e!2sPahunchar%20Pure%20Veg%20Restaurant!5e0!3m2!1sen!2sin!4v1746515235339!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ContactUs;
