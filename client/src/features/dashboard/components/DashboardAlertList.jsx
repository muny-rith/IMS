import styles from "./DashboardAlertList.module.css";

const LEVEL_CLASS_MAP = {
  Critical: styles.alertLevelCritical,
  Watch: styles.alertLevelWatch,
  Notice: styles.alertLevelNotice,
};

function DashboardAlertList({ items }) {
  return (
    <div className={styles.alertList}>
      {items.map((item) => {
        const levelClass = LEVEL_CLASS_MAP[item.level] || styles.alertLevelNotice;

        return (
          <article className={styles.alertItem} key={item.title}>
            <div className={styles.alertTop}>
              <strong>{item.title}</strong>
              <span className={`${styles.alertLevel} ${levelClass}`}>
                {item.level}
              </span>
            </div>

            <p className={styles.alertDetail}>{item.detail}</p>
          </article>
        );
      })}
    </div>
  );
}

export default DashboardAlertList;
