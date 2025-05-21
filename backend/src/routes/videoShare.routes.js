import express from 'express';
import { getAllVideos, getVideosBySubject, createVideo, updateVideo, deleteVideo, getVideoById } from '../controllers/videoShare.controller.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllVideos);
router.get('/subject/:subject', getVideosBySubject);
router.get('/:id', getVideoById);

// Protected routes - admin only
router.post('/', protect, authorize('admin'), createVideo);
router.put('/:id', protect, authorize('admin'), updateVideo);
router.delete('/:id', protect, authorize('admin'), deleteVideo);

export default router; 