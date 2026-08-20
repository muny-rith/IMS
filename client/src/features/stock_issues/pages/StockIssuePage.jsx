import React, { useMemo, useState } from 'react';
import '../../products/pages/product.css';
import { Box, CircularProgress, Tooltip, IconButton, Snackbar, Alert, Chip } from '@mui/material';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import { useStockIssues } from '../hooks/useStockIssues';
import StockIssueModal from '../components/StockIssueModal';

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

const StockIssuePage = () => {
  const { stockIssues, loading, handleCreate } = useStockIssues();
  
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const filteredIssues = useMemo(() => {
    if (!search.trim()) return stockIssues;
    return stockIssues.filter(s => 
      s.issue_code.toLowerCase().includes(search.toLowerCase()) || 
      (s.notes || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [stockIssues, search]);

  const stats = useMemo(() => {
    const totalIssues = stockIssues.length;
    const totalItems = stockIssues.reduce((total, issue) => {
      const issueTotal = (issue.items || []).reduce((sum, item) => sum + item.qty, 0);
      return total + issueTotal;
    }, 0);

    return [
      {
        label: 'Total Items Dispatched',
        value: totalItems,
        helper: 'Individual product units',
        icon: <WarningAmberOutlinedIcon fontSize="small" />,
        tone: 'warning',
      },
      {
        label: 'Issue Events',
        value: totalIssues,
        helper: 'Total recorded incidents',
        icon: <AssignmentReturnOutlinedIcon fontSize="small" />,
        tone: 'default',
      }
    ];
  }, [stockIssues]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const result = await handleCreate(data);
    setSubmitting(false);
    
    if (result.success) {
      setModalOpen(false);
      showToast('Stock issued successfully.');
    } else {
      showToast(result.message || 'Error processing issue', 'error');
    }
  };

  const columns = useMemo(() => [
    { field: 'issue_code', headerName: 'Issue Code', flex: 1 },
    { field: 'issue_type', headerName: 'Type', flex: 1, renderCell: (p) => (
      <Chip label={p.value} color="warning" size="small" variant="outlined" />
    )},
    { field: 'notes', headerName: 'Notes', flex: 1.5, renderCell: (p) => p.value || '—' },
    { field: 'created_at', headerName: 'Date', flex: 1, renderCell: (p) => new Date(p.value).toLocaleDateString() },
    { field: 'items_count', headerName: 'Total Items', flex: 0.8, align: 'center', headerAlign: 'center', renderCell: (p) => {
      const count = (p.row.items || []).reduce((sum, item) => sum + item.qty, 0);
      return count;
    }},
  ], []);

  return (
    <div className="product-page">
      <section className="product-page__hero">
        <div>
          <p className="product-page__eyebrow">Inventory</p>
          <h4 className="product-page__title">Stock Issues</h4>
          <p className="product-page__subtitle">
            Dispatch stock for internal use, damage, loss, or giveaways outside of sales and loans.
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
            <h6 className="product-panel__title">Issue Records</h6>
            <p className="product-panel__subtitle">
              View and search past stock dispatch events.
            </p>
          </div>

          <div className="product-toolbar__controls">
            <Button value="New Issue" onClick={() => setModalOpen(true)} />
            <div className="product-toolbar__search">
              <Input
                leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="product-panel__header">
          <div className="product-panel__meta">
            <p className="product-panel__eyebrow">Records found</p>
            <div className="product-panel__badge">{filteredIssues.length} matches</div>
          </div>
        </div>

        <div className="product-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : (
            <div className="product-desktop-table">
              <DataTable 
                rows={filteredIssues.map(s => ({ id: s.issue_id, ...s }))} 
                columns={columns} 
              />
            </div>
          )}
        </div>
      </section>

      <StockIssueModal
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

export default StockIssuePage;
