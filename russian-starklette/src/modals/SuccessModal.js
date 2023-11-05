import React, { useState } from 'react';
import { Snackbar, SnackbarContent, IconButton, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

const SuccessModal = ({ open, onClose, message }) => {
    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
        <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
            {message}
        </Alert>
      </Snackbar>
      );
}

export default SuccessModal