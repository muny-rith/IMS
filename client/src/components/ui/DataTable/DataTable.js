import React, { useMemo } from 'react';
import {
  DataGrid,
  GridFooterContainer,
  GridPagination,
  GridSelectedRowCount,
  useGridApiContext,
  useGridSelector,
  gridFilteredTopLevelRowCountSelector,
  gridPaginationModelSelector,
  gridRowSelectionCountSelector,
} from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import Skeleton from '../Skeleton/Skeleton';
import './DataTable.css';

const CustomTableFooter = () => {
  const apiRef = useGridApiContext();
  const selectedRowCount = useGridSelector(apiRef, gridRowSelectionCountSelector);
  const totalCount = useGridSelector(apiRef, gridFilteredTopLevelRowCountSelector);
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);

  const page = paginationModel?.page ?? 0;
  const pageSize = paginationModel?.pageSize ?? 25;
  const from = totalCount === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalCount);

  return (
    <GridFooterContainer className="data-table-footer">
      <Box className="data-table-footer__left">
        {selectedRowCount > 0 ? (
          <GridSelectedRowCount selectedRowCount={selectedRowCount} />
        ) : (
          <Typography component="span" className="data-table-footer__summary">
            Showing <strong>{from}–{to}</strong> of <strong>{totalCount}</strong> items
          </Typography>
        )}
      </Box>
      <GridPagination />
    </GridFooterContainer>
  );
};

