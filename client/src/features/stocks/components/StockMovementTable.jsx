import React, { useMemo } from 'react';
import { Chip } from '@mui/material';
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

const StockMovementTable = ({ rows }) => {
  const columns = useMemo(
    () => [
      { field: 'productCode', headerName: 'Code', flex: 1 },
      { field: 'productName', headerName: 'Product', flex: 1.4 },
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
      { field: 'qty', headerName: 'Qty', flex: 0.7, type: 'number' },
      {
        field: 'notes',
        headerName: 'Notes',
        flex: 1.8,
        renderCell: (params) => params.row.notes || '—',
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        flex: 1.1,
        renderCell: (params) => formatDateTime(params.row.createdAt),
      },
    ],
    []
  );

  return <DataTable rows={rows} columns={columns} />;
};

export default StockMovementTable;
