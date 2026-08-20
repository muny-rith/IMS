import React, { useMemo, useState } from 'react';
import '../../products/pages/product.css';
import { Box, CircularProgress, IconButton, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import { useAttributes } from '../hooks/useAttributes';
import AttributeModal from '../components/AttributeModal';
import AttributeValuesPanel from '../components/AttributeValuesPanel';

const SummaryCard = ({ icon, title, value, helper, tone = 'default' }) => (
  <div className={`product-summary-card product-summary-card--${tone}`}>
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

  const columns = useMemo(() => [
    { field: 'attribute_name', headerName: 'Attribute Name', flex: 1 },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 0.5,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box className="product-table-actions" sx={{ justifyContent: 'flex-end', width: '100%', pr: 2 }}>
          <Tooltip title="Manage Values">
            <IconButton
              size="small"
              className="product-action product-action--view"
              onClick={() => setExpandedAttribute(
                expandedAttribute?.attribute_id === params.row.attribute_id ? null : params.row
              )}
            >
              <FormatListBulletedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              className="product-action product-action--edit"
              onClick={() => setModal({ open: true, mode: 'edit', editRow: params.row })}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              className="product-action product-action--delete"
              onClick={() => setDeleting(params.row.attribute_id)}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [expandedAttribute]);

  return (
    <div className="product-page">
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

      <section className="product-panel">
        <section className="product-toolbar">
          <div>
            <h6 className="product-panel__title">Current Attributes</h6>
            <p className="product-panel__subtitle">
              Search and manage your global attribute keys and allowed values.
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

        <div className="product-panel__header">
          <div className="product-panel__meta">
            <p className="product-panel__eyebrow">Live attributes</p>
            <div className="product-panel__badge">{filteredAttributes.length} visible</div>
          </div>
        </div>

        <div className="product-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : (
            <div className="product-desktop-table">
              <DataTable 
                rows={filteredAttributes.map(a => ({ id: a.attribute_id, ...a }))} 
                columns={columns} 
              />
            </div>
          )}
        </div>

        {expandedAttribute && (
          <Box sx={{ mt: 3, p: 3, bgcolor: '#ffffff', borderRadius: 4, border: '1px solid #eef2f7', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}>
            <AttributeValuesPanel attribute={expandedAttribute} />
          </Box>
        )}
      </section>

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
