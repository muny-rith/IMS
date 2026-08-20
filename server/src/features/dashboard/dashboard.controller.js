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
    const productsRes = await pool.query('SELECT product_id, created_at, is_active FROM tb_product;');
    const products = productsRes.rows;

    // 2. Fetch stock balances
    const balancesRes = await pool.query(`
      SELECT 
        sb.stock_balance_id,
        sb.variant_id,
        sb.on_hand_qty,
        sb.reserved_qty,
        sb.updated_at,
        pv.sku,
        p.product_id,
        p.product_code,
        p.product_name,
        c.category_name
      FROM tb_stock_balance sb
      JOIN tb_product_variant pv ON sb.variant_id = pv.variant_id
      JOIN tb_product p ON pv.product_id = p.product_id
      LEFT JOIN tb_category c ON p.category_id = c.category_id;
    `);
    const balances = balancesRes.rows.map(row => {
      const onHandQty = Number(row.on_hand_qty || 0);
      const reservedQty = Number(row.reserved_qty || 0);
      return {
        id: row.stock_balance_id,
        productId: row.product_id,
        variantId: row.variant_id,
        productCode: row.product_code || row.sku || "",
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
      SELECT 
        l.loan_id,
        l.loan_code,
        l.loan_date,
        l.due_date,
        l.returned_at,
        l.loan_status,
        l.created_at,
        (
          SELECT w.worker_name 
          FROM tb_loan_worker lw 
          JOIN tb_worker w ON lw.worker_id = w.worker_id 
          WHERE lw.loan_id = l.loan_id 
          LIMIT 1
        ) AS worker_name,
        (
          SELECT w.worker_code 
          FROM tb_loan_worker lw 
          JOIN tb_worker w ON lw.worker_id = w.worker_id 
          WHERE lw.loan_id = l.loan_id 
          LIMIT 1
        ) AS worker_code
      FROM tb_loan l
      ORDER BY l.loan_id DESC;
    `);
    const loans = loansRes.rows;
    for (const loan of loans) {
      const itemsRes = await pool.query('SELECT loan_item_id, qty, returned_qty FROM tb_loan_item WHERE loan_id = $1;', [loan.loan_id]);
      loan.loan_items = itemsRes.rows;
    }

    // 4. Fetch workers
    const workersRes = await pool.query('SELECT worker_id FROM tb_worker;');
    const workers = workersRes.rows;

    // --- Compute Top Metrics ---
    const totalProductsCount = products.length;
    const totalWorkersCount = workers.length;

    const totalStockOnHand = balances.reduce((sum, b) => sum + b.onHandQty, 0);
    const lowStockThreshold = 10;
    const lowStockItems = balances.filter(b => b.onHandQty > 0 && b.onHandQty <= lowStockThreshold);
    const outOfStockItems = balances.filter(b => b.onHandQty === 0);

    const activeLoans = loans.filter(l => l.loan_status === 'OPEN' || l.loan_status === 'PARTIAL');
    const returnedLoans = loans.filter(l => l.loan_status === 'RETURNED');

    const totalActiveBorrowedUnits = activeLoans.reduce((sum, l) => {
      const items = l.loan_items || [];
      return sum + items.reduce((iSum, item) => iSum + (Number(item.qty || 0) - Number(item.returned_qty || 0)), 0);
    }, 0);

    const overdueLoans = activeLoans.filter(l => {
      if (!l.due_date) return false;
      const due = new Date(l.due_date);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });

    const dueSoonLoans = activeLoans.filter(l => {
      if (!l.due_date) return false;
      const due = new Date(l.due_date);
      due.setHours(0, 0, 0, 0);
      return due >= today && due <= nextSevenDays;
    });

    // 7-day Trend Data
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const chartData = days.map(d => {
      const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);

      const issued = loans
        .filter(l => {
          const lDate = new Date(l.loan_date || l.created_at);
          return lDate >= d && lDate < nextDay;
        })
        .reduce((sum, l) => {
          const items = l.loan_items || [];
          return sum + items.reduce((iSum, item) => iSum + Number(item.qty || 0), 0);
        }, 0);

      const returned = loans
        .filter(l => {
          if (!l.returned_at) return false;
          const rDate = new Date(l.returned_at);
          return rDate >= d && rDate < nextDay;
        })
        .reduce((sum, l) => {
          const items = l.loan_items || [];
          return sum + items.reduce((iSum, item) => iSum + Number(item.returned_qty || 0), 0);
        }, 0);

      return { day: dayStr, issued, returned };
    });

    // Structure response
    const dashboardResponse = {
      hero: {
        title: "Inventory & Tool Operations",
        eyebrow: "Operations Dashboard",
        description: "Live operational view of asset checkouts, inventory balances, and return compliance.",
        pulseLabel: "System Status",
        pulseValue: overdueLoans.length > 0 ? `${overdueLoans.length} Overdue` : "All Healthy",
        pulseDetail: `${activeLoans.length} active loans covering ${totalActiveBorrowedUnits} items on loan.`,
        metaLabel: "Updated Just Now"
      },
      stats: [
        {
          id: "stock-on-hand",
          title: "Total Stock On Hand",
          value: `${totalStockOnHand} units`,
          meta: `${totalProductsCount} unique products registered`
        },
        {
          id: "active-loans",
          title: "Active Equipment Loans",
          value: `${activeLoans.length} loans`,
          meta: `${totalActiveBorrowedUnits} total items out in field`
        },
        {
          id: "overdue-loans",
          title: "Overdue Returns",
          value: `${overdueLoans.length} loans`,
          meta: "Requires prompt return follow-up"
        },
        {
          id: "low-stock-alert",
          title: "Low Stock Alerts",
          value: `${lowStockItems.length + outOfStockItems.length} SKUs`,
          meta: `${outOfStockItems.length} items completely depleted`
        }
      ],
      alerts: [
        ...overdueLoans.map(l => ({
          id: `alert-overdue-${l.loan_id}`,
          title: `Overdue Loan: ${l.loan_code}`,
          detail: `Issued to ${l.worker_name || 'Worker'} (Due: ${new Date(l.due_date).toLocaleDateString()})`,
          tone: "danger"
        })),
        ...lowStockItems.map(b => ({
          id: `alert-low-${b.id}`,
          title: `Low Stock: ${b.productName}`,
          detail: `Only ${b.onHandQty} units remaining on hand (${b.category})`,
          tone: "warning"
        }))
      ],
      quickActions: [
        { id: "action-new-loan", label: "Issue New Loan", path: "/loans" },
        { id: "action-stock-adj", label: "Adjust Inventory", path: "/stocks" },
        { id: "action-add-product", label: "Add New Product", path: "/products" }
      ],
      chartData
    };

    res.status(200).json({
      status: "success",
      data: dashboardResponse
    });
  } catch (err) {
    next(err);
  }
};
