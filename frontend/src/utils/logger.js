const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, but with minimal information in production
    if (isDevelopment) {
      console.error(...args);
    } else {
      console.error(
        "An error occurred. Please contact support if this persists."
      );
    }
  },
};
