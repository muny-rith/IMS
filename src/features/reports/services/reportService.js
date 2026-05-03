import supabase from '../../../lib/supabaseClient';

const asObject = (value) => (Array.isArray(value) ? value[0] : value);

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

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

const normalizeStockRow = (row) => {
  const product = asObject(row.products);
  const category = asObject(product?.categories);
  const onHandQty = Number(row.on_hand_qty ?? 0);
  const reservedQty = Number(row.reserved_qty ?? 0);
  const availableQty = onHandQty - reservedQty;

  return {
    id: product?.product_code || `STK-${row.stock_balance_id}`,
    name: product?.product_name || 'Unnamed product',
    category: category?.category_name || '—',
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

  return {
    id: `MV-${row.movement_id}`,
    name: product?.product_name || 'Unnamed product',
    category: formatMovementType(movementType),
    owner: movementType.includes('LOAN') ? 'Loan' : 'Stock',
    metric: `${Number(row.qty ?? 0)} units`,
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
    owner: worker?.worker_code || '—',
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
      category: worker?.department || '—',
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

export const fetchCurrentStockReport = async () => {
  const { data, error } = await supabase
    .from('stock_balances')
    .select(`
      stock_balance_id,
      product_id,
      on_hand_qty,
      reserved_qty,
      updated_at,
      products (
        product_id,
        product_code,
        product_name,
        categories (
          category_id,
          category_name
        )
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeStockRow);
};

export const fetchStockMovementReport = async (dateRange) => {
  const { from, to } = getDateRangeBounds(dateRange);

  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      movement_id,
      product_id,
      movement_type,
      qty,
      notes,
      created_at,
      products (
        product_id,
        product_code,
        product_name
      )
    `)
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeMovementRow);
};

export const fetchOutstandingLoanReport = async (dateRange) => {
  const { from, to } = getDateRangeBounds(dateRange);

  const { data, error } = await supabase
    .from('loans')
    .select(`
      loan_id,
      loan_code,
      worker_id,
      loan_date,
      due_date,
      loan_status,
      workers (
        worker_id,
        worker_code,
        worker_name
      ),
      loan_items (
        loan_item_id,
        qty,
        returned_qty
      )
    `)
    .gte('loan_date', from.slice(0, 10))
    .lte('loan_date', to.slice(0, 10))
    .neq('loan_status', 'RETURNED')
    .neq('loan_status', 'CANCELLED')
    .order('due_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeLoanRow);
};

export const fetchWorkerLoanHistoryReport = async (dateRange) => {
  const { from, to } = getDateRangeBounds(dateRange);

  const { data, error } = await supabase
    .from('loans')
    .select(`
      loan_id,
      worker_id,
      loan_date,
      loan_status,
      workers (
        worker_id,
        worker_code,
        worker_name,
        position_title,
        department
      ),
      loan_items (
        loan_item_id,
        qty,
        returned_qty
      )
    `)
    .gte('loan_date', from.slice(0, 10))
    .lte('loan_date', to.slice(0, 10))
    .order('loan_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return normalizeWorkerHistoryRows(data ?? []);
};

export const fetchReportRows = async ({ reportId, dateRange }) => {
  switch (reportId) {
    case 'movement':
      return fetchStockMovementReport(dateRange);
    case 'loan':
      return fetchOutstandingLoanReport(dateRange);
    case 'worker':
      return fetchWorkerLoanHistoryReport(dateRange);
    case 'stock':
    default:
      return fetchCurrentStockReport();
  }
};

export const fetchReportSummary = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [balancesResult, loansResult, movementsResult] = await Promise.all([
    supabase
      .from('stock_balances')
      .select('on_hand_qty, reserved_qty'),
    supabase
      .from('loans')
      .select('loan_id, loan_status')
      .neq('loan_status', 'RETURNED')
      .neq('loan_status', 'CANCELLED'),
    supabase
      .from('stock_movements')
      .select('movement_id')
      .gte('created_at', today.toISOString()),
  ]);

  if (balancesResult.error) throw new Error(balancesResult.error.message);
  if (loansResult.error) throw new Error(loansResult.error.message);
  if (movementsResult.error) throw new Error(movementsResult.error.message);

  const balances = balancesResult.data ?? [];
  const openLoans = loansResult.data ?? [];
  const movementsToday = movementsResult.data ?? [];

  const availableUnits = balances.reduce((sum, row) => {
    const onHandQty = Number(row.on_hand_qty ?? 0);
    const reservedQty = Number(row.reserved_qty ?? 0);
    return sum + Math.max(onHandQty - reservedQty, 0);
  }, 0);

  const lowStockCount = balances.filter((row) => {
    const onHandQty = Number(row.on_hand_qty ?? 0);
    const reservedQty = Number(row.reserved_qty ?? 0);
    const availableQty = onHandQty - reservedQty;
    return availableQty > 0 && availableQty <= 10;
  }).length;

  const outOfStockCount = balances.filter((row) => {
    const onHandQty = Number(row.on_hand_qty ?? 0);
    const reservedQty = Number(row.reserved_qty ?? 0);
    return onHandQty - reservedQty <= 0;
  }).length;

  return [
    {
      label: 'Available Units',
      value: availableUnits.toLocaleString('en-US'),
      detail: `${balances.length} stocked products`,
    },
    {
      label: 'Low Stock Items',
      value: lowStockCount.toLocaleString('en-US'),
      detail: `${outOfStockCount} out of stock`,
    },
    {
      label: 'Open Loans',
      value: openLoans.length.toLocaleString('en-US'),
      detail: 'Need follow-up',
    },
    {
      label: 'Movements Today',
      value: movementsToday.length.toLocaleString('en-US'),
      detail: 'Recorded today',
    },
  ];
};
