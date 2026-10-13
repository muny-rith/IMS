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

const DataTable = ({
  rows,
  columns,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  rowHeight = 68,
  columnHeaderHeight = 52,
  autoHeight = true,
  initialState,
  rowSelectionModel,
  onRowSelectionModelChange,
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
        initialState={{
          pagination: {
            paginationModel: { pageSize, page: 0 },
          },
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


export default DataTable;