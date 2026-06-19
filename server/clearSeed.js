import { query } from './src/config/db.js';

async function clear() {
  const codes = ['VORTEX-PRO-HP', 'QUANTUM-MECH-KB', 'AEROLIGHT-RUN-SH', 'URBAN-EXP-BP', 'LUXE-MIN-LW', 'NORDIC-CER-CS', 'ACTIVECHARGE-PB', 'PERF-ATH-ZH'];
  await query('DELETE FROM stock_movements WHERE product_id IN (SELECT product_id FROM products WHERE product_code = ANY($1))', [codes]);
  await query('DELETE FROM stock_balances WHERE product_id IN (SELECT product_id FROM products WHERE product_code = ANY($1))', [codes]);
  await query('DELETE FROM products WHERE product_code = ANY($1)', [codes]);
  await query(`DELETE FROM categories WHERE category_name IN ('Electronics', 'Apparel', 'Accessories', 'Home')`);
  console.log('IMS seed data cleared');
}

clear().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
