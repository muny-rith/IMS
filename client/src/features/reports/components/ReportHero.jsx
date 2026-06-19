import ReportSummaryGrid from "./ReportSummaryGrid";

function ReportHero({
  selectedReport,
  dateRange,
  summaryMetrics = [],
  reportCount = 0,
  loading = false,
}) {
  const usesDateRange = selectedReport.usesDateRange !== false;
  const reportScopeLabel =
    selectedReport.scopeLabel || (usesDateRange ? dateRange : "Live report");
  const reportCountLabel = loading ? "Loading" : `${reportCount} rows`;

  return (
    <section className="report-hero">
      <div>
        <p className="report-eyebrow">Reports</p>
        <h2 className="report-title">Turn inventory activity into decisions.</h2>
        <p className="report-copy">
          Centralize stock, movement, loan, and monthly usage summaries in one
          formal reporting workspace. Daily pages stay operational; this page
          is for review, export, and management follow-up.
        </p>
      </div>

      <aside className="report-hero-summary">
        <div className="report-hero-summary__header">
          <div>
            <span>Selected report</span>
            <strong>{selectedReport.title}</strong>
          </div>
          <div>
            <small>{reportScopeLabel}</small>
            <small>{reportCountLabel}</small>
          </div>
        </div>

        <ReportSummaryGrid items={summaryMetrics} loading={loading} />
      </aside>
    </section>
  );
}

export default ReportHero;
