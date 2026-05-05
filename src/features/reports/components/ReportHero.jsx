function ReportHero({
  selectedReport,
  dateRange,
  dateRangeOptions,
  exportFormat,
  exportFormats,
  reportCount = 0,
  loading = false,
  onDateRangeChange,
  onExportFormatChange,
  onGenerateReport,
}) {

  const usesDateRange = selectedReport.usesDateRange !== false;

  const reportScopeLabel =
    selectedReport.scopeLabel || (usesDateRange ? dateRange : "Live report");
  const dateRangeValue = usesDateRange ? dateRange : reportScopeLabel;
  const dateRangeSelectOptions = usesDateRange
    ? dateRangeOptions
    : [reportScopeLabel];
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

        <div className="report-controls">
          <label
            className={
              selectedReport.usesDateRange
                ? "report-control"
                : "report-control report-control--disabled"
            }
          >
            <span>Date range</span>
            <select
              value={dateRangeValue}
              disabled={!usesDateRange}
              onChange={(event) => onDateRangeChange(event.target.value)}
            >
              {dateRangeSelectOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <small className="report-control-hint">
              {selectedReport.dateHint}
            </small>
          </label>

          <label className="report-controls">

            <span>Export</span>

            <select
              value={exportFormat}
              onChange={(event) => onExportFormatChange(event.target.value)}
            >
              {exportFormats.map((format) => (
                <option key={format}>{format}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="report-primary-button"
            onClick={onGenerateReport}
            style={{ alignSelf: "center" }}
          >
            Generate {exportFormat}
          </button>
        </div>
      </div>

      <aside className="report-hero-card">
        <span>Selected report</span>
        <strong>{selectedReport.title}</strong>
        <p>{selectedReport.description}</p>
        <div>
          <small>{reportScopeLabel}</small>
          <small>{reportCountLabel}</small>

        </div>
      </aside>
    </section>
  );
}

export default ReportHero;
