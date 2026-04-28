import styles from "../dashboard.module.css";

function DashboardQuickActions({ items, onAction }) {
  return (
    <div className={styles.actionList}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={styles.actionButton}
          onClick={() => onAction(item)}
        >
          <strong>{item.label}</strong>
          <span>{item.hint}</span>
        </button>
      ))}
    </div>
  );
}

export default DashboardQuickActions;
