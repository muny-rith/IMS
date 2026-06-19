function SavedReportsPanel({ items }) {
  return (
    <article className="report-panel">
      <div className="report-section-header">
        <div>
          <p className="report-eyebrow">Saved</p>
          <h3>Quick reviews</h3>
        </div>
      </div>

      <ul className="report-saved-list">
        {items.map((item) => (
          <li key={item.title}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <span className="report-pill">{item.cadence}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default SavedReportsPanel;
