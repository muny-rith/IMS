import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, MenuItem, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Button from '../../../components/ui/Button/Button';
import { fetchProducts } from '../../products/services/productService';

const ISSUE_TYPES = [
  'INTERNAL_USE',
  'DAMAGE',
  'LOSS',
  'EXPIRED',
  'GIVEAWAY'
];

const StockIssueModal = ({ open, onClose, onSubmit, submitting }) => {
  const [issueCode, setIssueCode] = useState('');
  const [issueType, setIssueType] = useState('INTERNAL_USE');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (open) {
      setIssueCode(`ISSUE-${Date.now().toString().slice(-6)}`);
      setIssueType('INTERNAL_USE');
      setNotes('');
      setItems([]);
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { variant_id: '', qty: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      issue_code: issueCode,
      issue_type: issueType,
      notes,
      items: items.map(item => ({
        variant_id: item.variant_id,
        qty: Number(item.qty),
      }))
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>New Stock Issue</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Issue Code"
              required
              value={issueCode}
              onChange={(e) => setIssueCode(e.target.value)}
            />
            <TextField
              select
              label="Issue Type"
              required
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              {ISSUE_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Notes/Reason"
              multiline
              rows={2}
              sx={{ gridColumn: 'span 2' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Items to Dispatch</Typography>
            <IconButton color="primary" onClick={handleAddItem}><AddCircleIcon /></IconButton>
          </Box>

          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                select
                label="Product/Variant"
                fullWidth
                required
                value={item.variant_id}
                onChange={(e) => handleItemChange(index, 'variant_id', e.target.value)}
              >
                {products.map(p => (
                  <MenuItem key={p.id} value={p.id} disabled={p.availableQty <= 0}>
                    {p.name} {p.code ? `(${p.code})` : ''} - {p.availableQty} in stock
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Qty"
                type="number"
                required
                inputProps={{ min: 1 }}
                sx={{ width: '150px' }}
                value={item.qty}
                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
              />
              <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button value="Cancel" variant="text" onClick={onClose} disabled={submitting} />
          <Button value="Issue Stock" type="submit" loading={submitting} disabled={items.length === 0} />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StockIssueModal;
