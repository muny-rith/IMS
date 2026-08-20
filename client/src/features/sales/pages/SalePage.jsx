import React, { useMemo, useState } from 'react';
import '../../products/pages/product.css';
import { Box, CircularProgress, IconButton, Tooltip, Snackbar, Alert, Chip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import { useSales } from '../hooks/useSales';
import SaleModal from '../components/SaleModal';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

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

const SalePage = () => {
  const { sales, loading, handleCreate } = useSales();
  
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const filteredSales = useMemo(() => {
    if (!search.trim()) return sales;
    return sales.filter(s => 
      s.sale_code.toLowerCase().includes(search.toLowerCase()) || 
      (s.customer_name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [sales, search]);

  const stats = useMemo(() => {
    const totalTransactions = sales.length;
    const totalRevenue = sales.reduce((total, sale) => {
      const saleTotal = (sale.items || []).reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
      return total + saleTotal;
    }, 0);

    return [
      {
        label: 'Total Revenue',
        value: currencyFormatter.format(totalRevenue),
        helper: 'Gross sales all-time',
        icon: <RequestQuoteOutlinedIcon fontSize="small" />,
        tone: 'success',
      },
      {
        label: 'Transactions',
        value: totalTransactions,
        helper: 'Completed sales',
        icon: <PointOfSaleOutlinedIcon fontSize="small" />,
        tone: 'default',
      }
    ];
  }, [sales]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    const result = await handleCreate(data);
    setSubmitting(false);
    
    if (result.success) {
      setModalOpen(false);
      showToast('Sale transaction completed successfully.');
    } else {
      showToast(result.message || 'Error processing sale', 'error');
    }
  };

  const columns = useMemo(() => [
    { field: 'sale_code', headerName: 'Sale Code', flex: 1 },
    { field: 'customer_name', headerName: 'Customer', flex: 1.5, renderCell: (p) => p.value || '—' },
    { field: 'sale_status', headerName: 'Status', flex: 0.8, renderCell: (p) => (
      <Chip label={p.value} color={p.value === 'COMPLETED' ? 'success' : 'default'} size="small" />
    )},
    { field: 'created_at', headerName: 'Date', flex: 1, renderCell: (p) => new Date(p.value).toLocaleDateString() },
    { field: 'total', headerName: 'Total', flex: 1, align: 'right', headerAlign: 'right', renderCell: (p) => {
      const total = (p.row.items || []).reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
      return currencyFormatter.format(total);
    }},
  ], []);

  return (
    <div className="product-page">
      <section className="product-page__hero">
        <div>
          <p className="product-page__eyebrow">Outbound</p>
          <h4 className="product-page__title">Sales Log</h4>
          <p className="product-page__subtitle">
            Process outbound sales transactions and track revenue.
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
            <h6 className="product-panel__title">Transaction History</h6>
            <p className="product-panel__subtitle">
              View and search past sales records.
            </p>
          </div>

          <div className="product-toolbar__controls">
            <Button value="New Sale" onClick={() => setModalOpen(true)} />
            <div className="product-toolbar__search">
              <Input
                leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                placeholder="Search sales..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="product-panel__header">
          <div className="product-panel__meta">
            <p className="product-panel__eyebrow">Records found</p>
            <div className="product-panel__badge">{filteredSales.length} matches</div>
          </div>
        </div>

        <div className="product-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
          ) : (
            <div className="product-desktop-table">
              <DataTable 
                rows={filteredSales.map(s => ({ id: s.sale_id, ...s }))} 
                columns={columns} 
              />
            </div>
          )}
        </div>
      </section>

      <SaleModal
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

export default SalePage;
