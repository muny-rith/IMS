import { useState } from "react";
import styles from "../dashboard.module.css";

function DashboardTrendChart({ data }) {
  const [selectedBar, setSelectedBar] = useState(null);

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

  const getBarId = (label, type) => `${label}-${type}`;

  const handleSelectBar = (bar) => {
    setSelectedBar((current) => (current?.id === bar.id ? null : bar));
  };

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
              <button
                type="button"
                className={`${styles.trendBar} ${styles.trendBarLoan}`}
                style={{ height: `${(item.loanOut / maxValue) * 340}px` }}
                aria-label={`${item.label}: ${item.loanOut} loan-outs`}
                onClick={() =>
                  handleSelectBar({
                    id: getBarId(item.label, "loanOut"),
                    label: item.label,
                    type: "Loan out",
                    value: item.loanOut,
                  })
                }
              >
                <span className={styles.trendTooltip}>
                  <strong>{item.label}</strong>
                  <span>Loan out: {item.loanOut}</span>
                </span>
              </button>

              <button
                type="button"
                className={`${styles.trendBar} ${styles.trendBarReturn}`}
                style={{ height: `${(item.returned / maxValue) * 340}px` }}
                aria-label={`${item.label}: ${item.returned} returns`}
                onClick={() =>
                  handleSelectBar({
                    id: getBarId(item.label, "returned"),
                    label: item.label,
                    type: "Returned",
                    value: item.returned,
                  })
                }
              >
                <span className={styles.trendTooltip}>
                  <strong>{item.label}</strong>
                  <span>Returned: {item.returned}</span>
                </span>
              </button>
            </div>
            <span className={styles.trendLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      {selectedBar ? (
        <div className={styles.trendSelectedDetail}>
          <span>{selectedBar.label}</span>
          <strong>
            {selectedBar.type}: {selectedBar.value}
          </strong>
        </div>
      ) : null}
    </div>
  );
}

export default DashboardTrendChart;
