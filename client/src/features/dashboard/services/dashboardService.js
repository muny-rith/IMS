import { ROUTE_PATHS } from "../../../constants/routes";
import api from "../../../lib/api";
import cacheService, { CACHE_TTL } from "../../../services/cacheService";

export const DASHBOARD_CACHE_KEY = 'dashboard_summary';

export const getCachedDashboardData = () => cacheService.get(DASHBOARD_CACHE_KEY);

const LOW_STOCK_THRESHOLD = 10;
const asObject = (value) => (Array.isArray(value) ? value[0] : value);

const formatNumber = (value) =>
  Number(value ?? 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const getOutstandingQty = (loan) =>
  (loan.loan_items ?? []).reduce((sum, item) => {
    const qty = Number(item.qty ?? 0);
    const returnedQty = Number(item.returned_qty ?? 0);
    return sum + Math.max(qty - returnedQty, 0);
  }, 0);

const isOpenLoan = (loan) => {
  if (["RETURNED", "CANCELLED"].includes(loan.loan_status)) {
    return false;
  }

  return getOutstandingQty(loan) > 0;
};

const isOverdueLoan = (loan, today) => {
  const dueDate = loan.due_date ? new Date(loan.due_date) : null;

  return (
    isOpenLoan(loan) &&
    dueDate &&
    !Number.isNaN(dueDate.getTime()) &&
    dueDate < today
  );
};

const buildHero = ({ lowStockCount, outOfStockCount, overdueLoans, activeLoans }) => {
  const alertCount = lowStockCount + outOfStockCount;

  if (overdueLoans > 0) {
    return {
      eyebrow: "Operations overview",
      title: "Loan follow-up needs attention today.",
      description:
        "Track stock health, active borrowing, and daily movement pressure from one live dashboard.",
      pulseLabel: "Ops pulse",
      pulseValue: `${formatNumber(overdueLoans)} overdue loan${overdueLoans === 1 ? "" : "s"}`,
      pulseDetail:
        "Open the loan page and follow up borrowed items before they block daily operations.",
      metaLabel: "Live dashboard data",
    };
  }

  if (alertCount > 0) {
    return {
      eyebrow: "Operations overview",
      title: "Stock pressure is visible before it becomes a problem.",
      description:
        "Track stock health, active borrowing, and daily movement pressure from one live dashboard.",
      pulseLabel: "Ops pulse",
      pulseValue: `${formatNumber(alertCount)} stock alert${alertCount === 1 ? "" : "s"}`,
      pulseDetail:
        `${formatNumber(outOfStockCount)} out of stock and ${formatNumber(lowStockCount)} low-stock items need review.`,
      metaLabel: "Live dashboard data",
    };
  }

  return {
    eyebrow: "Operations overview",
    title: "Stock and loan activity look calm right now.",
    description:
      "Track stock health, active borrowing, and daily movement pressure from one live dashboard.",
    pulseLabel: "Ops pulse",
    pulseValue: `${formatNumber(activeLoans)} active loan${activeLoans === 1 ? "" : "s"}`,
    pulseDetail:
      "No urgent stock or overdue-loan pressure is showing in the current dashboard snapshot.",
    metaLabel: "Live dashboard data",
  };
};

const buildStats = ({
  products,
  balances,
  lowStockCount,
  outOfStockCount,
  activeLoans,
  overdueLoans,
  dueSoonLoans,
  workers,
  workersBorrowing,
  monthStart,
}) => {
  const addedThisMonth = products.filter((product) => {
    const createdAt = product.created_at ? new Date(product.created_at) : null;
    return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart;
  }).length;

  const reservedQty = balances.reduce(
    (sum, item) => sum + Math.max(Number(item.reservedQty ?? 0), 0),
    0
  );

  return [
    {
      title: "Products tracked",
      value: formatNumber(products.length),
      detail: `${formatNumber(addedThisMonth)} added this month`,
      tag: "PR",
      tone: "amber",
    },
    {
      title: "Low stock alerts",
      value: formatNumber(lowStockCount + outOfStockCount),
      detail: `${formatNumber(outOfStockCount)} out of stock`,
      tag: "LS",
      tone: "warning",
    },
    {
      title: "Active loans",
      value: formatNumber(activeLoans),
      detail: `${formatNumber(overdueLoans)} overdue / ${formatNumber(dueSoonLoans)} due soon`,
      tag: "LN",
      tone: "violet",
    },
    {
      title: "Workers borrowing",
      value: formatNumber(workersBorrowing),
      detail: `${formatNumber(workers.length)} workers, ${formatNumber(reservedQty)} reserved`,
      tag: "WK",
      tone: "sky",
    },
  ];
};

const buildAlerts = ({ balances, loans, purchaseRequests, today }) => {
  const alerts = [];
  const lowStockRows = balances
    .filter((item) => item.availableQty <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.availableQty - b.availableQty)
    .slice(0, 3);

  lowStockRows.forEach((item) => {
    const isOut = item.availableQty <= 0;

    alerts.push({
      title: `${item.productName} ${isOut ? "is out of stock" : "is running low"}`,
      detail: `${formatNumber(Math.max(item.availableQty, 0))} available, ${formatNumber(item.reservedQty)} reserved. Category: ${item.category}.`,
      level: isOut ? "Critical" : "Watch",
    });
  });

  loans
    .filter((loan) => isOverdueLoan(loan, today))
    .slice(0, 2)
    .forEach((loan) => {
      const worker = asObject(loan.workers);

      alerts.push({
        title: `${worker?.worker_name ?? "A worker"} has an overdue loan`,
        detail: `${loan.loan_code ?? "Loan"} was due ${formatDate(loan.due_date)} with ${formatNumber(getOutstandingQty(loan))} items remaining.`,
        level: "Critical",
      });
    });

  const pendingRequests = purchaseRequests.filter(
    (request) => request.request_status === "PENDING"
  );

  if (pendingRequests.length > 0) {
    alerts.push({
      title: "Purchase requests are waiting for review",
      detail: `${formatNumber(pendingRequests.length)} request${pendingRequests.length === 1 ? "" : "s"} still need approval or rejection.`,
      level: "Notice",
    });
  }

  if (!alerts.length) {
    alerts.push({
      title: "No urgent operational alerts",
      detail:
        "Stock balances, active loans, and purchase requests look calm in the current snapshot.",
      level: "Notice",
    });
  }

  return alerts.slice(0, 5);
};

const buildQuickActions = ({ productCount, lowStockCount, overdueLoans }) => [
  {
    label: "Products",
    hint: `${formatNumber(productCount)} products in catalog.`,
    path: ROUTE_PATHS.products,
  },
  {
    label: "Review stock",
    hint: `${formatNumber(lowStockCount)} low-stock items need a stock decision.`,
    path: ROUTE_PATHS.stocks,
  },
  {
    label: "Open loans",
    hint: `${formatNumber(overdueLoans)} overdue loans need follow-up.`,
    path: ROUTE_PATHS.loans,
  },
  {
    label: "View reports",
    hint: "Print stock, movement, loan, and monthly usage reports.",
    path: ROUTE_PATHS.reports,
  },
];

export const fetchDashboardData = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = cacheService.get(DASHBOARD_CACHE_KEY);
    if (cached) return cached;
  }
  const response = await api.get('/dashboard/stats');
  const raw = response.data.data;
  if (raw.hero && Array.isArray(raw.stats)) {
    const toneMap = {
      'stock-on-hand': { tag: 'PR', tone: 'amber' },
      'low-stock-alert': { tag: 'LS', tone: 'warning' },
      'active-loans': { tag: 'LN', tone: 'violet' },
      'overdue-loans': { tag: 'WK', tone: 'sky' }
    };

    const stats = raw.stats.map(s => {
      const config = toneMap[s.id] || { tag: 'PR', tone: 'amber' };
      return {
        title: s.title,
        value: s.value,
        detail: s.detail || s.meta || '',
        tag: s.tag || config.tag,
        tone: s.tone || config.tone
      };
    });

    const alerts = (raw.alerts && raw.alerts.length > 0)
      ? raw.alerts.map(a => ({
          title: a.title,
          detail: a.detail,
          level: a.level || (a.tone === 'danger' ? 'Critical' : a.tone === 'warning' ? 'Watch' : 'Notice')
        }))
      : [
          {
            title: "No urgent operational alerts",
            detail: "Stock balances, active loans, and purchase requests look calm in the current snapshot.",
            level: "Notice"
          }
        ];

    const chartData = (raw.chartData || []).map(c => ({
      label: c.label || c.day,
      stockIn: c.stockIn ?? c.issued ?? 0,
      stockOut: c.stockOut ?? c.returned ?? 0
    }));

    const resultData = {
      hero: raw.hero,
      stats,
      alerts,
      quickActions: raw.quickActions?.length ? raw.quickActions : buildQuickActions({
        productCount: 0,
        lowStockCount: 0,
        overdueLoans: 0
      }),
      chartData
    };

    cacheService.set(DASHBOARD_CACHE_KEY, resultData, CACHE_TTL.DASHBOARD);
    return resultData;
  }

  const {
    products = [],
    balances = [],
    loans = [],
    workers = [],
    purchaseRequests = [],
    lowStockCount = 0,
    outOfStockCount = 0,
    activeLoans = 0,
    overdueLoans = 0,
    dueSoonLoans = 0,
    workersBorrowing = 0,
    chartData = []
  } = raw || {};

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const resultData = {
    hero: buildHero({
      lowStockCount,
      outOfStockCount,
      overdueLoans,
      activeLoans,
    }),
    stats: buildStats({
      products,
      balances,
      lowStockCount,
      outOfStockCount,
      activeLoans,
      overdueLoans,
      dueSoonLoans,
      workers,
      workersBorrowing,
      monthStart,
    }),
    alerts: buildAlerts({
      balances,
      loans,
      purchaseRequests,
      today,
    }),
    quickActions: buildQuickActions({
      productCount: products.length,
      lowStockCount,
      overdueLoans,
    }),
    chartData,
  };

  cacheService.set(DASHBOARD_CACHE_KEY, resultData, CACHE_TTL.DASHBOARD);
  return resultData;
};

export const fetchDashboardHero = async () => (await fetchDashboardData()).hero;
export const fetchDashboardStats = async () => (await fetchDashboardData()).stats;
export const fetchDashboardAlerts = async () => (await fetchDashboardData()).alerts;
export const fetchDashboardQuickActions = async () =>
  (await fetchDashboardData()).quickActions;
export const fetchDashboardLoanTrend = async () =>
  (await fetchDashboardData()).chartData;

