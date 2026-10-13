import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useAttributeValues } from '../hooks/useAttributes';

const AttributeValuesPanel = ({ attribute }) => {
  const { values, loading, handleAddValue, handleUpdateValue, handleDeleteValue } = useAttributeValues(attribute?.attribute_id);
  const [newValue, setNewValue] = useState('');
  const [newOther, setNewOther] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingOther, setEditingOther] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    setAdding(true);
    await handleAddValue(newValue.trim(), newOther.trim() || null);
    setNewValue('');
    setNewOther('');
    setAdding(false);
  };

  const startEdit = (v) => {
    setEditingId(v.value_id);
    setEditingText(v.value || '');
    setEditingOther(v.other || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
    setEditingOther('');
  };

  const saveEdit = async (valueId) => {
    if (!editingText.trim()) return;
    setSavingEdit(true);
    await handleUpdateValue(valueId, editingText.trim(), editingOther.trim() || null);
    setSavingEdit(false);
    setEditingId(null);
    setEditingText('');
    setEditingOther('');
  };

  if (!attribute) return null;

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h2 className="attribute-panel-title">{attribute.attribute_name}</h2>
      <p className="attribute-panel-subtitle">Manage allowed values and optional secondary notes for this attribute.</p>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <div className="attribute-chip-cloud">
          {values.map((v) => (
            <div key={v.value_id} className={`attribute-chip ${editingId === v.value_id ? 'attribute-chip--editing' : ''}`}>
              {editingId === v.value_id ? (
                <form
                  className="attribute-chip-edit-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit(v.value_id);
                  }}
                >
                  <input
                    type="text"
                    className="attribute-chip-edit-input"
                    placeholder="Value (e.g. Stage 1)"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    autoFocus
                    disabled={savingEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <input
                    type="text"
                    className="attribute-chip-edit-input attribute-chip-edit-input--other"
                    placeholder="Other / note (e.g. 0-6m)"
                    value={editingOther}
                    onChange={(e) => setEditingOther(e.target.value)}
                    disabled={savingEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    type="submit"
                    className="attribute-chip__action-btn attribute-chip__action-btn--edit"
                    title="Save value and other note"
                    disabled={savingEdit}
                  >
                    <CheckRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    className="attribute-chip__action-btn attribute-chip__action-btn--delete"
                    onClick={cancelEdit}
                    title="Cancel"
                  >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                </form>
              ) : (
                <>
                  <span
                    className="attribute-chip__text"
                    onDoubleClick={() => startEdit(v)}
                    title="Double-click to edit value and other note"
                  >
                    <span className="attribute-chip__val">{v.value}</span>
                    {v.other && (
                      <span className="attribute-chip__other" title={`Other note: ${v.other}`}>
                        ({v.other})
                      </span>
                    )}
                  </span>
                  <div className="attribute-chip__actions">
                    <button
                      type="button"
                      className="attribute-chip__action-btn attribute-chip__action-btn--edit"
                      onClick={() => startEdit(v)}
                      title="Edit value & other note"
                    >
                      <EditOutlinedIcon sx={{ fontSize: 14 }} />
                    </button>
                    <button
                      type="button"
                      className="attribute-chip__action-btn attribute-chip__action-btn--delete"
                      onClick={() => handleDeleteValue(v.value_id)}
                      title="Delete value"
                    >
                      <CloseRoundedIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          <form onSubmit={onAdd} className="attribute-inline-add">
            <input
              type="text"
              placeholder="Value (e.g. Stage 1)..."
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={adding}
              autoFocus
            />
            <input
              type="text"
              className="attribute-inline-add__other"
              placeholder="Other note (e.g. 0-6m)..."
              value={newOther}
              onChange={(e) => setNewOther(e.target.value)}
              disabled={adding}
            />
            <button type="submit" disabled={!newValue.trim() || adding} title="Add value & note">
              <AddRoundedIcon fontSize="small" />
            </button>
          </form>
        </div>
      )}
    </Box>
  );
};

export default AttributeValuesPanel;