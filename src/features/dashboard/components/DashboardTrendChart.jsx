import { useState } from "react";
import styles from "./DashboardTrendChart.module.css";

function DashboardTrendChart({ data = [] }) {
  const [selectedBar, setSelectedBar] = useState(null);

  const normalizedData = data.map((item) => ({
    ...item,
    stockIn: Number(item.stockIn ?? item.loanOut ?? 0),
    stockOut: Number(item.stockOut ?? item.returned ?? 0),
  }));

  const maxValue = Math.max(
    1,
    ...normalizedData.flatMap((item) => [item.stockIn, item.stockOut])
  );

  const totals = normalizedData.reduce(
    (sum, item) => ({
      stockIn: sum.stockIn + item.stockIn,
      stockOut: sum.stockOut + item.stockOut,
    }),
    { stockIn: 0, stockOut: 0 }
  );

  const getBarId = (label, type) => `${label}-${type}`;

  const getBarHeight = (value) =>
    `${Math.max((value / maxValue) * 340, value > 0 ? 8 : 0)}px`;

  const handleSelectBar = (bar) => {
    setSelectedBar((current) => (current?.id === bar.id ? null : bar));
  };

  if (!normalizedData.length) {
    return (
      <div className={styles.trendEmpty}>
        <strong>No stock movement yet</strong>
        <span>Stock in and stock out activity will appear here once recorded.</span>
      </div>
    );
  }

  return (
    <div className={styles.trendChart}>
      <div className={styles.trendSummary}>
        <div className={styles.trendMetric}>
          <span>Total stock in</span>
          <strong>{totals.stockIn}</strong>
        </div>
        <div className={styles.trendMetric}>
          <span>Total stock out</span>
          <strong>{totals.stockOut}</strong>
        </div>
      </div>

      <div className={styles.trendLegend}>
        <div className={styles.trendLegendItem}>
          <span className={`${styles.trendSwatch} ${styles.trendSwatchIn}`} />
          <span>Stock in</span>
        </div>
        <div className={styles.trendLegendItem}>
          <span className={`${styles.trendSwatch} ${styles.trendSwatchOut}`} />
          <span>Stock out</span>
        </div>
      </div>

      <div className={styles.trendCanvas}>
        {normalizedData.map((item) => (
          <div className={styles.trendColumn} key={item.label}>
            <div className={styles.trendBars}>
              <button
                type="button"
                className={`${styles.trendBar} ${styles.trendBarIn}`}
                style={{ height: getBarHeight(item.stockIn) }}
                aria-label={`${item.label}: ${item.stockIn} stock in`}
                onClick={() =>
                  handleSelectBar({
                    id: getBarId(item.label, "stockIn"),
                    label: item.label,
                    type: "Stock in",
                    value: item.stockIn,
                  })
                }
              >
                <span className={styles.trendTooltip}>
                  <strong>{item.label}</strong>
                  <span>Stock in: {item.stockIn}</span>
                </span>
              </button>

              <button
                type="button"
                className={`${styles.trendBar} ${styles.trendBarOut}`}
                style={{ height: getBarHeight(item.stockOut) }}
                aria-label={`${item.label}: ${item.stockOut} stock out`}
                onClick={() =>
                  handleSelectBar({
                    id: getBarId(item.label, "stockOut"),
                    label: item.label,
                    type: "Stock out",
                    value: item.stockOut,
                  })
                }
              >
                <span className={styles.trendTooltip}>
                  <strong>{item.label}</strong>
                  <span>Stock out: {item.stockOut}</span>
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
