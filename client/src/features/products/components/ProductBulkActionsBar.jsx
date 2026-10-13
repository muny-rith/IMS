import React from 'react';
import { CircularProgress, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import './ProductBulkActionsBar.css';

const ProductBulkActionsBar = ({
  selectedCount = 0,
  onClearSelection,
  onExport,
  onBulkDelete,
  isAdmin = false,
  submitting = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="product-bulk-bar" role="region" aria-label="Bulk actions toolbar">
      {/* 1. Selection count & clear button */}
      <div className="product-bulk-bar__counter">
        <span className="product-bulk-bar__badge">{selectedCount}</span>
        <span className="product-bulk-bar__label">
          {selectedCount === 1 ? 'product selected' : 'products selected'}
        </span>
        <Tooltip title="Clear selection">
          <button
            type="button"
            className="product-bulk-bar__btn-clear"
            onClick={onClearSelection}
            disabled={submitting}
            aria-label="Clear selection"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </Tooltip>
      </div>

      <div className="product-bulk-bar__divider" />

      {/* 2. Bulk Action Buttons */}
      <div className="product-bulk-bar__actions">
        <Tooltip title={`Export ${selectedCount} selected products to Excel`}>
          <button
            type="button"
            className="product-bulk-bar__btn product-bulk-bar__btn--export"
            onClick={onExport}
            disabled={submitting}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Export</span>
          </button>
        </Tooltip>



        {isAdmin && (
          <Tooltip title={`Delete ${selectedCount} selected products`}>
            <button
              type="button"
              className="product-bulk-bar__btn product-bulk-bar__btn--delete"
              onClick={onBulkDelete}
              disabled={submitting}
            >
              {submitting ? (
                <CircularProgress size={16} sx={{ color: 'currentColor' }} />
              ) : (
                <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
              )}
              <span>Delete</span>
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default ProductBulkActionsBar;
