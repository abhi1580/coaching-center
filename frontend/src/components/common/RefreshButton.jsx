import React, { useState } from "react";
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

/**
 * A reusable refresh button component with loading state
 * @param {Object} props - The component props
 * @param {Function} props.onRefresh - Function to call when refresh is clicked
 * @param {string} props.tooltip - Tooltip text to display (default: "Refresh data")
 * @param {string} props.size - Button size (default: "medium")
 * @param {string} props.color - Button color (default: "primary")
 * @param {Object} props.sx - Additional styles for the button
 */
const RefreshButton = ({
  onRefresh,
  tooltip = "Refresh data",
  size = "medium",
  color = "primary",
  sx = {},
}) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={handleRefresh}
        size={size}
        color={color}
        disabled={loading}
        sx={sx}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <RefreshIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default RefreshButton; 