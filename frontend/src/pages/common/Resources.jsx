import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

const notesData = [
  {
    title: 'Class 10 Math Notes',
    subject: 'Mathematics',
    fileUrl: '/downloads/math10.pdf',
  },
  {
    title: 'Science Revision Notes',
    subject: 'Science',
    fileUrl: '/downloads/science_revision.pdf',
  },
  {
    title: 'English Grammar Notes',
    subject: 'English',
    fileUrl: '/downloads/english_grammar.pdf',
  },
];

const Resources = () => {
  const [videoLectures, setVideoLectures] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/resources/videos');
        setVideoLectures(res.data);
      } catch (err) {
        console.error('Error fetching videos:', err);
      }
    };
    fetchVideos();
  }, []);

  const subjects = ['All', ...new Set(videoLectures.map((v) => v.subject))];
  const filteredVideos =
    selectedSubject === 'All'
      ? videoLectures
      : videoLectures.filter((v) => v.subject === selectedSubject);

  return (
    <Box sx={{ p: 4 }}>
      {/* Notes Section */}
      <Typography variant="h4" gutterBottom>
        Downloadable Notes
      </Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {notesData.map((note, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6">{note.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {note.subject}
                  </Typography>
                  <Button
                    variant="outlined"
                    href={note.fileUrl}
                    download
                    sx={{ mt: 2 }}
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Video Lectures Section */}
      <Typography variant="h4" gutterBottom>
        Video Lectures
      </Typography>

      <Box sx={{ mb: 3 }}>
        {subjects.map((subject) => (
          <Button
            key={subject}
            variant={selectedSubject === subject ? 'contained' : 'outlined'}
            onClick={() => setSelectedSubject(subject)}
            sx={{ m: 1 }}
          >
            {subject}
          </Button>
        ))}
      </Box>

      <Grid container spacing={3}>
        {filteredVideos.map((video, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card elevation={4}>
                <CardMedia
                  component="iframe"
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                  height="200"
                />
                <CardContent>
                  <Typography variant="h6">{video.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {video.subject}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Resources;