import React, { useState } from 'react';
import { Box, Typography, Chip, TextField, IconButton, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAttributeValues } from '../hooks/useAttributes';

const AttributeValuesPanel = ({ attribute }) => {
  const { values, loading, handleAddValue, handleDeleteValue } = useAttributeValues(attribute?.attribute_id);
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    setAdding(true);
    await handleAddValue(newValue.trim());
    setNewValue('');
    setAdding(false);
  };

  if (!attribute) return null;

  return (
    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0', mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: '#334155' }}>
        Values for <strong>{attribute.attribute_name}</strong>
      </Typography>
      
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {values.map((v) => (
            <Chip
              key={v.value_id}
              label={v.value}
              onDelete={() => handleDeleteValue(v.value_id)}
              size="small"
              sx={{ bgcolor: 'white', border: '1px solid #cbd5e1' }}
            />
          ))}
          {values.length === 0 && (
            <Typography variant="body2" color="textSecondary">No values defined yet.</Typography>
          )}
        </Box>
      )}

      <form onSubmit={onAdd} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="New value (e.g., Red)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          disabled={adding}
        />
        <IconButton type="submit" color="primary" disabled={!newValue.trim() || adding} size="small" sx={{ bgcolor: '#e0e7ff' }}>
          <AddIcon />
        </IconButton>
      </form>
    </Box>
  );
};

export default AttributeValuesPanel;
