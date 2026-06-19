import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import styles from "./DashboardStatCard.module.css";

const CARD_TONE_CLASS = {
  amber: styles.statCardAmber,
  warning: styles.statCardWarning,
  violet: styles.statCardViolet,
  sky: styles.statCardSky,
};

const TAG_TONE_CLASS = {
  amber: styles.statIconAmber,
  warning: styles.statIconWarning,
  violet: styles.statIconViolet,
  sky: styles.statIconSky,
};

const ICON_MAP = {
  PR: Inventory2OutlinedIcon,
  LS: WarningAmberOutlinedIcon,
  LN: AssignmentReturnOutlinedIcon,
  WK: PersonOutlineOutlinedIcon,
};

function DashboardStatCard({ title, value, detail, tag, tone = "amber" }) {
  const Icon = ICON_MAP[tag] || Inventory2OutlinedIcon;

  return (
    <article
      className={`${styles.statCard} ${
        CARD_TONE_CLASS[tone] || styles.statCardAmber
      }`}
    >
      <span
        className={`${styles.statIcon} ${
          TAG_TONE_CLASS[tone] || styles.statIconAmber
        }`}
        aria-hidden="true"
      >
        <Icon fontSize="small" />
      </span>

      <div className={styles.statBody}>
        <p className={styles.statTitle}>{title}</p>
        <strong className={styles.statValue}>{value}</strong>
        <span className={styles.statDetail}>{detail}</span>
      </div>
    </article>
  );
}

export default DashboardStatCard;
