function ReportTypeGrid({ items, activeReport, onSelect }) {
  return (
    <article className="report-panel report-picker-panel">
      <div className="report-section-header">
        <div>
          <p className="report-eyebrow">Report library</p>
          <h3>Choose a report type</h3>
          <p className="report-panel-copy">
            Start with a focused report, then add filters, export, or print.
          </p>
        </div>
      </div>

      <div className="report-type-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`report-type-card report-type-card-${item.tone}${
              activeReport === item.id ? " report-type-card-active" : ""
            }`}
            onClick={() => onSelect(item.id)}
          >
            <span>{item.eyebrow}</span>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>
    </article>
  );
}

export default ReportTypeGrid;
