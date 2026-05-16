import { useMemo, useState } from "react";

import ReportHero from "../components/ReportHero";
import ReportPreviewTable from "../components/ReportPreviewTable";
import ReportTypeGrid from "../components/ReportTypeGrid";
import {
  dateRangeOptions,
  exportFormats,
  reportFilterOptions,
  reportTypes,
  summaryMetrics,
} from "../data/reportPageData";
import useReports from "../hooks/useReports";
import {
  downloadCsvReport,
  downloadExcelReport,
  printPdfReport,
} from "../utils/exportReport";
import "./reportPage.css";

function ReportPage() {
  const [activeReport, setActiveReport] = useState("stock");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [exportFormat, setExportFormat] = useState("PDF");
  const [reportFilters, setReportFilters] = useState({});

  const selectedReport = useMemo(
    () => reportTypes.find((item) => item.id === activeReport) ?? reportTypes[0],
    [activeReport]
  );
  const activeReportFilters = useMemo(
    () => reportFilters[activeReport] ?? {},
    [activeReport, reportFilters]
  );
  const activeReportFilterOptions = reportFilterOptions[activeReport] ?? [];

  const {
    rows,
    summaryMetrics: realSummaryMetrics,
    loading,
    error,
    refetch,
  } = useReports({
    reportId: activeReport,
    dateRange,
    filters: activeReportFilters,
  });

  const visibleSummaryMetrics =
    realSummaryMetrics.length > 0 ? realSummaryMetrics : summaryMetrics;
  const usesDateRange = selectedReport.usesDateRange !== false;
  const reportScopeLabel =
    selectedReport.scopeLabel || (usesDateRange ? dateRange : "Live report");
  const dateRangeValue = usesDateRange ? dateRange : reportScopeLabel;
  const dateRangeSelectOptions = usesDateRange
    ? dateRangeOptions
    : [reportScopeLabel];
  const getReportFilterValue = (filter) =>
    activeReportFilters[filter.id] ?? filter.options[0]?.value ?? "ALL";

  const handleReportFilterChange = (filterId, value) => {
    setReportFilters((current) => ({
      ...current,
      [activeReport]: {
        ...(current[activeReport] ?? {}),
        [filterId]: value,
      },
    }));
  };

  const handleGenerateReport = () => {
    if (loading) {
      return;
    }

    const exportDateRange =
      activeReport === "stock"
        ? "Current snapshot"
        : activeReport === "usage"
          ? selectedReport.scopeLabel || "This month"
          : dateRange;

    if (!rows.length) {
      window.alert("No report rows to export.");
      return;
    }

    if (exportFormat === "PDF") {
      const didOpen = printPdfReport({
        rows,
        reportTitle: selectedReport.title,
        dateRange: exportDateRange,
        summaryMetrics: visibleSummaryMetrics,
      });

      if (!didOpen) {
        window.alert("Please allow popups to generate the PDF report.");
      }

      return;
    }

    if (exportFormat === "Excel") {
      downloadExcelReport({
        rows,
        reportTitle: selectedReport.title,
        dateRange: exportDateRange,
      });

      return;
    }

    downloadCsvReport({
      rows,
      reportTitle: selectedReport.title,
      dateRange: exportDateRange,
    });
  };

  return (
    <div className="report-page">
      <ReportHero
        selectedReport={selectedReport}
        dateRange={dateRange}
        summaryMetrics={visibleSummaryMetrics}
        reportCount={rows.length}
        loading={loading}
      />

      <section className="report-main-stack">
        <div className="report-builder-row">
          <ReportTypeGrid
            items={reportTypes}
            activeReport={activeReport}
            onSelect={setActiveReport}
          />

          <div className="report-controls report-controls--workspace">
            <div className="report-controls-option">
              <label
                className={
                  usesDateRange
                    ? "report-control"
                    : "report-control report-control--disabled"
                }
              >
                <span>Date range</span>
                <select
                  value={dateRangeValue}
                  disabled={!usesDateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                >
                  {dateRangeSelectOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <small className="report-control-hint">
                  {selectedReport.dateHint ||
                    (usesDateRange
                      ? "Filter report rows by selected period."
                      : reportScopeLabel)}
                </small>
              </label>

              <label className="report-control">
                <span>Export</span>
                <select
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value)}
                >
                  {exportFormats.map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
                <small className="report-control-hint">
                  PDF for print, Excel/CSV for data.
                </small>
              </label>
            </div>

            <button
              type="button"
              className="report-primary-button"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? "Preparing..." : `Generate ${exportFormat}`}
            </button>
          </div>
        </div>

        <ReportPreviewTable
          title={selectedReport.title}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={refetch}
          filterOptions={activeReportFilterOptions}
          getFilterValue={getReportFilterValue}
          onFilterChange={handleReportFilterChange}
        />
      </section>
    </div>
  );
}

export default ReportPage;
