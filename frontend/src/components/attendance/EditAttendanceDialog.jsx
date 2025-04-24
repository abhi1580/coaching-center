import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  IconButton,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as LateIcon,
  MedicalServices as ExcusedIcon
} from '@mui/icons-material';

const EditAttendanceDialog = ({ open, onClose, record, onSave, formatDate }) => {
  const theme = useTheme();
  
  const [status, setStatus] = useState('absent');
  const [remarks, setRemarks] = useState('');
  
  // Initialize form when record changes
  useEffect(() => {
    if (record) {
      setStatus(record.status || 'absent');
      setRemarks(record.remarks || '');
    }
  }, [record]);
  
  // Handle save
  const handleSave = () => {
    if (record) {
      onSave(record, status, remarks);
    }
  };
  
  // Get status color based on attendance status
  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'present':
        return theme.palette.success.main;
      case 'absent':
        return theme.palette.error.main;
      case 'late':
        return theme.palette.warning.main;
      case 'excused':
        return theme.palette.info.main;
      case 'cancelled':
        return theme.palette.grey[700];
      default:
        return theme.palette.grey[500];
    }
  };
  
  if (!record) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Edit Attendance Record
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Student Details
          </Typography>
          <Typography variant="body1">
            Name: {record.studentId?.name || 'Unknown'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {record.studentId?.email || 'No email'}
          </Typography>
          {record._id && (
            <Typography variant="caption" color="text.secondary">
              Date: {record.date ? formatDate(record.date) : 'Current date'}
            </Typography>
          )}
        </Box>
        
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <FormLabel component="legend">Attendance Status</FormLabel>
          <RadioGroup
            row
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <FormControlLabel 
              value="present" 
              control={
                <Radio 
                  icon={<PresentIcon />} 
                  checkedIcon={<PresentIcon />} 
                  sx={{ 
                    color: alpha(getStatusColor('present'), 0.6),
                    '&.Mui-checked': {
                      color: getStatusColor('present'),
                    } 
                  }}
                />
              } 
              label="Present" 
            />
            <FormControlLabel 
              value="absent" 
              control={
                <Radio 
                  icon={<AbsentIcon />} 
                  checkedIcon={<AbsentIcon />} 
                  sx={{ 
                    color: alpha(getStatusColor('absent'), 0.6),
                    '&.Mui-checked': {
                      color: getStatusColor('absent'),
                    } 
                  }}
                />
              } 
              label="Absent" 
            />
            <FormControlLabel 
              value="late" 
              control={
                <Radio 
                  icon={<LateIcon />} 
                  checkedIcon={<LateIcon />} 
                  sx={{ 
                    color: alpha(getStatusColor('late'), 0.6),
                    '&.Mui-checked': {
                      color: getStatusColor('late'),
                    } 
                  }}
                />
              } 
              label="Late" 
            />
            <FormControlLabel 
              value="excused" 
              control={
                <Radio 
                  icon={<ExcusedIcon />} 
                  checkedIcon={<ExcusedIcon />} 
                  sx={{ 
                    color: alpha(getStatusColor('excused'), 0.6),
                    '&.Mui-checked': {
                      color: getStatusColor('excused'),
                    } 
                  }}
                />
              } 
              label="Excused" 
            />
            <Tooltip title="No class was arranged for this day">
              <FormControlLabel 
                value="cancelled" 
                control={
                  <Radio 
                    icon={<CloseIcon />} 
                    checkedIcon={<CloseIcon />} 
                    sx={{ 
                      color: alpha(getStatusColor('cancelled'), 0.6),
                      '&.Mui-checked': {
                        color: getStatusColor('cancelled'),
                      } 
                    }}
                  />
                } 
                label="Cancelled" 
              />
            </Tooltip>
          </RadioGroup>
        </FormControl>
        
        <TextField
          label="Remarks"
          multiline
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          fullWidth
          placeholder="Add any notes or comments about this attendance record"
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          sx={{ 
            bgcolor: getStatusColor(status),
            '&:hover': {
              bgcolor: alpha(getStatusColor(status), 0.8),
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAttendanceDialog; 