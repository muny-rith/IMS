import React, { useMemo } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import HistoryIcon from '@mui/icons-material/History';
import DataTable from '../../../components/ui/DataTable/DataTable';
import '../pages/stockAdjustment.css';

const LOW_STOCK_THRESHOLD = 5;

const formatDateTime = (value) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getStatusMeta = (row) => {
  const onHandQty = Number(row.onHandQty ?? 0);

  if (onHandQty <= 0) {
    return { label: 'Out', color: 'error' };
  }

  if (onHandQty <= LOW_STOCK_THRESHOLD) {
    return { label: 'Low', color: 'warning' };
  }

  return { label: 'Healthy', color: 'success' };
};

const StockBalanceTable = ({ rows, onAdjust, onViewHistory }) => {
  const columns = useMemo(
    () => [
      { field: 'productCode', headerName: 'Code', flex: 0.9 },
      { field: 'productName', headerName: 'Product', flex: 1.4 },
      { field: 'category', headerName: 'Category', flex: 1 },
      { field: 'onHandQty', headerName: 'On Hand', flex: 0.8, type: 'number' },
      { field: 'reservedQty', headerName: 'Reserved', flex: 0.8, type: 'number' },
      { field: 'availableQty', headerName: 'Available', flex: 0.85, type: 'number' },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.8,
        sortable: false,
        renderCell: (params) => {
          const status = getStatusMeta(params.row);

          return (
            <Chip
              size="small"
              label={status.label}
              color={status.color}
              variant="outlined"
            />
          );
        },
      },
      {
        field: 'updatedAt',
        headerName: 'Updated At',
        flex: 1.1,
        renderCell: (params) => formatDateTime(params.row.updatedAt),
      },
      {
        field: 'action',
        headerName: 'Action',
        flex: 0.9,
        sortable: false,
        renderCell: (params) => (
          <Box display="flex" gap={1} alignItems="center" height="100%">
            <Tooltip title="Adjust stock">
              <button
                type="button"
                className="stock-action-button stock-action-button--adjust"
                onClick={() => onAdjust(params.row)}
              >
                <TuneIcon fontSize="small" />
              </button>
            </Tooltip>

            <Tooltip title="View history">
              <button
                type="button"
                className="stock-action-button stock-action-button--history"
                onClick={() => onViewHistory(params.row)}
              >
                <HistoryIcon fontSize="small" />
              </button>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [onAdjust, onViewHistory]
  );

  return <DataTable rows={rows} columns={columns} />;
};

export default StockBalanceTable;
