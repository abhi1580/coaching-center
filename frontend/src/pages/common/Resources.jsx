import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const SUBJECTS = [
  { label: 'All', value: 'all' },
  { label: 'Mathematics', value: 'mathematics' },
  { label: 'Science', value: 'science' },
  { label: 'English', value: 'english' },
  { label: 'History', value: 'history' },
];

const notesData = [
  {
    title: 'Class 10 Math Notes',
    subject: 'Mathematics',
    fileUrl: '/downloads/class10-math-notes.pdf',
  },
  {
    title: 'Science Revision Notes',
    subject: 'Science',
    fileUrl: '/downloads/science-revision-notes.pdf',
  },
  {
    title: 'English Grammar Notes',
    subject: 'English',
    fileUrl: '/downloads/english-grammar-notes.pdf',
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

function Resources() {
  const [videos, setVideos] = useState([]);
  const [activeVideoSubject, setActiveVideoSubject] = useState('all');

  useEffect(() => {
    axios.get('http://localhost:5000/api/resources/videos')
      .then(res => setVideos(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredVideos =
    activeVideoSubject === 'all'
      ? videos
      : videos.filter(video => video.subject.toLowerCase() === activeVideoSubject.toLowerCase());

  const handleTabClick = (subject) => {
    setActiveVideoSubject(subject);
  };

  const videoGrid = (
    <Row>
      {filteredVideos.map((video, index) => (
        <Col md={6} lg={4} className="mb-4" key={index}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="h-100 shadow-sm">
              <div className="ratio ratio-16x9">
                <iframe
                  className="rounded-top"
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                />
              </div>
              <Card.Body>
                <Card.Title>{video.title}</Card.Title>
                <Card.Text><strong>Subject:</strong> {video.subject}</Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );

  return (
    <div>
      {/* Notes Section */}
      <section className="bg-light py-5">
        <Container>
          <motion.h2
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Downloadable Notes
          </motion.h2>
          <Row>
            {notesData.map((note, index) => (
              <Col md={6} lg={4} className="mb-4" key={index}>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title>{note.title}</Card.Title>
                      <Card.Text><strong>Subject:</strong> {note.subject}</Card.Text>
                      <Button
                        variant="success"
                        href={note.fileUrl}
                        download
                      >
                        Download
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Video Lectures Section */}
      <section className="py-5">
        <Container>
          <motion.h2
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Video Lectures
          </motion.h2>

          {/* Subject Tabs */}
          <motion.div
            className="subject-tabs mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {SUBJECTS.map((subject) => (
                <Button
                  key={subject.value}
                  variant={activeVideoSubject === subject.value ? 'primary' : 'outline-primary'}
                  onClick={() => handleTabClick(subject.value)}
                >
                  {subject.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Video Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {videoGrid}
          </motion.div>
        </Container>
      </section>
    </div>
  );
}

export default Resources;