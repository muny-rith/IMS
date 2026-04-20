import React from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import DataTable from '../../../components/ui/DataTable/DataTable';

const getMovementColor = (type) => {
  switch (type) {
    case 'ADJUSTMENT_IN':
      return 'success';
    case 'ADJUSTMENT_OUT':
      return 'error';
    case 'LOAN_OUT':
      return 'warning';
    case 'LOAN_RETURN':
      return 'info';
    case 'OPENING':
      return 'primary';
    default:
      return 'default';
  }
};

const formatDateTime = (value) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const columns = [
  {
    field: 'createdAt',
    headerName: 'Created At',
    flex: 1.2,
    renderCell: (params) => formatDateTime(params.row.createdAt),
  },
  {
    field: 'movementType',
    headerName: 'Movement Type',
    flex: 1,
    renderCell: (params) => (
      <Chip
        size="small"
        label={params.row.movementType}
        color={getMovementColor(params.row.movementType)}
        variant="outlined"
      />
    ),
  },
  {
    field: 'qty',
    headerName: 'Qty',
    flex: 0.7,
    type: 'number',
  },
  {
    field: 'notes',
    headerName: 'Notes',
    flex: 1.8,
    renderCell: (params) => params.row.notes || '—',
  },
];

const StockHistoryDrawer = ({
  open,
  onClose,
  product,
  movements = [],
  loading = false,
  error = null,
}) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '100vw', sm: 640 },
          maxWidth: '100vw',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <h3 style={{ margin: 0 }}>Product History</h3>
            <p style={{ margin: '6px 0 0', color: '#667085' }}>
              {product?.productCode} - {product?.productName}
            </p>
          </Box>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {product && (
          <Box className="stock-history-summary">
            <div>
              <strong>Category</strong>
              <span>{product.category ?? '—'}</span>
            </div>
            <div>
              <strong>On Hand</strong>
              <span>{product.onHandQty ?? 0}</span>
            </div>
            <div>
              <strong>Reserved</strong>
              <span>{product.reservedQty ?? 0}</span>
            </div>
            <div>
              <strong>Available</strong>
              <span>{product.availableQty ?? 0}</span>
            </div>
            <div>
              <strong>Updated At</strong>
              <span>{formatDateTime(product.updatedAt)}</span>
            </div>
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : movements.length === 0 ? (
          <Box className="stock-history-empty">
            <strong>No stock movements found</strong>
            <p>
              Adjustments, loan actions, and returns for this product will appear
              here.
            </p>
          </Box>
        ) : (
          <DataTable rows={movements} columns={columns} />
        )}
      </Box>
    </Drawer>
  );
};

export default StockHistoryDrawer;
