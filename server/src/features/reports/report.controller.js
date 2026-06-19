import pool from '../../config/db.js';

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

const getMonthBounds = (reportMonth) => {
  const toMonthValue = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  const getPreviousMonthValue = () => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    return toMonthValue(date);
  };

  const parseReportMonth = (val) => {
    const [year, month] = String(val || getPreviousMonthValue())
      .split('-')
      .map(Number);
    if (!year || !month || month < 1 || month > 12) {
      return parseReportMonth(getPreviousMonthValue());
    }
    return new Date(year, month - 1, 1);
  };

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
  };
};

export const getReportSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [balancesRes, loansRes, movementsRes] = await Promise.all([
      pool.query('SELECT on_hand_qty, reserved_qty FROM stock_balances;'),
      pool.query("SELECT loan_id FROM loans WHERE loan_status NOT IN ('RETURNED', 'CANCELLED');"),
      pool.query('SELECT movement_id FROM stock_movements WHERE created_at >= $1;', [today.toISOString()])
    ]);

    const balances = balancesRes.rows;
    const openLoans = loansRes.rows;
    const movementsToday = movementsRes.rows;

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

    res.status(200).json({
      status: 'success',
      data: [
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
      ]
    });
  } catch (err) {
    next(err);
  }
};

export const getReportRows = async (req, res, next) => {
  try {
    const { reportId, dateRange, reportMonth } = req.query;

    if (reportId === 'movement') {
      const { from, to } = getDateRangeBounds(dateRange);
      let queryStr = `
        SELECT 
          sm.movement_id,
          sm.product_id,
          sm.movement_type,
          sm.qty,
          sm.notes,
          sm.created_at,
          json_build_object(
            'product_id', p.product_id,
            'product_code', p.product_code,
            'product_name', p.product_name,
            'unit_price', p.unit_price,
            'image_url', p.image_url,
            'department', p.department
          ) AS products
        FROM stock_movements sm
        LEFT JOIN products p ON sm.product_id = p.product_id
        WHERE sm.created_at >= $1 AND sm.created_at <= $2
      `;
      const params = [from, to];

      if (req.query.movementType && req.query.movementType !== 'ALL') {
        queryStr += ` AND sm.movement_type = $3`;
        params.push(req.query.movementType);
      }

      queryStr += ` ORDER BY sm.created_at DESC LIMIT 100;`;
      const { rows } = await pool.query(queryStr, params);
      return res.status(200).json({ status: 'success', data: rows });
    }

    if (reportId === 'loan') {
      const { from, to } = getDateRangeBounds(dateRange);
      const queryStr = `
        SELECT 
          l.loan_id,
          l.loan_code,
          l.worker_id,
          l.loan_date,
          l.due_date,
          l.loan_status,
          json_build_object(
            'worker_id', w.worker_id,
            'worker_code', w.worker_code,
            'worker_name', w.worker_name
          ) AS workers,
          COALESCE(
            (
              SELECT json_agg(json_build_object(
                'loan_item_id', li.loan_item_id,
                'qty', li.qty,
                'returned_qty', li.returned_qty
              ))
              FROM loan_items li
              WHERE li.loan_id = l.loan_id
            ),
            '[]'::json
          ) AS loan_items
        FROM loans l
        LEFT JOIN workers w ON l.worker_id = w.worker_id
        WHERE l.loan_date >= $1 AND l.loan_date <= $2
          AND l.loan_status NOT IN ('RETURNED', 'CANCELLED')
        ORDER BY l.due_date ASC;
      `;
      // Slice ISO dates to YYYY-MM-DD for date comparison
      const { rows } = await pool.query(queryStr, [from.slice(0, 10), to.slice(0, 10)]);
      return res.status(200).json({ status: 'success', data: rows });
    }

    if (reportId === 'usage') {
      const bounds = getMonthBounds(reportMonth);
      const USAGE_MOVEMENT_TYPES = ['OPENING', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'];

      const productsQuery = `
        SELECT 
          p.product_id,
          p.product_code,
          p.product_name,
          p.image_url,
          p.created_at,
          json_build_object(
            'category_id', c.category_id,
            'category_name', c.category_name
          ) AS categories
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.created_at <= $1
        ORDER BY p.product_name ASC;
      `;

      const movementsQuery = `
        SELECT 
          movement_id,
          product_id,
          movement_type,
          qty,
          created_at
        FROM stock_movements
        WHERE movement_type = ANY($1) AND created_at <= $2
        ORDER BY created_at ASC;
      `;

      const [productsRes, movementsRes] = await Promise.all([
        pool.query(productsQuery, [bounds.monthEnd.toISOString()]),
        pool.query(movementsQuery, [USAGE_MOVEMENT_TYPES, bounds.monthEnd.toISOString()])
      ]);

      return res.status(200).json({
        status: 'success',
        data: {
          products: productsRes.rows,
          movements: movementsRes.rows
        }
      });
    }

    // Default or 'stock'
    const queryStr = `
      SELECT 
        sb.stock_balance_id,
        sb.product_id,
        sb.on_hand_qty,
        sb.reserved_qty,
        sb.updated_at,
        json_build_object(
          'product_id', p.product_id,
          'product_code', p.product_code,
          'product_name', p.product_name,
          'categories', json_build_object(
            'category_id', c.category_id,
            'category_name', c.category_name
          )
        ) AS products
      FROM stock_balances sb
      LEFT JOIN products p ON sb.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY sb.updated_at DESC;
    `;
    const { rows } = await pool.query(queryStr);
    return res.status(200).json({ status: 'success', data: rows });
  } catch (err) {
    next(err);
  }
};
