import styles from "../dashboard.module.css";

function DashboardTrendChart({ data }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.loanOut, item.returned])
  );

  const totals = data.reduce(
    (sum, item) => ({
      loanOut: sum.loanOut + item.loanOut,
      returned: sum.returned + item.returned,
    }),
    { loanOut: 0, returned: 0 }
  );

  return (
    <div className={styles.trendChart}>
      <div className={styles.trendSummary}>
        <div className={styles.trendMetric}>
          <span>Total loan-outs</span>
          <strong>{totals.loanOut}</strong>
        </div>
        <div className={styles.trendMetric}>
          <span>Total returns</span>
          <strong>{totals.returned}</strong>
        </div>
      </div>

      <div className={styles.trendLegend}>
        <div className={styles.trendLegendItem}>
          <span className={`${styles.trendSwatch} ${styles.trendSwatchLoan}`} />
          <span>Loan out</span>
        </div>
        <div className={styles.trendLegendItem}>
          <span className={`${styles.trendSwatch} ${styles.trendSwatchReturn}`} />
          <span>Returned</span>
        </div>
      </div>

      <div className={styles.trendCanvas}>
        {data.map((item) => (
          <div className={styles.trendColumn} key={item.label}>
            <div className={styles.trendBars}>
              <span
                className={`${styles.trendBar} ${styles.trendBarLoan}`}
                style={{ height: `${(item.loanOut / maxValue) * 340}px` }}
                title={`${item.label}: ${item.loanOut} loan-outs`}
              />
              <span
                className={`${styles.trendBar} ${styles.trendBarReturn}`}
                style={{ height: `${(item.returned / maxValue) * 340}px` }}
                title={`${item.label}: ${item.returned} returns`}
              />
            </div>
            <span className={styles.trendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardTrendChart;