export const DataTableSkeleton = ({
  columns,
  rowsCount = 8,
  checkboxSelection = true,
  className = '',
}) => {
  const defaultCols = [
    { field: 'photo', headerName: 'Photo', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1.4 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'brand', headerName: 'Brand', flex: 1 },
    { field: 'department', headerName: 'Department', flex: 1 },
    { field: 'price', headerName: 'Price', flex: 0.9 },
    { field: 'qty', headerName: 'Qty', flex: 0.7 },
    { field: 'actions', headerName: 'Actions', flex: 0.9 },
  ];

  const cols = columns && columns.length > 0 ? columns : defaultCols;

  return (
    <div
      className={`data-table-skeleton ${className}`.trim()}
      role="status"
      aria-label="Loading table data"
    >
      {/* Header */}
      <div className="data-table-skeleton__header">
        {checkboxSelection && (
          <div className="data-table-skeleton__cell--checkbox">
            <Skeleton variant="rounded" width={18} height={18} />
          </div>
        )}
        {cols.map((col, i) => (
          <div
            key={col.field || i}
            className="data-table-skeleton__header-cell"
            style={{
              flex: col.flex || (col.width ? undefined : 1),
              width: col.width,
              minWidth: col.minWidth || 60,
            }}
          >
            {col.headerName ? (
              col.headerName
            ) : (
              <Skeleton variant="text" width="60%" height={16} />
            )}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="data-table-skeleton__body">
        {Array.from({ length: rowsCount }).map((_, rIdx) => (
          <div key={rIdx} className="data-table-skeleton__row">
            {checkboxSelection && (
              <div className="data-table-skeleton__cell--checkbox">
                <Skeleton variant="rounded" width={18} height={18} />
              </div>
            )}
            {cols.map((col, cIdx) => {
              const fieldName = String(col.field || '').toLowerCase();
              const isAvatar =
                fieldName.includes('avatar') ||
                fieldName.includes('photo') ||
                fieldName.includes('image');
              const isBadge =
                fieldName.includes('status') ||
                fieldName.includes('qty') ||
                fieldName.includes('role');
              const isAction = fieldName.includes('action');

              return (
                <div
                  key={col.field || cIdx}
                  className="data-table-skeleton__cell"
                  style={{
                    flex: col.flex || (col.width ? undefined : 1),
                    width: col.width,
                    minWidth: col.minWidth || 60,
                  }}
                >
                  {isAvatar ? (
                    <Skeleton variant="circular" width={34} height={34} />
                  ) : isBadge ? (
                    <Skeleton
                      variant="rounded"
                      width={64}
                      height={24}
                      style={{ borderRadius: '999px' }}
                    />
                  ) : isAction ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Skeleton variant="circular" width={26} height={26} />
                      <Skeleton variant="circular" width={26} height={26} />
                    </div>
                  ) : (
                    <Skeleton
                      variant="text"
                      width={`${50 + ((rIdx + cIdx) % 4) * 15}%`}
                      height={20}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="data-table-skeleton__footer">
        <Skeleton variant="text" width={180} height={18} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Skeleton
            variant="rounded"
            width={75}
            height={26}
            style={{ borderRadius: '6px' }}
          />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </div>
      </div>
    </div>
  );
};

const DataTable = ({
  rows,
  columns,
  loading = false,
  rowsCount = 8,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  rowHeight = 70,
  columnHeaderHeight = 46,
  autoHeight = true,
  initialState,
  rowSelectionModel,
  onRowSelectionModelChange,
  paginationModel,
  onPaginationModelChange,
  slots,
  ...rest
}) => {
  // MUI DataGrid v9 expects { type: 'include', ids: Set } when controlled
  const normalizedSelectionModel = useMemo(() => {
    if (rowSelectionModel === undefined) return undefined;
    if (Array.isArray(rowSelectionModel)) {
      return {
        type: 'include',
        ids: new Set(rowSelectionModel),
      };
    }
    if (rowSelectionModel instanceof Set) {
      return {
        type: 'include',
        ids: rowSelectionModel,
      };
    }
    return rowSelectionModel;
  }, [rowSelectionModel]);

  if (loading) {
    return (
      <DataTableSkeleton
        columns={columns}
        rowsCount={rowsCount}
        checkboxSelection={rest.checkboxSelection !== false}
        className={rest.className}
      />
    );
  }


  const handleSelectionChange = (newModel, details) => {
    if (!onRowSelectionModelChange) return;

    if (newModel && newModel.ids instanceof Set) {
      if (newModel.type === 'include') {
        onRowSelectionModelChange(Array.from(newModel.ids), newModel);
      } else {
        const excluded = newModel.ids;
        const selected = (rows || []).map((r) => r.id).filter((id) => !excluded.has(id));
        onRowSelectionModelChange(selected, newModel);
      }
    } else if (Array.isArray(newModel)) {
      onRowSelectionModelChange(newModel, details);
    } else {
      onRowSelectionModelChange([], newModel);
    }
  };

  return (
    <Box sx={{ width: '100%', ...(autoHeight ? {} : { height: '100%' }) }}>
      <DataGrid
        autoHeight={autoHeight}
        rows={rows}
        columns={columns}
        rowHeight={rowHeight}
        columnHeaderHeight={columnHeaderHeight}
        {...(paginationModel ? { paginationModel } : {})}
        {...(onPaginationModelChange ? { onPaginationModelChange } : {})}
        initialState={{
          ...(!paginationModel ? {
            pagination: {
              paginationModel: { pageSize, page: 0 },
            },
          } : {}),
          ...initialState,
        }}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection
        sx={{
          border: 'none',
          '& .MuiDataGrid-virtualScroller': {
            overflowY: autoHeight ? 'hidden !important' : 'auto',
          },
          '& .MuiDataGrid-row': {
            cursor: 'default',
          },
          '& .MuiDataGrid-cell': {
            cursor: 'default',
            userSelect: 'none',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none !important',
          },
        }}
        {...(normalizedSelectionModel !== undefined ? { rowSelectionModel: normalizedSelectionModel } : {})}
        {...(onRowSelectionModelChange ? { onRowSelectionModelChange: handleSelectionChange } : {})}
        slots={{
          footer: CustomTableFooter,
          ...slots,
        }}
        {...rest}
      />
    </Box>
  );
};

DataTable.Skeleton = DataTableSkeleton;

export default DataTable;