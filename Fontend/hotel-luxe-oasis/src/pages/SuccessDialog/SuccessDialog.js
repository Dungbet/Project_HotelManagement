import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const SuccessDialog = ({ open, message, onClose }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Thành công</DialogTitle>
        <DialogContent>
            <p>{message}</p>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="primary">
                Đóng
            </Button>
        </DialogActions>
    </Dialog>
);

export default SuccessDialog;
