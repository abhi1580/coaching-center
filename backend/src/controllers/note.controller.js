import asyncHandler from 'express-async-handler';
import Note from '../models/note.model.js';
import { cloudinary } from '../config/cloudinary.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Upload a new note
// @route   POST /api/notes/upload
// @access  Private (Teacher only)
const uploadNote = asyncHandler(async (req, res) => {
  try {
    const { title, batches } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File upload request:', {
      title,
      batches: batches ? 'Provided' : 'Not provided',
      file: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }
    });

    // Keep it simple - use a basic upload
    const result = await uploadToCloudinary(file.path, {
      folder: 'notes',
      resource_type: 'raw'
    });

    console.log('Upload successful, result:', {
      secure_url: result.secure_url,
      public_id: result.public_id
    });

    // Get file URL from Cloudinary
    const fileUrl = result.secure_url;

    // Create the note
    const note = await Note.create({
      title,
      fileUrl,
      batches: JSON.parse(batches),
      uploadedBy: req.user._id
    });

    console.log('Note created successfully:', {
      id: note._id,
      title: note.title
    });

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: note
    });
  } catch (error) {
    console.error('Error in uploadNote:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack
    });
  }
});

// @desc    Get all notes for a teacher
// @route   GET /api/notes/teacher
// @access  Private (Teacher only)
const getTeacherNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ uploadedBy: req.user._id })
    .populate('batches', 'name')
    .sort({ uploadedAt: -1 });

  res.json({
    success: true,
    data: notes
  });
});

// @desc    Get notes for a specific batch
// @route   GET /api/notes/batch/:batchId
// @access  Private
const getBatchNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ batches: req.params.batchId })
    .populate('uploadedBy', 'name')
    .sort({ uploadedAt: -1 });

  res.json({
    success: true,
    data: notes
  });
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private (Teacher only)
const deleteNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  
  // Find the note
  const note = await Note.findById(noteId);
  
  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }
  
  // Check if user owns the note
  if (note.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this note'
    });
  }
  
  try {
    // Extract public_id from the Cloudinary URL
    const urlParts = note.fileUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = `notes/${publicIdWithExtension.split('.')[0]}`;
    
    // Log deletion attempt
    console.log('Attempting to delete from Cloudinary:', publicId);
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    
    // Delete from database
    await Note.findByIdAndDelete(noteId);
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    
    // Delete from database anyway if Cloudinary fails
    await Note.findByIdAndDelete(noteId);
    
    res.json({
      success: true,
      message: 'Note deleted from database, but there was an issue removing the file'
    });
  }
});

export {
  uploadNote,
  getTeacherNotes,
  getBatchNotes,
  deleteNote
}; 