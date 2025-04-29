import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

/**
 * A reusable confirmation dialog for delete operations
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Function to call when the dialog is closed without confirming
 * @param {function} props.onConfirm - Function to call when delete is confirmed
 * @param {string} props.title - Title of the dialog
 * @param {string} props.message - Message to display in the dialog
 * @param {string} props.itemName - Name of the item being deleted (optional)
 * @param {boolean} props.loading - Whether delete operation is in progress
 */
const DeleteConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    title = "Confirm Delete",
    message = "Are you sure you want to delete this item?",
    itemName,
    loading = false,
}) => {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    bgcolor: "error.main",
                    color: "error.contrastText",
                    py: 2,
                }}
            >
                {title}
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="body1">
                        {itemName ? `${message} "${itemName}"?` : message}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    color="error"
                    sx={{
                        borderRadius: 2,
                        minWidth: 100,
                        position: "relative",
                    }}
                >
                    {loading ? (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: "inherit",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                marginTop: "-12px",
                                marginLeft: "-12px",
                            }}
                        />
                    ) : (
                        "Delete"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmationDialog; 