import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, MenuItem, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Button from '../../../components/ui/Button/Button';
import { fetchProducts } from '../../products/services/productService';

const SaleModal = ({ open, onClose, onSubmit, submitting }) => {
  const [saleCode, setSaleCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (open) {
      setSaleCode(`SALE-${Date.now().toString().slice(-6)}`);
      setCustomerName('');
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
    setItems([...items, { variant_id: '', qty: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto-fill price when product changes
    if (field === 'variant_id') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        newItems[index].unit_price = selectedProduct.price;
      }
    }
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      sale_code: saleCode,
      customer_name: customerName,
      sale_status: 'COMPLETED',
      notes,
      items: items.map(item => ({
        variant_id: item.variant_id,
        qty: Number(item.qty),
        unit_price: Number(item.unit_price)
      }))
    });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unit_price)), 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>New Sale Transaction</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <TextField
              label="Sale Code"
              required
              value={saleCode}
              onChange={(e) => setSaleCode(e.target.value)}
            />
            <TextField
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <TextField
              label="Notes"
              multiline
              rows={2}
              sx={{ gridColumn: 'span 2' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Items</Typography>
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
                    {p.name} {p.code ? `(${p.code})` : ''} - {p.availableQty} in stock
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Qty"
                type="number"
                required
                inputProps={{ min: 1 }}
                sx={{ width: '100px' }}
                value={item.qty}
                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
              />
              <TextField
                label="Unit Price ($)"
                type="number"
                required
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ width: '150px' }}
                value={item.unit_price}
                onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
              />
              <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Typography variant="h6">Total: ${calculateTotal().toFixed(2)}</Typography>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button value="Cancel" variant="text" onClick={onClose} disabled={submitting} />
          <Button value="Complete Sale" type="submit" loading={submitting} disabled={items.length === 0} />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SaleModal;
