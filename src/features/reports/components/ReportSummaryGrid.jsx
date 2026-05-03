function ReportSummaryGrid({ items, loading = false }) {
  if (loading && items.length === 0) {
    return (
      <section className="report-summary-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="report-summary-card report-summary-card--loading">
            <span>Loading</span>
            <strong>—</strong>
            <p>Preparing report summary...</p>
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="report-summary-grid">
      {items.map((item) => (
        <article key={item.label} className="report-summary-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </section>
  );
}

export default ReportSummaryGrid;
