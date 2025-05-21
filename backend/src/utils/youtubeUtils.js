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