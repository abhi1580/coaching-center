import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./MainFooter.css";

function MainFooter() {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={3} className="mb-4">
            <h3 className="footer-title">Imperial Academy</h3>
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
            <ul className="footer-links">
              <li>
                <Link to="/courses">Courses</Link>
              </li>
              <li>
                <Link to="/admission">Admission</Link>
              </li>
              <li>
                <Link to="/resources">Resources</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
            </ul>
          </Col>

          <Col md={3} className="mb-4">
            <h5 className="footer-title">Opening Hours</h5>
            <ul className="footer-links">
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
            <div className="social-icons">
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

        <Row className="mt-3">
          <Col xs={12} className="text-center mb-3">
            <ul className="list-inline footer-links mb-0">
              <li className="list-inline-item mx-3">
                <Link to="/terms-of-service">Terms of Service</Link>
              </li>
              <li className="list-inline-item mx-3">
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li className="list-inline-item mx-3">
                <Link to="/cookies-policy">Cookies</Link>
              </li>
            </ul>
          </Col>
          <Col xs={12} className="text-center">
            <p className="footer-text mb-2">
              &copy; 2025 <strong>Imperial Academy</strong>. All Rights
              Reserved.
            </p>
            <p className="footer-text mb-0">
              Powered by: <strong>Triveni Systems Pvt. Ltd</strong>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default MainFooter;
