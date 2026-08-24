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

import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import { useAttributes } from '../hooks/useAttributes';
import AttributeModal from '../components/AttributeModal';
import AttributeValuesPanel from '../components/AttributeValuesPanel';

const SummaryCard = ({ icon, title, value, helper, tone = 'default' }) => (
  <div className={'product-summary-card product-summary-card--' + tone}>
    <div className="product-summary-card__icon">{icon}</div>
    <div className="product-summary-card__content">
      <div className="product-summary-card__title">{title}</div>
      <div className="product-summary-card__value">{value}</div>
      <div className="product-summary-card__helper">{helper}</div>
    </div>
  </div>
);

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
      <section className="product-page__hero">
        <div>
          <p className="product-page__eyebrow">Variant Engine</p>
          <h4 className="product-page__title">Attributes (EAV)</h4>
          <p className="product-page__subtitle">
            Manage dynamic product traits (e.g. Size, Color, Storage) to build highly customizable variants.
          </p>
        </div>

        <div className="product-page__stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {stats.map((item) => (
            <SummaryCard
              key={item.label}
              icon={item.icon}
              title={item.label}
              value={item.value}
              helper={item.helper}
              tone={item.tone}
            />
          ))}
        </div>
      </section>

      <section className="product-toolbar">
        <div>
          <h6 className="product-panel__title">Current Attributes</h6>
          <p className="product-panel__subtitle">
            Select an attribute to manage its allowed values.
          </p>
        </div>

        <div className="product-toolbar__controls">
          <Button value="New Attribute" onClick={() => setModal({ open: true, mode: 'create', editRow: null })} />
          <div className="product-toolbar__search">
            <Input
              leftIcon={<i className="fa-solid fa-magnifying-glass" />}
              placeholder="Search attributes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="attribute-split-pane">
        {/* LEFT PANE - MASTER LIST */}
        <div className="attribute-left-pane">
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