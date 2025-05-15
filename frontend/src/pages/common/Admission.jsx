import { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";

function Admission() {
  const [formData, setFormData] = useState({
    name: "",
    motherName: "",
    fatherOccupation: "",
    gender: "",
    dob: "",
    class: "",
    subject: "",
    aadhar: "",
    parentsPhone: "",
    email: "",
    categoryGeneral: false,
    categoryOBC: false,
    categorySC: false,
    categoryST: false,
    address: "",
    mediumMarathi: false,
    mediumSemi: false,
    mediumEnglish: false,
    mediumCBSE: false,
    mediumICSE: false,
    percentage: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Container className="my-4 text-start">
        <h3 className="mb-4 text-center section-title">Admission Form</h3>
        <Card className="p-4 admission-form-card">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formName">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formMotherName">
                <Form.Label>Mother's Name</Form.Label>
                <Form.Control
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formFatherOccupation">
                <Form.Label>Father's Occupation</Form.Label>
                <Form.Control
                  type="text"
                  name="fatherOccupation"
                  value={formData.fatherOccupation}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDOB">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <hr />

          <Form.Group className="mb-3" controlId="formGender">
            <Form.Label>Gender</Form.Label>
            <div>
              <Form.Check
                inline
                label="Male"
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              />
              <Form.Check
                inline
                label="Female"
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              />
              <Form.Check
                inline
                label="Other"
                type="radio"
                name="gender"
                value="Other"
                checked={formData.gender === "Other"}
                onChange={handleChange}
              />
            </div>
          </Form.Group>
          <hr />

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formClass">
                <Form.Label>Class</Form.Label>
                <Form.Select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Class</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formSubject">
                <Form.Label>Subject</Form.Label>
                <Form.Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Mechanics">Mechanics</option>
                  <option value="Electromagnetism">Electromagnetism</option>
                  <option value="Thermodynamics">Thermodynamics</option>
                  <option value="Optics">Optics</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <hr />
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="formAdhar">
                <Form.Label>Aadhar Number</Form.Label>
                <Form.Control
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="formParentsPhone">
                <Form.Label>Parents' Mobile Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="parentsPhone"
                  value={formData.parentsPhone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="formStudentPhone">
                <Form.Label>Student's Mobile Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="studentPhone"
                  value={formData.studentPhone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <hr />

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <hr />

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCategory">
                <Form.Label>Category</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  <Form.Check
                    type="checkbox"
                    label="General"
                    name="categoryGeneral"
                    checked={formData.categoryGeneral}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="OBC"
                    name="categoryOBC"
                    checked={formData.categoryOBC}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="SC"
                    name="categorySC"
                    checked={formData.categorySC}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="ST"
                    name="categoryST"
                    checked={formData.categoryST}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formMedium">
                <Form.Label>Medium</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  <Form.Check
                    type="checkbox"
                    label="Marathi"
                    name="mediumMarathi"
                    checked={formData.mediumMarathi}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="Semi-English"
                    name="mediumSemi"
                    checked={formData.mediumSemi}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="English"
                    name="mediumEnglish"
                    checked={formData.mediumEnglish}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="CBSE"
                    name="mediumCBSE"
                    checked={formData.mediumCBSE}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="checkbox"
                    label="ICSE"
                    name="mediumICSE"
                    checked={formData.mediumICSE}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          <hr />

          <Form.Group className="mb-3" controlId="formPercentage">
            <Form.Label>Percentage</Form.Label>
            <Form.Control
              type="number"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="100"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAddress">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-3">
            Submit
          </Button>
        </Card>
      </Container>
    </Form>
  );
}

export default Admission;
