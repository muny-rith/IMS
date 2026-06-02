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

const toMonthValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getPreviousMonthValue = () => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);
  return toMonthValue(date);
};

const formatReportMonthLabel = (monthValue) => {
  const [year, month] = String(monthValue).split("-").map(Number);

  if (!year || !month) {
    return "Selected month";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};

const buildReportMonthOptions = (count = 13) => {
  const start = new Date();
  start.setDate(1);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() - index, 1);
    const value = toMonthValue(date);

    return {
      value,
      label: formatReportMonthLabel(value),
    };
  });
};

function ReportPage() {
  const [activeReport, setActiveReport] = useState("stock");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [reportMonth, setReportMonth] = useState(getPreviousMonthValue);
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
  const reportMonthOptions = useMemo(() => buildReportMonthOptions(), []);
  const isMonthlyUsageReport = activeReport === "usage";
  const reportMonthLabel = useMemo(
    () => formatReportMonthLabel(reportMonth),
    [reportMonth]
  );
  const displayedReport = useMemo(
    () =>
      isMonthlyUsageReport
        ? {
            ...selectedReport,
            metric: reportMonthLabel,
            scopeLabel: reportMonthLabel,
          }
        : selectedReport,
    [isMonthlyUsageReport, reportMonthLabel, selectedReport]
  );

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
    reportMonth,
  });

  const visibleSummaryMetrics =
    realSummaryMetrics.length > 0 ? realSummaryMetrics : summaryMetrics;
  const usesDateRange =
    !isMonthlyUsageReport && selectedReport.usesDateRange !== false;
  const reportScopeLabel =
    displayedReport.scopeLabel || (usesDateRange ? dateRange : "Live report");
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
          ? reportMonthLabel
          : dateRange;

    if (!rows.length) {
      window.alert("No report rows to export.");
      return;
    }

    if (exportFormat === "PDF") {
      const didOpen = printPdfReport({
          rows,
          reportTitle: displayedReport.title,
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
        reportTitle: displayedReport.title,
        dateRange: exportDateRange,
      });

      return;
    }

    downloadCsvReport({
      rows,
      reportTitle: displayedReport.title,
      dateRange: exportDateRange,
    });
  };

  return (
    <div className="report-page">
      <ReportHero
        selectedReport={displayedReport}
        dateRange={isMonthlyUsageReport ? reportMonthLabel : dateRange}
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
              {isMonthlyUsageReport ? (
                <label className="report-control">
                  <span>Report month</span>
                  <select
                    value={reportMonth}
                    onChange={(event) => setReportMonth(event.target.value)}
                  >
                    {reportMonthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* <small className="report-control-hint">
                    Choose the closed month to print, for example May on June 5.
                  </small> */}
                </label>
              ) : (
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
                  {/* <small className="report-control-hint">
                    {displayedReport.dateHint ||
                      (usesDateRange
                        ? "Filter report rows by selected period."
                        : reportScopeLabel)}
                  </small> */}
                </label>
              )}

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
                {/* <small className="report-control-hint">
                  PDF for print, Excel/CSV for data.
                </small> */}
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
          title={displayedReport.title}
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
