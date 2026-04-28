import { useNavigate } from "react-router-dom";
import DashboardAlertList from "../components/DashboardAlertList";
import DashboardQuickActions from "../components/DashboardQuickActions";
import DashboardSectionHeader from "../components/DashboardSectionHeader";
import DashboardStatCard from "../components/DashboardStatCard";
import DashboardTrendChart from "../components/DashboardTrendChart";
import { useDashboard } from "../hooks/useDashboard";
import styles from "../dashboard.module.css";

function DashboardPage() {
  const navigate = useNavigate();
  const { hero, stats, alerts, quickActions, chartData, loading, error, reload } =
    useDashboard();

  const handleAction = (action) => {
    if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <article className={styles.heroContent}>
          <p className={styles.heroEyebrow}>{hero?.eyebrow || "Dashboard"}</p>
          <h2 className={styles.heroTitle}>
            {hero?.title || "Loading dashboard view..."}
          </h2>
          <p className={styles.heroDescription}>
            {hero?.description ||
              "Preparing your operational dashboard and inventory summary."}
          </p>
        </article>

        <aside className={styles.heroPanel}>
          <div>
            <span className={styles.heroPanelLabel}>
              {hero?.pulseLabel || "Ops pulse"}
            </span>
            <h3 className={styles.heroPanelValue}>
              {hero?.pulseValue || "Loading pulse..."}
            </h3>
            <p className={styles.heroPanelDetail}>
              {hero?.pulseDetail ||
                "Dashboard metrics will appear here when the data layer is ready."}
            </p>
          </div>

          <div>
            <p className={styles.heroPanelMeta}>Mock-backed dashboard module</p>
            <button
              type="button"
              className={styles.heroPanelButton}
              onClick={reload}
            >
              Refresh view
            </button>
          </div>
        </aside>
      </section>

      {loading ? (
        <section className={styles.statePanel}>
          <h3 className={styles.stateTitle}>Loading dashboard</h3>
          <p>Collecting summary cards, alerts, and loan activity.</p>
        </section>
      ) : error ? (
        <section className={`${styles.statePanel} ${styles.statePanelError}`}>
          <h3 className={styles.stateTitle}>Dashboard unavailable</h3>
          <p>{error}</p>
          <button type="button" className={styles.stateButton} onClick={reload}>
            Try again
          </button>
        </section>
      ) : (
        <>
          <section className={styles.statsGrid}>
            {stats.map((item) => (
              <DashboardStatCard key={item.title} {...item} />
            ))}
          </section>

          <section className={styles.mainGrid}>
            <article className={`${styles.panel} ${styles.chartPanel}`}>
              <DashboardSectionHeader
                eyebrow="Loan activity"
                title="Loan-out trend"
                description="A simple operational view of outgoing loans versus returned items over the last seven days."
                rightContent={<span className={styles.pill}>Last 7 days</span>}
              />
              <DashboardTrendChart data={chartData} />
            </article>

            <div className={styles.sideStack}>
              <article className={styles.panel}>
                <DashboardSectionHeader
                  eyebrow="Attention needed"
                  title="Priority alerts"
                  description="These items deserve review before they turn into bigger operational problems."
                />
                <DashboardAlertList items={alerts} />
              </article>

              <article className={styles.panel}>
                <DashboardSectionHeader
                  eyebrow="Fast lane"
                  title="Quick actions"
                  description="Jump directly to the operational areas your team uses most."
                />
                <DashboardQuickActions
                  items={quickActions}
                  onAction={handleAction}
                />
              </article>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
