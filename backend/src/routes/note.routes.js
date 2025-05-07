import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadNote, getTeacherNotes, getBatchNotes, deleteNote } from '../controllers/note.controller.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Test route for Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
  try {
    // Create a simple text file for testing
    const testFilePath = path.join(process.cwd(), 'temp-test.txt');
    fs.writeFileSync(testFilePath, 'Test content for Cloudinary upload');
    
    console.log('Created test file at:', testFilePath);
    
    // Log Cloudinary environment variables
    console.log('Cloudinary Config Check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });

    // Try to upload to Cloudinary
    const result = await uploadToCloudinary(testFilePath, {
      folder: 'test',
      resource_type: 'raw'
    });
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    // Return success
    return res.json({
      success: true,
      message: 'Cloudinary connection test successful',
      result
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Cloudinary connection test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Upload a new note (teacher only)
router.post('/upload', protect, authorize('teacher'), upload.single('file'), uploadNote);

// Get all notes for a teacher
router.get('/teacher', protect, authorize('teacher'), getTeacherNotes);

// Get notes for a specific batch (accessible by both teachers and students)
router.get('/batch/:batchId', protect, getBatchNotes);

// Delete a note
router.delete('/:id', protect, authorize('teacher'), deleteNote);

export default router; 