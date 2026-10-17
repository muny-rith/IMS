import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Close as CloseIcon,
  Tune as SlidersIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  DescriptionOutlined as CsvIcon,
  TableChartOutlined as ExcelIcon,
  PictureAsPdfOutlined as PdfIcon,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PrintModal.css';

/**
 * Reusable PrintModal Component
 *
 * Modeled after MoonPulse's ExportModal:
 * - Header with Title and Close button
 * - Optional Column Customizer Bar (Checkboxes)
 * - Centered A4 Preview Stage with paper shadow and navy headers
 * - Bottom Footer with format description, segmented format selector (CSV, Excel, PDF, Print),
 *   Cancel and Download/Print actions.
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Handler to close modal
 * @param {string} [title='Export & Print Report'] - Modal title
 * @param {string} [fileName='Report'] - Base name for downloaded files
 * @param {Array<Object>} [optionalColumns] - Config of optional toggleable columns: [{ id: 'brand', label: 'Brand', icon: ... }]
 * @param {Array<string>} [selectedColumns] - Currently checked column ids
 * @param {Function} [onToggleColumn] - Callback when toggling a column
 * @param {Function} [onExportCsv] - Callback when CSV format is selected & downloaded
 * @param {Function} [onExportExcel] - Callback when Excel format is selected & downloaded
 * @param {Array<any>} [pages] - Optional array of paginated page items
 * @param {Function} [renderPage] - Render function: (pageData, pageNum, totalPages) => ReactNode
 * @param {React.ReactNode} [children] - Content rendered inside preview page if pages array not used
 */
