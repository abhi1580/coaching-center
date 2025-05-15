import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

function MainFooter() {
  return (
    <footer className="footer text-light mt-5 py-5">
      <Container fluid>
        <Row>
          <Col md={3} className="mb-4">
            <h3 className="footer-title">Physics Station</h3>
            <p className="footer-text">
              Ambajogai Road, Infront of Hotel Pahunchar, Latur -413512,
              Maharashtra, India
              <br />
              Phone: (+91) 7498289182 / 7972787113
              <br />
              Email: physicsstation@gmail.com
            </p>
          </Col>

          <Col md={3} className="mb-4">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li>
                <a href="/courses">Courses</a>
              </li>
              <li>
                <a href="/admission">Admission</a>
              </li>
              <li>
                <a href="/resources">Resources</a>
              </li>
              <li>
                <a href="/contact">Contact Us</a>
              </li>
            </ul>
          </Col>

          <Col md={3} className="mb-4">
            <h5 className="footer-title">Opening Hours</h5>
            <ul className="list-unstyled footer-text">
              <li>Monday - Saturday: 9:00 AM - 9:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </Col>

          <Col md={3} className="mb-4">
            <h5 className="footer-title">Newsletter</h5>
            <p className="footer-text">
              Subscribe to get our latest updates and news.
            </p>
            <Form className="d-flex">
              <Form.Control
                type="email"
                placeholder="Enter your email"
                className="me-2"
              />
              <Button variant="warning" type="submit">
                Subscribe
              </Button>
            </Form>
            <div className="social-icons gap-3 d-flex justify-content-center mt-3">
              <a href="#" aria-label="Facebook">
                <FaFacebook size={24} />
              </a>
              <a href="#" aria-label="Twitter">
                <FaTwitter size={24} />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram size={24} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
        </Row>

        <hr />

        {/* Terms & Policies Row */}
        <Row className="mt-3 text-center">
          <Col md={6}>
            <p className="mb-0">
              &copy; 2025 <strong>Physics Station</strong>. All Rights Reserved.
            </p>
          </Col>
          <Col md={6} className="mb-2 mb-md-0">
            <ul className="list-inline footer-links mb-0">
              <li className="list-inline-item mx-2">
                <Link to="/terms-of-service">Terms of Service</Link>
              </li>
              <li className="list-inline-item mx-2">
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li className="list-inline-item mx-2">
                <Link to="/cookies-policy">Cookies</Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default MainFooter;
