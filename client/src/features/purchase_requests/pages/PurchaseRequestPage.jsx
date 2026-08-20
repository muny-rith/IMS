import React, { useMemo, useState } from 'react';
import '../../products/pages/product.css';
import { Box, CircularProgress, Snackbar, Alert, Chip, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import { usePurchaseRequests } from '../hooks/usePurchaseRequests';
import PurchaseRequestModal from '../components/PurchaseRequestModal';

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

const PurchaseRequestPage = () => {
  const { requests, loading, handleCreate, handleUpdateStatus } = usePurchaseRequests();
  
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    return requests.filter(r => 
      r.request_code.toLowerCase().includes(search.toLowerCase()) || 
      (r.supplier_name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [requests, search]);

  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const approved = requests.filter(r => r.status === 'APPROVED').length;
    const completed = requests.filter(r => r.status === 'COMPLETED').length;

    return [
      {
        label: 'Pending Approval',
        value: pending,
        helper: 'Awaiting review',
        icon: <HourglassEmptyOutlinedIcon fontSize="small" />,
        tone: 'warning',
      },
      {
        label: 'Approved (In Transit)',
        value: approved,
        helper: 'Ready to receive',
        icon: <FactCheckOutlinedIcon fontSize="small" />,
        tone: 'info',
      },
      {
        label: 'Completed',
        value: completed,
        helper: 'Received stock',
        icon: <CheckCircleOutlineOutlinedIcon fontSize="small" />,
        tone: 'success',
      }
    ];
  }, [requests]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const result = await handleCreate(data);
    setSubmitting(false);
    
    if (result.success) {
      setModalOpen(false);
      showToast('Purchase request created successfully.');
    } else {
      showToast(result.message || 'Error creating request', 'error');
    }
  };

  const updateStatus = async (id, status) => {
    const result = await handleUpdateStatus(id, status);
    if (result.success) {
      showToast(`Request marked as ${status}.`);
    } else {
      showToast(result.message || 'Error updating status', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'COMPLETED': return 'success';
      case 'REJECTED':
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const columns = useMemo(() => [
    { field: 'request_code', headerName: 'Request Code', flex: 1 },
    { field: 'supplier_name', headerName: 'Supplier', flex: 1.5, renderCell: (p) => p.value || '—' },
    { field: 'status', headerName: 'Status', flex: 1, renderCell: (p) => (
      <Chip label={p.value} color={getStatusColor(p.value)} size="small" />
    )},
    { field: 'created_at', headerName: 'Date', flex: 1, renderCell: (p) => new Date(p.value).toLocaleDateString() },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
          {params.row.status === 'PENDING' && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" onClick={() => updateStatus(params.row.request_id, 'APPROVED')}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" onClick={() => updateStatus(params.row.request_id, 'REJECTED')}>
                  <CancelIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                </IconButton>
              </Tooltip>
            </>
          )}
          {params.row.status === 'APPROVED' && (
             <Button variant="text" size="small" value="Receive Items" onClick={() => updateStatus(params.row.request_id, 'COMPLETED')} />
          )}
        </Box>
      ),
    },
  ], []);

  return (
    <div className="product-page">
      <section className="product-page__hero">
        <div>
          <p className="product-page__eyebrow">Procurement</p>
          <h4 className="product-page__title">Purchase Requests</h4>
          <p className="product-page__subtitle">
            Manage supplier requests and receive inbound inventory.
          </p>
        </div>

        <div className="product-page__stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
            <h6 className="product-panel__title">Supplier Orders</h6>
            <p className="product-panel__subtitle">
              Draft, approve, and track inbound stock from suppliers.
            </p>
          </div>

          <div className="product-toolbar__controls">
            <Button value="New Request" onClick={() => setModalOpen(true)} />
            <div className="product-toolbar__search">
              <Input
                leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="product-panel__header">
          <div className="product-panel__meta">
            <p className="product-panel__eyebrow">Records found</p>
            <div className="product-panel__badge">{filteredRequests.length} matches</div>
          </div>
        </div>

        <div className="product-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : (
            <div className="product-desktop-table">
              <DataTable 
                rows={filteredRequests.map(r => ({ id: r.request_id, ...r }))} 
                columns={columns} 
              />
            </div>
          )}
        </div>
      </section>

      <PurchaseRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default PurchaseRequestPage;