const ScaledPreviewPage = ({ children, scale, baseWidth = 840 }) => {
  const pageRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(0);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const updateHeight = () => {
      if (el) setPageHeight(el.offsetHeight);
    };

    updateHeight();

    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(updateHeight);
      ro.observe(el);
    }

    const imgs = el.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', updateHeight, { once: true });
      }
    });

    return () => {
      if (ro) ro.disconnect();
    };
  }, [children, scale]);

  if (scale >= 0.99) {
    return children;
  }

  const estimatedHeight = pageHeight > 0 ? pageHeight : Math.round(baseWidth * 1.414);
  const scaledHeight = Math.round(estimatedHeight * scale);
  const scaledWidth = Math.round(baseWidth * scale);

  return (
    <div
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        alignSelf: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        ref={pageRef}
        style={{
          width: `${baseWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const PrintModal = ({
  isOpen,
  onClose,
  title = 'Export & Print Report',
  fileName = 'Report',
  optionalColumns = [],
  selectedColumns = [],
  onToggleColumn = null,
  onExportCsv = null,
  onExportExcel = null,
  pages = null,
  renderPage = null,
  children = null,
}) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const offscreenContainerRef = useRef(null);
  const previewWrapperRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  // Auto-calculate scale on window resize or container resize
  useEffect(() => {
    if (!isOpen) return;

    const el = previewWrapperRef.current;
    if (!el) return;

    const updateScale = () => {
      const availableWidth = el.clientWidth - 16;
      const baseWidth = 840;
      if (availableWidth > 0 && availableWidth < baseWidth) {
        const s = Number((availableWidth / baseWidth).toFixed(3));
        setPreviewScale(Math.max(0.25, Math.min(1, s)));
      } else {
        setPreviewScale(1);
      }
    };

    updateScale();
    const animId = requestAnimationFrame(updateScale);

    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(updateScale);
      ro.observe(el);
    }

    const handleResize = () => updateScale();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isGeneratingPdf) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isGeneratingPdf]);

  const formatOptions = useMemo(
    () => [
      ...(onExportCsv
        ? [{ value: 'csv', label: 'CSV', icon: CsvIcon, desc: 'Plain spreadsheet data, opens anywhere' }]
        : []),
      ...(onExportExcel
        ? [{ value: 'excel', label: 'Excel', icon: ExcelIcon, desc: 'Formatted .xlsx workbook with clickable links' }]
        : []),
      { value: 'pdf', label: 'PDF', icon: PdfIcon, desc: 'Printable executive report with styled layout' },
    ],
    [onExportCsv, onExportExcel]
  );

  // Make sure selectedFormat is valid
  useEffect(() => {
    if (!formatOptions.some((opt) => opt.value === selectedFormat)) {
      setSelectedFormat('pdf');
    }
  }, [selectedFormat, formatOptions]);

  // High-Resolution Multi-page PDF Download
  const handleDownloadPdf = async () => {
    if (!offscreenContainerRef.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      const pageElements = offscreenContainerRef.current.querySelectorAll('.print-preview-page');

      if (pageElements.length === 0) {
        console.warn('[PrintModal] No .print-preview-page elements found to generate PDF.');
        return;
      }

      await document.fonts.ready;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 840,
          imageTimeout: 15000,
        });

        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
        }

        // Exact aspect ratio calculation: NEVER stretch or squash height
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pageHeight, pdfHeight), undefined, 'FAST');
      }

      const cleanFileName = fileName.replace(/[\\/:*?"<>|]/g, '').trim() || 'Report';
      pdf.save(`${cleanFileName}.pdf`);
    } catch (err) {
      console.error('[PrintModal] PDF generation error:', err);
      alert('Failed to generate PDF. You can use the Print option instead.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleAction = async () => {
    if (selectedFormat === 'csv' && onExportCsv) {
      onExportCsv(selectedColumns);
      onClose();
    } else if (selectedFormat === 'excel' && onExportExcel) {
      onExportExcel(selectedColumns);
      onClose();
    } else if (selectedFormat === 'pdf') {
      await handleDownloadPdf();
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalPagesCount = Array.isArray(pages) && pages.length > 0 ? pages.length : 1;
  const currentFormatDesc = formatOptions.find((o) => o.value === selectedFormat)?.desc;

  // Render individual page content
  const renderSinglePage = (pageData, pageNumber) => (
    <div key={pageNumber} className="print-preview-page">
      {typeof renderPage === 'function' ? renderPage(pageData, pageNumber, totalPagesCount) : children}
    </div>
  );

  return (
    <div className="print-modal-overlay" onClick={onClose}>
      <div className="print-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button (Top-Right) */}
        <button
          type="button"
          onClick={onClose}
          className="print-modal-close"
          disabled={isGeneratingPdf}
          aria-label="Close modal"
        >
          <CloseIcon fontSize="small" />
        </button>

        <div className="print-modal-content">
          {/* Header Title */}
          <div className="print-modal-header-row">
            <h2 className="print-modal-title">{title}</h2>
          </div>

          {/* Optional Columns Customizer Bar */}
          {optionalColumns.length > 0 && (
            <div className="print-columns-customizer">
              <div className="print-customizer-header">
                <SlidersIcon sx={{ fontSize: 16, color: '#0284c7' }} />
                <span className="print-customizer-title">Customize Report Columns</span>
              </div>

              <div className="print-columns-grid">
                {optionalColumns.map((col) => {
                  const isChecked = selectedColumns.includes(col.id);
                  const IconComponent = col.icon;
                  return (
                    <label
                      key={col.id}
                      className="print-col-checkbox-label"
                      title={col.desc || `Toggle ${col.label}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleColumn && onToggleColumn(col.id)}
                      />
                      <div className="print-col-checkbox-indicator">
                        {isChecked ? (
                          <CheckBoxIcon sx={{ fontSize: 17, color: '#0284c7' }} />
                        ) : (
                          <CheckBoxOutlineBlankIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                        )}
                      </div>
                      {IconComponent && <IconComponent sx={{ fontSize: 15, color: isChecked ? '#0284c7' : '#64748b' }} />}
                      <span className={`print-col-name ${isChecked ? 'selected' : ''}`}>
                        {col.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Report Preview Wrapper (Soft grey-blue background) */}
          <div className="print-preview-wrapper" ref={previewWrapperRef}>
            {Array.isArray(pages) && pages.length > 0
              ? pages.map((pageData, idx) => {
                const scaledWidth = previewScale < 0.99 ? `${Math.round(840 * previewScale)}px` : '100%';
                return (
                  <div
                    key={idx}
                    style={{
                      width: scaledWidth,
                      maxWidth: '840px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginBottom: '20px',
                      alignSelf: 'center',
                    }}
                  >
                    <ScaledPreviewPage scale={previewScale} baseWidth={840}>
                      {renderSinglePage(pageData, idx + 1)}
                    </ScaledPreviewPage>
                  </div>
                );
              })
              : (
                <div
                  style={{
                    width: previewScale < 0.99 ? `${Math.round(840 * previewScale)}px` : '100%',
                    maxWidth: '840px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '20px',
                    alignSelf: 'center',
                  }}
                >
                  <ScaledPreviewPage scale={previewScale} baseWidth={840}>
                    {renderSinglePage(null, 1)}
                  </ScaledPreviewPage>
                </div>
              )}
          </div>

          {/* Bottom Bar: Format Selection & Actions */}
          <div className="print-modal-footer">
            <div className="print-format-desc">{currentFormatDesc}</div>

            <div className="print-controls">
              <div className="print-format-selector">
                {formatOptions.map((opt) => {
                  const selected = selectedFormat === opt.value;
                  const Icon = opt.icon;
                  return (
                    <label key={opt.value} className="print-format-option">
                      <input
                        type="radio"
                        name="print-format"
                        value={opt.value}
                        checked={selected}
                        onChange={() => setSelectedFormat(opt.value)}
                        disabled={isGeneratingPdf}
                      />
                      <div className={`print-format-label ${selected ? 'selected' : ''}`}>
                        <Icon sx={{ fontSize: 15 }} />
                        {opt.label}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="print-controls-divider" />

              <div className="print-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="print-btn-cancel"
                  disabled={isGeneratingPdf}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAction}
                  className="print-btn-download"
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf && <CircularProgress size={14} color="inherit" />}
                  {isGeneratingPdf ? 'Generating...' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden off-screen container for exact A4 physical millimeter PDF generation */}
      <div ref={offscreenContainerRef} className="print-offscreen-container">
        {Array.isArray(pages) && pages.length > 0
          ? pages.map((pageData, idx) => renderSinglePage(pageData, idx + 1))
          : renderSinglePage(null, 1)}
      </div>
    </div>
  );
};

export default PrintModal;
