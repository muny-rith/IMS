import pool from '../../config/db.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);

    // 7 days ago start
    const trendStart = new Date();
    trendStart.setDate(today.getDate() - 6);
    trendStart.setHours(0, 0, 0, 0);

    // 1. Fetch total products
    const productsRes = await pool.query('SELECT product_id, created_at, is_active FROM products;');
    const products = productsRes.rows;

    // 2. Fetch stock balances
    const balancesRes = await pool.query(`
      SELECT sb.*, p.product_code, p.product_name, c.category_name
      FROM stock_balances sb
      LEFT JOIN products p ON sb.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id;
    `);
    const balances = balancesRes.rows.map(row => {
      const onHandQty = Number(row.on_hand_qty || 0);
      const reservedQty = Number(row.reserved_qty || 0);
      return {
        id: row.stock_balance_id,
        productId: row.product_id,
        productCode: row.product_code || "",
        productName: row.product_name || "Unnamed product",
        category: row.category_name || "-",
        onHandQty,
        reservedQty,
        availableQty: onHandQty - reservedQty,
        updatedAt: row.updated_at
      };
    });

    // 3. Fetch loans and items
    const loansRes = await pool.query(`
      SELECT l.*, w.worker_code, w.worker_name
      FROM loans l
      LEFT JOIN workers w ON l.worker_id = w.worker_id
      ORDER BY l.loan_id DESC;
    `);
    const loans = loansRes.rows;
    for (const loan of loans) {
      const itemsRes = await pool.query('SELECT loan_item_id, qty, returned_qty FROM loan_items WHERE loan_id = $1;', [loan.loan_id]);
      loan.loan_items = itemsRes.rows;
    }

    // 4. Fetch workers
    const workersRes = await pool.query('SELECT worker_id FROM workers;');
    const workers = workersRes.rows;

    // 5. Fetch recent movements (7 days)
    const movementsRes = await pool.query(`
      SELECT movement_id, movement_type, qty, created_at 
      FROM stock_movements 
      WHERE created_at >= $1;
    `, [trendStart.toISOString()]);
    const movements = movementsRes.rows;

    // 6. Fetch purchase requests
    const prRes = await pool.query('SELECT purchase_request_id, request_status, requested_date FROM purchase_requests;');
    const purchaseRequests = prRes.rows;

    // Calculate metrics
    const lowStockCount = balances.filter(item => item.availableQty > 0 && item.availableQty <= 10).length;
    const outOfStockCount = balances.filter(item => item.availableQty <= 0).length;

    // Open loan helpers
    const getOutstandingQty = (loan) =>
      (loan.loan_items || []).reduce((sum, item) => sum + Math.max(Number(item.qty || 0) - Number(item.returned_qty || 0), 0), 0);

    const isOpenLoan = (loan) => {
      if (['RETURNED', 'CANCELLED'].includes(loan.loan_status)) return false;
      return getOutstandingQty(loan) > 0;
    };

    const isOverdueLoan = (loan) => {
      const dueDate = loan.due_date ? new Date(loan.due_date) : null;
      return isOpenLoan(loan) && dueDate && dueDate < today;
    };

    const isDueSoonLoan = (loan) => {
      const dueDate = loan.due_date ? new Date(loan.due_date) : null;
      return isOpenLoan(loan) && dueDate && dueDate >= today && dueDate <= nextSevenDays;
    };

    const openLoanRows = loans.filter(isOpenLoan);
    const activeLoans = openLoanRows.length;
    const overdueLoans = loans.filter(isOverdueLoan).length;
    const dueSoonLoans = loans.filter(isDueSoonLoan).length;
    const workersBorrowing = new Set(openLoanRows.map(loan => loan.worker_id)).size;

    // Stock movement directions
    const STOCK_IN_TYPES = new Set(["OPENING", "ADJUSTMENT_IN", "LOAN_RETURN", "RETURN", "STOCK_IN"]);
    const STOCK_OUT_TYPES = new Set(["ADJUSTMENT_OUT", "LOAN_OUT", "SALE", "SALE_OUT", "STOCK_ISSUE", "STOCK_ISSUE_OUT", "ISSUE"]);

    const getDirection = (type) => {
      if (STOCK_IN_TYPES.has(type) || type.endsWith('_IN') || type.includes('RETURN')) return 'in';
      if (STOCK_OUT_TYPES.has(type) || type.endsWith('_OUT') || type.includes('ISSUE') || type.includes('SALE')) return 'out';
      return null;
    };

    // getLastSevenDays
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const key = date.toISOString().slice(0, 10);
      const label = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
      return { key, label, stockIn: 0, stockOut: 0 };
    });

    const dayMap = new Map(days.map(d => [d.key, d]));
    movements.forEach(movement => {
      const dateKey = new Date(movement.created_at).toISOString().slice(0, 10);
      const day = dayMap.get(dateKey);
      if (day) {
        const qty = Number(movement.qty || 0);
        const dir = getDirection(movement.movement_type);
        if (dir === 'in') day.stockIn += qty;
        else if (dir === 'out') day.stockOut += qty;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
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
        chartData: days.map(({ label, stockIn, stockOut }) => ({ label, stockIn, stockOut }))
      }
    });
  } catch (err) {
    next(err);
  }
};
