/**
 * Safely converts an object to a string representation,
 * avoiding circular reference errors or type errors.
 * 
 * @param {any} obj - The object to convert to string
 * @param {number} [maxDepth=2] - Maximum depth to stringify
 * @returns {string} - String representation of the object
 */
export const safeStringify = (obj, maxDepth = 2) => {
  try {
    // Create a new object with only primitive values and first level objects
    const simplify = (data, depth = 0) => {
      if (depth > maxDepth) {
        return '[Object]'; // Stop at max depth
      }
      
      if (data === null || data === undefined) {
        return data;
      }
      
      if (typeof data !== 'object') {
        return data;
      }
      
      if (Array.isArray(data)) {
        return data.map(item => depth < maxDepth ? simplify(item, depth + 1) : '[Object]');
      }
      
      const result = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = simplify(data[key], depth + 1);
        }
      }
      return result;
    };
    
    return JSON.stringify(simplify(obj));
  } catch (error) {
    return `[Error stringifying object: ${error.message}]`;
  }
};

/**
 * Validates user data from localStorage to ensure it has required fields
 * 
 * @param {object} user - User object to validate
 * @returns {boolean} - Whether the user object is valid
 */
export const isValidUserData = (user) => {
  if (!user || typeof user !== 'object') {
    return false;
  }
  
  // Check for minimum required properties
  return !!(user.id && user.role);
}; 