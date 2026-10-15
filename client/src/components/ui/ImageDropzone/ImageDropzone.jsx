import React, { useRef, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import './ImageDropzone.css';

const ImageDropzone = ({
  imagePreview,
  onFileSelect,
  onRemove,
  size = 'default', // 'default' | 'compact'
  emptyIcon,
  emptyTitle = 'Click to browse or drop photo',
  emptySubtitle = 'PNG, JPG, or WebP',
  accept = 'image/jpeg,image/png,image/webp',
  className = '',
  disabled = false,
}) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset file input value so selecting the same file triggers change
    e.target.value = '';
  };

  return (
    <div
      className={`image-dropzone ${size === 'compact' ? 'image-dropzone--compact' : ''} ${isDragOver ? 'image-dropzone--drag-over' : ''
        } ${className}`.trim()}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {imagePreview ? (
        <div className="image-dropzone__preview">
          <img src={imagePreview} alt="Preview" className="image-dropzone__img" />
          {!disabled && (
            <div className="image-dropzone__overlay">
              <button
                type="button"
                className="image-dropzone__action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                title="Change Photo"
              >
                <RefreshIcon sx={{ fontSize: 14 }} />
                <span>Change</span>
              </button>
              {onRemove && (
                <button
                  type="button"
                  className="image-dropzone__action-btn image-dropzone__action-btn--delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(e);
                  }}
                  title="Remove Photo"
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="image-dropzone__empty">
          {emptyIcon || <CloudUploadIcon className="image-dropzone__icon" />}
          {emptyTitle && <p className="image-dropzone__title">{emptyTitle}</p>}
          {emptySubtitle && <p className="image-dropzone__subtitle">{emptySubtitle}</p>}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        hidden
      />
    </div>
  );
};

export default ImageDropzone;
