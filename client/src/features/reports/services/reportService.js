import api from '../../../lib/api';

const asObject = (value) => (Array.isArray(value) ? value[0] : value);

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatMovementType = (value = '') =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const STOCK_IN_MOVEMENT_TYPES = ['OPENING', 'ADJUSTMENT_IN'];
const STOCK_OUT_MOVEMENT_TYPES = ['ADJUSTMENT_OUT'];
const USAGE_MOVEMENT_TYPES = [
  ...STOCK_IN_MOVEMENT_TYPES,
  ...STOCK_OUT_MOVEMENT_TYPES,
];
const INITIAL_OPENING_STOCK_CUTOFF = new Date('2026-05-05T00:00:00');

const getDateRangeBounds = (dateRange) => {
  const now = new Date();
  const from = new Date(now);

  switch (dateRange) {
    case 'Today':
      from.setHours(0, 0, 0, 0);
      break;
    case 'Last 7 days':
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      break;
    case 'This month':
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      break;
    case 'Last 30 days':
    default:
      from.setDate(now.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      break;
  }

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
};

const toMonthValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getPreviousMonthValue = () => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);

  return toMonthValue(date);
};

const parseReportMonth = (reportMonth) => {
  const [year, month] = String(reportMonth || getPreviousMonthValue())
    .split('-')
    .map(Number);

  if (!year || !month || month < 1 || month > 12) {
    return parseReportMonth(getPreviousMonthValue());
  }

  return new Date(year, month - 1, 1);
};

const getMonthBounds = (reportMonth) => {
  const selectedMonth = parseReportMonth(reportMonth);
  const monthStart = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    1
  );
  const monthEnd = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return {
    monthStart,
    monthEnd,
    daysInMonth: monthEnd.getDate(),
    reportMonth: toMonthValue(monthStart),
    monthLabel: new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(monthStart),
  };
};

const getStockStatus = (availableQty) => {
  if (availableQty <= 0) return 'Critical';
  if (availableQty <= 5) return 'Watch';
  if (availableQty <= 10) return 'Notice';
  return 'Healthy';
};

const getMovementStatus = (movementType) => {
  if (movementType?.includes('ISSUE')) return 'Critical';
  if (movementType?.includes('OUT') || movementType?.includes('SALE')) {
    return 'Watch';
  }
  if (movementType?.includes('RETURN') || movementType?.includes('IN')) {
    return 'Healthy';
  }
  return 'Notice';
};

const getLoanStatus = ({ status, dueDate, remainingQty }) => {
  const due = dueDate ? new Date(dueDate) : null;
  const isOverdue =
    due && !Number.isNaN(due.getTime()) && due < new Date() && remainingQty > 0;

  if (isOverdue) return 'Critical';
  if (status === 'PARTIAL') return 'Watch';
  if (remainingQty > 0) return 'Notice';
  return 'Healthy';
};

const getLoanReportFilterStatus = (row) => {
  const items = row.loan_items ?? [];
  const remainingQty = items.reduce((sum, item) => {
    const qty = Number(item.qty ?? 0);
    const returnedQty = Number(item.returned_qty ?? 0);
    return sum + Math.max(qty - returnedQty, 0);
  }, 0);
  const due = row.due_date ? new Date(row.due_date) : null;
  const isOverdue =
    due && !Number.isNaN(due.getTime()) && due < new Date() && remainingQty > 0;

  if (isOverdue) return 'OVERDUE';
  if (row.loan_status === 'PARTIAL') return 'PARTIAL_RETURN';
  if (remainingQty > 0) return 'ACTIVE';
  return 'CLOSED';
};

const applyStockReportFilter = (rows, filters = {}) => {
  switch (filters.stockStatus) {
    case 'LOW_STOCK':
      return rows.filter((row) => row.status === 'Watch' || row.status === 'Notice');
    case 'OUT_OF_STOCK':
      return rows.filter((row) => row.status === 'Critical');
    case 'HEALTHY':
      return rows.filter((row) => row.status === 'Healthy');
    case 'ALL':
    default:
      return rows;
  }
};

const applyLoanReportFilter = (rows, filters = {}) => {
  if (!filters.loanStatus || filters.loanStatus === 'ALL') {
    return rows;
  }

  return rows.filter((row) => getLoanReportFilterStatus(row.raw) === filters.loanStatus);
};

