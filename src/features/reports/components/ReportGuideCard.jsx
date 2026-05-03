function ReportGuideCard({ selectedReport, exportFormat }) {
  return (
    <article className="report-guide-card">
      <div>
        <p className="report-eyebrow">Guide</p>
        <h3>Make reports decision-ready</h3>
        <p>
          Use this area for review, export, and management follow-up. Daily
          actions still belong in Stock, Loan, Product, and Worker pages.
        </p>
      </div>

      <div className="report-guide-focus">
        <span>Best next report</span>
        <strong>{selectedReport.title}</strong>
      </div>

      <ul className="report-guide-list">
        <li>Stock reports show current inventory health.</li>
        <li>Movement reports explain what changed.</li>
        <li>Loan reports show who still needs follow-up.</li>
      </ul>

      <div className="report-guide-footer">
        <span className="report-pill">{exportFormat}</span>
        <span className="report-pill">Excel</span>
        <span className="report-pill">CSV</span>
      </div>
    </article>
  );
}

export default ReportGuideCard;
