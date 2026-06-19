import { ROUTE_PATHS } from "../../../constants/routes";
import api from "../../../lib/api";

const LOW_STOCK_THRESHOLD = 10;
const STOCK_IN_MOVEMENT_TYPES = new Set([
  "OPENING",
  "ADJUSTMENT_IN",
  "LOAN_RETURN",
  "RETURN",
  "STOCK_IN",
]);
const STOCK_OUT_MOVEMENT_TYPES = new Set([
  "ADJUSTMENT_OUT",
  "LOAN_OUT",
  "SALE",
  "SALE_OUT",
  "STOCK_ISSUE",
  "STOCK_ISSUE_OUT",
  "ISSUE",
]);

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

const getDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const getDayLabel = (date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);

const getLastSevenDays = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date,
      key: getDateKey(date),
      label: getDayLabel(date),
      stockIn: 0,
      stockOut: 0,
    };
  });
};

const getMovementDirection = (movementType = "") => {
  if (STOCK_IN_MOVEMENT_TYPES.has(movementType)) {
    return "in";
  }

  if (STOCK_OUT_MOVEMENT_TYPES.has(movementType)) {
    return "out";
  }

  if (movementType.endsWith("_IN") || movementType.includes("RETURN")) {
    return "in";
  }

  if (
    movementType.endsWith("_OUT") ||
    movementType.includes("ISSUE") ||
    movementType.includes("SALE")
  ) {
    return "out";
  }

  return null;
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

const isDueSoonLoan = (loan, today, nextSevenDays) => {
  const dueDate = loan.due_date ? new Date(loan.due_date) : null;

  return (
    isOpenLoan(loan) &&
    dueDate &&
    !Number.isNaN(dueDate.getTime()) &&
    dueDate >= today &&
    dueDate <= nextSevenDays
  );
};

const normalizeStockBalance = (row) => {
  const product = asObject(row.products);
  const category = asObject(product?.categories);
  const onHandQty = Number(row.on_hand_qty ?? 0);
  const reservedQty = Number(row.reserved_qty ?? 0);
  const availableQty = onHandQty - reservedQty;

  return {
    id: row.stock_balance_id,
    productId: row.product_id,
    productCode: product?.product_code ?? "",
    productName: product?.product_name ?? "Unnamed product",
    category: category?.category_name ?? "-",
    onHandQty,
    reservedQty,
    availableQty,
    updatedAt: row.updated_at,
  };
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

const buildStockTrend = (movements) => {
  const days = getLastSevenDays();
  const dayMap = new Map(days.map((day) => [day.key, day]));

  (movements ?? []).forEach((movement) => {
    const day = dayMap.get(getDateKey(movement.created_at));
    if (!day) return;

    const qty = Number(movement.qty ?? 0);
    const direction = getMovementDirection(movement.movement_type);

    if (direction === "in") {
      day.stockIn += qty;
    }

    if (direction === "out") {
      day.stockOut += qty;
    }
  });

  return days.map(({ label, stockIn, stockOut }) => ({
    label,
    stockIn,
    stockOut,
  }));
};

const assertNoError = (result) => {
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? [];
};

export const fetchDashboardData = async () => {
  const response = await api.get('/dashboard/stats');
  const {
    products,
    balances,
    loans,
    workers,
    movements,
    purchaseRequests,
    lowStockCount,
    outOfStockCount,
    activeLoans,
    overdueLoans,
    dueSoonLoans,
    workersBorrowing,
    chartData
  } = response.data.data;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
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
};

export const fetchDashboardHero = async () => (await fetchDashboardData()).hero;
export const fetchDashboardStats = async () => (await fetchDashboardData()).stats;
export const fetchDashboardAlerts = async () => (await fetchDashboardData()).alerts;
export const fetchDashboardQuickActions = async () =>
  (await fetchDashboardData()).quickActions;
export const fetchDashboardLoanTrend = async () =>
  (await fetchDashboardData()).chartData;

