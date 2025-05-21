import api from '../services/common/apiClient';

// YouTube URL validation patterns
const youtubePatterns = [
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})$/,
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})$/,
  /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/)([a-zA-Z0-9_-]{11})$/
];

/**
 * Validates a YouTube URL
 * @param {string} url - The YouTube URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const validateYouTubeUrl = (url) => {
  return youtubePatterns.some(pattern => pattern.test(url));
};

/**
 * Extracts the video ID from a YouTube URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The video ID or null if not found
 */
export const extractVideoId = (url) => {
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

/**
 * Formats ISO 8601 duration to MM:SS format
 * @param {string} duration - ISO 8601 duration string
 * @returns {string} - Formatted duration
 */
export const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '00:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  let totalSeconds = 0;
  if (hours) totalSeconds += parseInt(hours) * 3600;
  if (minutes) totalSeconds += parseInt(minutes) * 60;
  if (seconds) totalSeconds += parseInt(seconds);

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Fetches video details from YouTube API
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Object>} - Video details
 */
export const fetchVideoDetails = async (videoId) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = data.items[0];
    const { snippet, contentDetails, statistics } = video;

    return {
      title: snippet.title,
      description: snippet.description,
      channelName: snippet.channelTitle,
      channelId: snippet.channelId,
      uploadDate: snippet.publishedAt,
      videoId: video.id,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: snippet.thumbnails.high.url,
      duration: formatDuration(contentDetails.duration),
      viewCount: parseInt(statistics.viewCount) || 0,
      likeCount: parseInt(statistics.likeCount) || 0,
      tags: snippet.tags || []
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}; 