const normalizeStockRow = (row) => {
  const product = asObject(row.products);
  const category = asObject(product?.categories);
  const onHandQty = Number(row.on_hand_qty ?? 0);
  const reservedQty = Number(row.reserved_qty ?? 0);
  const availableQty = onHandQty - reservedQty;

  return {
    id: product?.product_code || `STK-${row.stock_balance_id}`,
    name: product?.product_name || 'Unnamed product',
    category: category?.category_name || '-',
    owner: 'Inventory',
    metric: `${availableQty} available`,
    status: getStockStatus(availableQty),
    updated: formatDate(row.updated_at),
    raw: row,
  };
};

const normalizeMovementRow = (row) => {
  const product = asObject(row.products);
  const movementType = row.movement_type || 'MOVEMENT';
  const qty = Number(row.qty ?? 0);
  const unitPrice = Number(product?.unit_price ?? 0);
  const image =
    product?.image_url ??
    product?.product_image_url ??
    product?.image_path ??
    product?.image ??
    null;

  return {
    reportType: 'stockMovement',
    id: `MV-${row.movement_id}`,
    productCode: product?.product_code || '',
    movementId: row.movement_id,
    movementType,
    name: product?.product_name || 'Unnamed product',
    category: formatMovementType(movementType),
    owner: movementType.includes('LOAN') ? 'Loan' : 'Stock',
    metric: `${qty} units`,
    qty,
    unit: '',
    image,
    unitPrice,
    totalPrice: qty * unitPrice,
    movementDate: row.created_at,
    status: getMovementStatus(movementType),
    updated: formatDate(row.created_at),
    raw: row,
  };
};

const normalizeLoanRow = (row) => {
  const worker = asObject(row.workers);
  const items = row.loan_items ?? [];
  const remainingQty = items.reduce((sum, item) => {
    const qty = Number(item.qty ?? 0);
    const returnedQty = Number(item.returned_qty ?? 0);
    return sum + Math.max(qty - returnedQty, 0);
  }, 0);

  return {
    id: row.loan_code || `LN-${row.loan_id}`,
    name: worker?.worker_name || 'Unknown worker',
    category: row.loan_status || 'OPEN',
    owner: worker?.worker_code || '-',
    metric: `${remainingQty} remaining`,
    status: getLoanStatus({
      status: row.loan_status,
      dueDate: row.due_date,
      remainingQty,
    }),
    updated: row.due_date ? `Due ${formatDate(row.due_date)}` : formatDate(row.loan_date),
    raw: row,
  };
};

const normalizeWorkerHistoryRows = (rows) => {
  const workers = new Map();

  rows.forEach((row) => {
    const worker = asObject(row.workers);
    const workerId = row.worker_id || worker?.worker_id || 'unknown';
    const current = workers.get(workerId) ?? {
      id: worker?.worker_code || `WK-${workerId}`,
      name: worker?.worker_name || 'Unknown worker',
      category: worker?.department || '-',
      owner: worker?.position_title || 'Worker',
      totalLoans: 0,
      openLoans: 0,
      remainingQty: 0,
      latestDate: row.loan_date,
    };

    const remainingQty = (row.loan_items ?? []).reduce((sum, item) => {
      const qty = Number(item.qty ?? 0);
      const returnedQty = Number(item.returned_qty ?? 0);
      return sum + Math.max(qty - returnedQty, 0);
    }, 0);

    current.totalLoans += 1;
    current.remainingQty += remainingQty;
    current.openLoans += remainingQty > 0 ? 1 : 0;

    if (row.loan_date && new Date(row.loan_date) > new Date(current.latestDate ?? 0)) {
      current.latestDate = row.loan_date;
    }

    workers.set(workerId, current);
  });

  return Array.from(workers.values()).map((worker) => ({
    id: worker.id,
    name: worker.name,
    category: worker.category,
    owner: worker.owner,
    metric: `${worker.openLoans} open / ${worker.remainingQty} remaining`,
    status:
      worker.remainingQty > 0
        ? worker.openLoans > 1
          ? 'Watch'
          : 'Notice'
        : 'Healthy',
    updated: `${worker.totalLoans} loans`,
    raw: worker,
  }));
};

