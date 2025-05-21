import VideoShare from '../models/videoShare.model.js';
import { validateYouTubeUrl, extractVideoId } from '../utils/youtubeUtils.js';

// Get all videos
export const getAllVideos = async (req, res) => {
  try {
    console.log('Fetching all videos');
    const videos = await VideoShare.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name');
    
    console.log(`Found ${videos.length} videos`);
    console.log('Videos:', videos.map(v => ({ 
      id: v._id, 
      title: v.title, 
      subject: v.subject 
    })));
    
    res.json(videos);
  } catch (error) {
    console.error('Error fetching all videos:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single video by ID
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await VideoShare.findById(id).populate('uploadedBy', 'name');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ 
      message: 'Error fetching video',
      error: error.message 
    });
  }
};

// Get videos by subject
export const getVideosBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    console.log('Fetching videos for subject:', subject);

    if (!subject) {
      console.error('No subject provided');
      return res.status(400).json({ message: 'Subject is required' });
    }

    // Convert subject to lowercase for matching
    const normalizedSubject = subject.toLowerCase();
    console.log('Normalized subject:', normalizedSubject);

    // Use exact match with lowercase subject
    const videos = await VideoShare.find({ subject: normalizedSubject })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name');

    console.log(`Found ${videos.length} videos for subject: ${normalizedSubject}`);
    console.log('Videos:', videos.map(v => ({ 
      id: v._id, 
      title: v.title, 
      subject: v.subject 
    })));
    
    res.json(videos);
  } catch (error) {
    console.error('Error in getVideosBySubject:', error);
    res.status(500).json({ 
      message: 'Error fetching videos by subject',
      error: error.message 
    });
  }
};

// Create a new video
export const createVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      youtubeLink,
      subject,
      channelName,
      channelId,
      uploadDate,
      videoId,
      thumbnail,
      duration,
      viewCount,
      likeCount,
      tags
    } = req.body;

    // Validate required fields
    if (!youtubeLink || !subject) {
      return res.status(400).json({ message: 'YouTube link and subject are required' });
    }

    // Validate YouTube URL
    if (!validateYouTubeUrl(youtubeLink)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    // Extract video ID
    const extractedVideoId = extractVideoId(youtubeLink);
    if (!extractedVideoId) {
      return res.status(400).json({ message: 'Could not extract video ID from URL' });
    }

    // Check if video already exists
    const existingVideo = await VideoShare.findOne({ videoId: extractedVideoId });
    if (existingVideo) {
      return res.status(400).json({ message: 'This video has already been added' });
    }

    // Convert subject to lowercase and validate
    const normalizedSubject = subject.toLowerCase().trim();
    console.log('Original subject:', subject);
    console.log('Normalized subject:', normalizedSubject);

    // Validate subject is one of the allowed values
    const allowedSubjects = ['physics', 'chemistry', 'mathematics'];
    if (!allowedSubjects.includes(normalizedSubject)) {
      return res.status(400).json({ 
        message: 'Invalid subject. Must be one of: physics, chemistry, mathematics' 
      });
    }

    // Create new video with normalized subject
    const video = new VideoShare({
      title,
      description,
      youtubeLink,
      videoId: extractedVideoId,
      thumbnail,
      channelName,
      channelId,
      uploadDate,
      duration,
      viewCount,
      likeCount,
      tags,
      subject: normalizedSubject, // Store normalized subject
      uploadedBy: req.user._id
    });

    console.log('Creating video with subject:', normalizedSubject);
    const savedVideo = await video.save();
    console.log('Saved video subject:', savedVideo.subject);
    
    res.status(201).json(savedVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a video
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject } = req.body;

    const video = await VideoShare.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Only allow updating title, description, and subject
    if (title) video.title = title;
    if (description) video.description = description;
    if (subject) video.subject = subject;

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await VideoShare.findById(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 