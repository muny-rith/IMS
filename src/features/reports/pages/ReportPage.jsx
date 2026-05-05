import { useMemo, useState } from "react";

import ReportHero from "../components/ReportHero";
import ReportPreviewTable from "../components/ReportPreviewTable";
import ReportSummaryGrid from "../components/ReportSummaryGrid";
import ReportTypeGrid from "../components/ReportTypeGrid";
import logo from "../../../assets/images/logo.png";
import SavedReportsPanel from "../components/SavedReportsPanel";
import {
  dateRangeOptions,
  exportFormats,
  reportTypes,
  savedReports,
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

  const selectedReport = useMemo(
    () => reportTypes.find((item) => item.id === activeReport) ?? reportTypes[0],
    [activeReport]
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
  });

  const visibleSummaryMetrics =
    realSummaryMetrics.length > 0 ? realSummaryMetrics : summaryMetrics;

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
        dateRangeOptions={dateRangeOptions}
        exportFormat={exportFormat}
        exportFormats={exportFormats}
        reportCount={rows.length}
        loading={loading}
        onDateRangeChange={setDateRange}
        onExportFormatChange={setExportFormat}
        onGenerateReport={handleGenerateReport}
      />

      <ReportSummaryGrid items={visibleSummaryMetrics} loading={loading} />

      <section className="report-workspace">
        <div className="report-main-stack">
          <ReportTypeGrid
            items={reportTypes}
            activeReport={activeReport}
            onSelect={setActiveReport}
          />

          <ReportPreviewTable
            title={selectedReport.title}
            rows={rows}
            loading={loading}
            error={error}
            onRetry={refetch}
          />
        </div>

        <aside className="report-aside-stack">
          <SavedReportsPanel items={savedReports} />

          <div className="report-brand-card">
            <div className="report-brand-mark">
              <img src={logo} alt="Moon IMS logo" />
            </div>

            <strong>Moon IMS Reports</strong>

            <p>Clean data, calm decisions.</p>

            <div className="report-brand-formats">
              <span>PDF</span>
              <span>Excel</span>
              <span>CSV</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default ReportPage;
