import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, MenuItem, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Button from '../../../components/ui/Button/Button';
import { fetchProducts } from '../../products/services/productService';

const PurchaseRequestModal = ({ open, onClose, onSubmit, submitting }) => {
  const [requestCode, setRequestCode] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (open) {
      setRequestCode(`PR-${Date.now().toString().slice(-6)}`);
      setSupplierName('');
      setExpectedDate('');
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
    setItems([...items, { variant_id: '', requested_qty: 1, unit_cost: 0 }]);
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
      request_code: requestCode,
      supplier_name: supplierName,
      expected_delivery_date: expectedDate || null,
      notes,
      items: items.map(item => ({
        variant_id: item.variant_id,
        requested_qty: Number(item.requested_qty),
        unit_cost: Number(item.unit_cost)
      }))
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>New Purchase Request</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Request Code"
              required
              value={requestCode}
              onChange={(e) => setRequestCode(e.target.value)}
            />
            <TextField
              label="Supplier Name"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
            <TextField
              label="Expected Delivery Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Requested Items</Typography>
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
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} {p.code ? `(${p.code})` : ''}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Qty"
                type="number"
                required
                inputProps={{ min: 1 }}
                sx={{ width: '120px' }}
                value={item.requested_qty}
                onChange={(e) => handleItemChange(index, 'requested_qty', e.target.value)}
              />
              <TextField
                label="Est. Cost ($)"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ width: '150px' }}
                value={item.unit_cost}
                onChange={(e) => handleItemChange(index, 'unit_cost', e.target.value)}
              />
              <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button value="Cancel" variant="text" onClick={onClose} disabled={submitting} />
          <Button value="Submit Request" type="submit" loading={submitting} disabled={items.length === 0} />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PurchaseRequestModal;
