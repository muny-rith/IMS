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
      { field: 'productCode', headerName: 'Code', flex: 0.7 },
      { field: 'productName', headerName: 'Product', flex: 1.3 },
      // { field: 'category', headerName: 'Category', flex: 1 },
      { field: 'onHandQty', headerName: 'On Hand', flex: 0.8, type: 'number', align: 'left', headerAlign: 'left' },
      { field: 'reservedQty', headerName: 'Reserved', flex: 0.8, type: 'number', align: 'left', headerAlign: 'left' },
      { field: 'availableQty', headerName: 'Available', flex: 0.85, type: 'number', align: 'left', headerAlign: 'left' },
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
        // field: 'action',
        // headerName: 'Action',
        // flex: 0.9,
        // sortable: false,

        field: 'action',
        headerName: 'Action',
        // width: 120,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        // renderCell: (params) => (
        //   <Box display="flex" justifyContent="center" gap={1} alignItems="center" height="100%" flexWrap="nowrap" >
        //     <Tooltip title="Adjust stock">
        //       <TuneIcon
        //         type="button"
        //         className="stock-action-button stock-action-button--adjust"
        //         onClick={() => onAdjust(params.row)}
        //       >
        //         {/* <TuneIcon fontSize="small" /> */}
        //       </TuneIcon>
        //     </Tooltip>

        //     <Tooltip title="View history">
        //       <HistoryIcon
        //         type="button"
        //         className="stock-action-button stock-action-button--history"
        //         onClick={() => onViewHistory(params.row)}
        //       >
        //         {/* <HistoryIcon fontSize="small" /> */}
        //       </HistoryIcon>
        //     </Tooltip>
        //   </Box>
        // ),
        renderCell: (params) => (
          <Box
            sx={{

              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'left',
              alignItems: 'center',
              textAlign: 'left',
              gap: 0.5,
              flexWrap: 'nowrap',
            }}
          >
            <Tooltip title="Adjust stock">
              <TuneIcon
                className="stock-action-button stock-action-button--adjust"
                sx={{ cursor: 'pointer' }}
                onClick={() => onAdjust(params.row)}
              />
            </Tooltip>

            <Tooltip title="View history">
              <HistoryIcon
                className="stock-action-button stock-action-button--history"
                sx={{ cursor: 'pointer' }}
                onClick={() => onViewHistory(params.row)}
              />
            </Tooltip>
          </Box>
        )

      },
    ],
    [onAdjust, onViewHistory]
  );

  return (
    <div className="stock-table-shell">
      <DataTable rows={rows} columns={columns} />
    </div>
  );
};

export default StockBalanceTable;
