const getStatusClassName = (status) =>
  `report-status report-status-${String(status)
    .toLowerCase()
    .replace(/\s+/g, '-')}`;

const formatQty = (value) => {
  const qty = Number(value ?? 0);
  return qty > 0 ? qty.toLocaleString('en-US') : '';
};

const MonthlyUsagePreviewTable = ({ rows }) => {
  const daysInMonth = rows[0]?.daysInMonth ?? 31;
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <div className="report-usage-table">
      <table className="report-usage-grid">
        <thead>
          <tr>
            <th>No</th>
            <th>Code</th>
            <th>Product</th>
            <th>Image</th>
            <th>New Stock</th>
            <th>Old Stock</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
            <th>Total Used</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={row.productId ?? row.id}>
              <td>{index + 1}</td>
              <td>{row.id}</td>
              <td>
                <strong>{row.name}</strong>
              </td>
              <td>
                {row.image ? (
                  <img
                    className="report-usage-image"
                    src={row.image}
                    alt={row.name}
                  />
                ) : (
                  <span className="report-usage-image-placeholder">
                    {row.name?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </td>
              <td>{formatQty(row.newStock)}</td>
              <td>{formatQty(row.oldStock)}</td>

              {days.map((day) => (
                <td key={day}>{formatQty(row.dailyUsage?.[day - 1])}</td>
              ))}
              <td>{formatQty(row.totalUsed)}</td>
              <td>{Number(row.balance ?? 0).toLocaleString('en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportPreviewFilters = ({
  filterOptions = [],
  getFilterValue,
  onFilterChange,
}) => {
  if (!filterOptions.length) {
    return null;
  }

  return (
    <div className="report-preview-filters">
      {filterOptions.map((filter) => (
        <label className="report-preview-filter" key={filter.id}>
          <span >{filter.label}</span>
          <select
            value={
              getFilterValue
                ? getFilterValue(filter)
                : filter.options[0]?.value ?? 'ALL'
            }
            onChange={(event) => onFilterChange?.(filter.id, event.target.value)}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
};

function ReportPreviewTable({
  title,
  rows,
  loading = false,
  error = '',
  onRetry,
  filterOptions = [],
  getFilterValue,
  onFilterChange,
}) {
  const hasRows = rows.length > 0;
  const isMonthlyUsageReport = rows[0]?.reportType === 'monthlyUsage';

  return (
    <article className="report-panel report-preview-panel">
      <div className="report-section-header">
        <div className="left">
          <p className="report-eyebrow">Preview</p>
          <h3>{title}</h3>
          <p className="report-panel-copy">
            This preview shows how the report page can summarize operational
            data before export.
          </p>
        </div>

        <div className="right">
          <span className="report-pill">
            {loading ? 'Loading' : `${rows.length} rows`}
          </span>
          <ReportPreviewFilters
            filterOptions={filterOptions}
            getFilterValue={getFilterValue}
            onFilterChange={onFilterChange}
          />
        </div>

      </div>



      {error ? (
        <div className="report-state-card report-state-card--error">
          <strong>Report failed to load</strong>
          <p>{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      ) : !loading && !hasRows ? (
        <div className="report-state-card">
          <strong>No report data found</strong>
          <p>Try another report type or date range.</p>
        </div>
      ) : isMonthlyUsageReport ? (
        <MonthlyUsagePreviewTable rows={rows} />
      ) : (
        <div className="report-table">
          <div className="report-table-row report-table-head">
            <span>Code</span>
            <span>Item</span>
            <span>Category</span>
            <span>Owner</span>
            <span>Metric</span>
            <span>Status</span>
            <span>Updated</span>
          </div>

          {loading && !hasRows
            ? Array.from({ length: 4 }).map((_, index) => (
              <div
                className="report-table-row report-table-row--loading"
                key={index}
              >
                <span>Loading</span>
                <strong>Report data</strong>
                <span>-</span>
                <span>-</span>
                <span>-</span>
                <span>
                  <span className="report-status report-status-notice">
                    Loading
                  </span>
                </span>
                <span>-</span>
              </div>
            ))
            : rows.map((row) => (
              <div className="report-table-row" key={row.id}>
                <span>{row.id}</span>
                <strong>{row.name}</strong>
                <span>{row.category}</span>
                <span>{row.owner}</span>
                <span>{row.metric}</span>
                <span>
                  <span className={getStatusClassName(row.status)}>
                    {row.status}
                  </span>
                </span>
                <span>{row.updated}</span>
              </div>
            ))}
        </div>
      )}
    </article>
  );
}

export default ReportPreviewTable;
