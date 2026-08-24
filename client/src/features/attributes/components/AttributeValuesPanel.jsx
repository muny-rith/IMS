import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
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
    <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h2 className="attribute-panel-title">{attribute.attribute_name}</h2>
      <p className="attribute-panel-subtitle">Manage allowed values for this attribute.</p>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <div className="attribute-chip-cloud">
          {values.map((v) => (
            <div key={v.value_id} className="attribute-chip">
              {v.value}
              <div 
                className="attribute-chip__delete" 
                onClick={() => handleDeleteValue(v.value_id)}
                title="Delete value"
              >
                <CloseRoundedIcon fontSize="small" />
              </div>
            </div>
          ))}

          <form onSubmit={onAdd} className="attribute-inline-add">
            <input
              type="text"
              placeholder="Add new value..."
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={adding}
              autoFocus
            />
            <button type="submit" disabled={!newValue.trim() || adding} title="Add value">
              <AddRoundedIcon fontSize="small" />
            </button>
          </form>
        </div>
      )}
    </Box>
  );
};

export default AttributeValuesPanel;