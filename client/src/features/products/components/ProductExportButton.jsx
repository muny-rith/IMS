import React from 'react';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import './ProductExportButton.css';

const ProductExportButton = ({
  onClick,
  disabled = false,
  label = 'Export',
  title = 'Export product list to Excel',
}) => {
  return (
    <button
      type="button"
      className="product-export-btn"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
      <span>{label}</span>
    </button>
  );
};

export default ProductExportButton;
