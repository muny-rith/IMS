import styles from "../dashboard.module.css";

function DashboardStatCard({ title, value, detail, tag, tone = "amber" }) {
  return (
    <article className={`${styles.statCard} ${styles[`statCard${tone}`]}`}>
      <span className={`${styles.statTag} ${styles[`statTag${tone}`]}`}>{tag}</span>

      <div className={styles.statBody}>
        <p className={styles.statTitle}>{title}</p>
        <strong className={styles.statValue}>{value}</strong>
        <span className={styles.statDetail}>{detail}</span>
      </div>
    </article>
  );
}

export default DashboardStatCard;
