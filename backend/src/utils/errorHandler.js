export const handleError = (res, error) => {
  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};
