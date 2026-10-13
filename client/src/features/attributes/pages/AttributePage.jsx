import React, { useMemo, useState } from 'react';
import './attribute.css';
import '../../products/pages/product.css';
import { Box, CircularProgress, IconButton, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import { useAttributes } from '../hooks/useAttributes';
import AttributeModal from '../components/AttributeModal';
import AttributeValuesPanel from '../components/AttributeValuesPanel';

const AttributePage = () => {
  const { attributes, loading, handleAdd, handleUpdate, handleDelete } = useAttributes();
  
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', editRow: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [deleting, setDeleting] = useState(null);
  const [expandedAttribute, setExpandedAttribute] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const filteredAttributes = useMemo(() => {
    if (!search.trim()) return attributes;
    return attributes.filter(a => a.attribute_name.toLowerCase().includes(search.toLowerCase()));
  }, [attributes, search]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const isEdit = modal.mode === 'edit';
    const result = isEdit 
      ? await handleUpdate(modal.editRow.attribute_id, data)
      : await handleAdd(data);
    
    setSubmitting(false);
    if (result.success) {
      setModal({ open: false, mode: 'create', editRow: null });
      showToast(isEdit ? 'Attribute updated.' : 'Attribute created.');
    } else {
      showToast(result.message || 'Error saving attribute', 'error');
    }
  };

  const confirmDelete = async () => {
    const result = await handleDelete(deleting);
    setDeleting(null);
    if (result.success) {
      if (expandedAttribute?.attribute_id === deleting) {
        setExpandedAttribute(null);
      }
      showToast('Attribute deleted.');
    } else {
      showToast(result.message || 'Error deleting attribute', 'error');
    }
  };

  const stats = useMemo(() => {
    return [
      {
        label: 'Dynamic Attributes',
        value: attributes.length,
        helper: 'Total attribute keys',
        icon: <StyleOutlinedIcon fontSize="small" />,
        tone: 'info',
      },
      {
        label: 'Configured Rules',
        value: filteredAttributes.length,
        helper: 'Visible in search',
        icon: <FactCheckOutlinedIcon fontSize="small" />,
        tone: 'default',
      }
    ];
  }, [attributes.length, filteredAttributes.length]);

  return (
    <div className="product-page attribute-page">
      {/* 1. Header Bar */}
      <div className="product-header">
        <div className="product-header__left">
          <h1 className="product-header__title">Attributes (EAV)</h1>
          <span className="product-header__badge">Variant Engine</span>
        </div>

        <div className="product-header__actions">
          <Button value="New Attribute" onClick={() => setModal({ open: true, mode: 'create', editRow: null })} />
        </div>
      </div>

      {/* 2. KPI Bar */}
      <div className="product-stats" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {stats.map((item) => (
          <div key={item.label} className={`product-stat-card ${item.tone ? `product-stat-card--${item.tone}` : ''}`}>
            <div className="product-stat-card__icon">{item.icon}</div>
            <div className="product-stat-card__info">
              <span className="product-stat-card__label">{item.label}</span>
              <span className="product-stat-card__value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="attribute-split-pane">
        {/* LEFT PANE - MASTER LIST */}
        <div className="attribute-left-pane">
          <div className="attribute-search-wrap">
            <Input
              leftIcon={<SearchIcon sx={{ fontSize: 19, color: '#94a3b8' }} />}
              placeholder="Search attributes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : filteredAttributes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              No attributes found.
            </div>
          ) : (
            filteredAttributes.map(attr => (
              <div 
                key={attr.attribute_id} 
                className={'attribute-card' + (expandedAttribute?.attribute_id === attr.attribute_id ? ' active' : '')}
                onClick={() => setExpandedAttribute(attr)}
              >
                <div className="attribute-card__title">{attr.attribute_name}</div>
                <div className="attribute-card__actions" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => setModal({ open: true, mode: 'edit', editRow: attr })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setDeleting(attr.attribute_id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <ChevronRightIcon sx={{ color: expandedAttribute?.attribute_id === attr.attribute_id ? '#4f46e5' : '#cbd5e1', ml: 1 }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANE - DETAIL VIEW */}
        <div className="attribute-right-pane">
          {expandedAttribute ? (
            <AttributeValuesPanel attribute={expandedAttribute} />
          ) : (
            <div className="attribute-empty-state">
              <DashboardCustomizeOutlinedIcon />
              <h3>Select an Attribute</h3>
              <p>Click on an attribute from the left menu to view and manage its predefined values.</p>
            </div>
          )}
        </div>
      </div>

      <AttributeModal
        open={modal.open}
        mode={modal.mode}
        defaultValues={modal.editRow}
        onClose={() => setModal({ open: false, mode: 'create', editRow: null })}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Attribute?</DialogTitle>
        <DialogContent>This will also remove all associated values and associations. This cannot be undone.</DialogContent>
        <DialogActions>
          <Button value="Cancel" variant="text" onClick={() => setDeleting(null)} />
          <Button value="Delete" onClick={confirmDelete} />
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default AttributePage;