const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = "Resource not found";
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = "Duplicate field value entered";
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

export default errorHandler;