const createMonthlyUsageRow = ({ product, daysInMonth, monthLabel, reportMonth }) => {
  const category = asObject(product.categories);

  return {
    reportType: 'monthlyUsage',
    productId: product.product_id,
    id: product.product_code || `PR-${product.product_id}`,
    name: product.product_name || 'Unnamed product',
    category: category?.category_name || '-',
    image:
      product.image_url ??
      product.product_image_url ??
      product.image_path ??
      product.image ??
      '',
    oldStock: 0,
    newStock: 0,
    dailyUsage: Array.from({ length: daysInMonth }, () => 0),
    totalUsed: 0,
    balance: 0,
    daysInMonth,
    monthLabel,
    reportMonth,
    raw: product,
  };
};

const normalizeMonthlyUsageRows = ({ products, movements, bounds }) => {
  const productMap = new Map();

  (products ?? []).forEach((product) => {
    productMap.set(
      String(product.product_id),
      createMonthlyUsageRow({
        product,
        daysInMonth: bounds.daysInMonth,
        monthLabel: bounds.monthLabel,
        reportMonth: bounds.reportMonth,
      })
    );
  });

  (movements ?? []).forEach((movement) => {
    const row = productMap.get(String(movement.product_id));
    const movementType = movement.movement_type;

    if (!row || !USAGE_MOVEMENT_TYPES.includes(movementType)) {
      return;
    }

    const qty = Number(movement.qty ?? 0);
    const movementDate = new Date(movement.created_at);

    if (Number.isNaN(movementDate.getTime()) || qty <= 0) {
      return;
    }

    const isInitialOpeningStock =
      movementType === 'OPENING' && movementDate < INITIAL_OPENING_STOCK_CUTOFF;

    if (movementDate < bounds.monthStart || isInitialOpeningStock) {
      row.oldStock += STOCK_IN_MOVEMENT_TYPES.includes(movementType)
        ? qty
        : -qty;
      return;
    }

    if (movementDate > bounds.monthEnd) {
      return;
    }

    if (STOCK_IN_MOVEMENT_TYPES.includes(movementType)) {
      row.newStock += qty;
      return;
    }

    const dayIndex = movementDate.getDate() - 1;
    row.dailyUsage[dayIndex] += qty;
    row.totalUsed += qty;
  });

  return Array.from(productMap.values()).map((row) => ({
    ...row,
    oldStock: Math.max(row.oldStock, 0),
    balance: Math.max(row.oldStock, 0) + row.newStock - row.totalUsed,
  }));
};

export const fetchCurrentStockReport = async (filters = {}) => {
  const response = await api.get('/reports/rows', {
    params: { reportId: 'stock' }
  });
  return applyStockReportFilter((response.data.data ?? []).map(normalizeStockRow), filters);
};

export const fetchStockMovementReport = async (dateRange, filters = {}) => {
  const response = await api.get('/reports/rows', {
    params: { reportId: 'movement', dateRange, ...filters }
  });
  return (response.data.data ?? []).map(normalizeMovementRow);
};

export const fetchOutstandingLoanReport = async (dateRange, filters = {}) => {
  const response = await api.get('/reports/rows', {
    params: { reportId: 'loan', dateRange, ...filters }
  });
  return applyLoanReportFilter((response.data.data ?? []).map(normalizeLoanRow), filters);
};

export const fetchWorkerLoanHistoryReport = async (dateRange) => {
  const response = await api.get('/reports/rows', {
    params: { reportId: 'loan_history', dateRange }
  });
  return normalizeWorkerHistoryRows(response.data.data ?? []);
};

export const fetchMonthlyInventoryUsageReport = async ({ reportMonth } = {}) => {
  const bounds = getMonthBounds(reportMonth);
  const response = await api.get('/reports/rows', {
    params: { reportId: 'usage', reportMonth }
  });
  const { products, movements } = response.data.data;
  return normalizeMonthlyUsageRows({
    products: products ?? [],
    movements: movements ?? [],
    bounds,
  });
};

export const fetchReportRows = async ({
  reportId,
  dateRange,
  filters = {},
  reportMonth,
}) => {
  switch (reportId) {
    case 'movement':
      return fetchStockMovementReport(dateRange, filters);
    case 'loan':
      return fetchOutstandingLoanReport(dateRange, filters);
    case 'usage':
      return fetchMonthlyInventoryUsageReport({ reportMonth });
    case 'stock':
    default:
      return fetchCurrentStockReport(filters);
  }
};

export const fetchReportSummary = async () => {
  const response = await api.get('/reports/summary');
  return response.data.data;
};

