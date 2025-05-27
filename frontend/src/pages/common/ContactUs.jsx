import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./ContactUs.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <Container>
          <div className="hero-content">
            <h1>Contact Us</h1>
            <p>Get in touch with us for any queries or information</p>
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <Container>
          <Row>
            {/* Contact Information */}
            <Col lg={4} className="mb-4">
              <div className="contact-card">
                <div className="contact-info">
                  <div className="contact-icon">
                    <FaPhone />
                  </div>
                  <div className="contact-text">
                    <h3>Phone</h3>
                    <p>+91 1234567890</p>
                  </div>
                </div>

                <div className="contact-info">
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>
                  <div className="contact-text">
                    <h3>Email</h3>
                    <p>info@coachingcenter.com</p>
                  </div>
                </div>

                <div className="contact-info">
                  <div className="contact-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="contact-text">
                    <h3>Address</h3>
                    <p>123 Education Street, Pune, Maharashtra, India</p>
                  </div>
                </div>

                <div className="contact-info">
                  <div className="contact-icon">
                    <FaClock />
                  </div>
                  <div className="contact-text">
                    <h3>Working Hours</h3>
                    <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </Col>

            {/* Contact Form */}
            <Col lg={8}>
              <div className="contact-form">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter subject"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Enter your message"
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="btn-submit">
                    Send Message
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>

          {/* Map Section */}
          <Row className="mt-5">
            <Col>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.265588856342!2d73.9145564154167!3d18.562061287384868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c147b8b3a3bf%3A0x6f7fdcc8e4d6c77e!2sPhoenix%20Marketcity%20Pune!5e0!3m2!1sen!2sin!4v1647884581947!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ContactUs;
