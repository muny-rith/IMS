import styles from "./DashboardSectionHeader.module.css";

function DashboardSectionHeader({ eyebrow, title, description, rightContent = null }) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        {eyebrow ? <p className={styles.sectionEyebrow}>{eyebrow}</p> : null}
        <h3 className={styles.sectionTitle}>{title}</h3>
        {description ? (
          <p className={styles.sectionDescription}>{description}</p>
        ) : null}
      </div>

      {rightContent ? (
        <div className={styles.sectionHeaderAside}>{rightContent}</div>
      ) : null}
    </div>
  );
}

export default DashboardSectionHeader;
