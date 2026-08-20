import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import Button from '../../../components/ui/Button/Button';

const AttributeModal = ({ open, onClose, onSubmit, submitting, mode, defaultValues }) => {
  const [attributeName, setAttributeName] = useState('');

  useEffect(() => {
    if (open) {
      setAttributeName(defaultValues?.attribute_name || '');
    }
  }, [open, defaultValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ attribute_name: attributeName });
  };

  const isEdit = mode === 'edit';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Attribute' : 'New Attribute'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Attribute Name"
              fullWidth
              required
              value={attributeName}
              onChange={(e) => setAttributeName(e.target.value)}
              placeholder="e.g., Color, Size, Storage"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button value="Cancel" variant="text" onClick={onClose} disabled={submitting} />
          <Button value={isEdit ? 'Save Changes' : 'Add Attribute'} type="submit" loading={submitting} />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AttributeModal;
