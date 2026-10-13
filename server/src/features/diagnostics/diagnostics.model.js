import pool from '../../config/db.js';
import serverCache from '../../shared/cache/memoryCache.js';
import { getRateLimitStats } from '../../middleware/rateLimit.middleware.js';

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

export const getSystemDiagnostics = async () => {
  // 1. Database latency ping & pool metrics
  const dbStart = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;
  let dbError = null;
  let tableCounts = {};

  try {
    const pingRes = await pool.query('SELECT NOW() as current_time;');
    dbLatencyMs = Date.now() - dbStart;

    const countQueries = await Promise.allSettled([
      pool.query('SELECT COUNT(*)::int as count FROM tb_product;'),
      pool.query('SELECT COUNT(*)::int as count FROM tb_product_variant;'),
      pool.query('SELECT COUNT(*)::int as count FROM tb_category;'),
      pool.query('SELECT COUNT(*)::int as count FROM tb_brand;'),
      pool.query('SELECT COUNT(*)::int as count FROM tb_stock_movement;'),
    ]);

    tableCounts = {
      products: countQueries[0].status === 'fulfilled' ? countQueries[0].value.rows[0].count : 0,
      variants: countQueries[1].status === 'fulfilled' ? countQueries[1].value.rows[0].count : 0,
      categories: countQueries[2].status === 'fulfilled' ? countQueries[2].value.rows[2]?.count ?? countQueries[2].value.rows[0].count : 0,
      brands: countQueries[3].status === 'fulfilled' ? countQueries[3].value.rows[0].count : 0,
      movements: countQueries[4].status === 'fulfilled' ? countQueries[4].value.rows[0].count : 0,
    };
  } catch (err) {
    dbStatus = 'degraded';
    dbLatencyMs = Date.now() - dbStart;
    dbError = err.message;
  }

  // 2. Memory & Process telemetry
  const memory = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  // 3. Cache telemetry
  const cacheStats = serverCache.stats();

  // 4. Rate limiter telemetry
  const rateLimitStats = getRateLimitStats();

  return {
    status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      error: dbError,
      pool: {
        totalClients: pool.totalCount ?? 0,
        idleClients: pool.idleCount ?? 0,
        waitingClients: pool.waitingCount ?? 0,
      },
      counts: tableCounts,
    },
    cache: {
      cachedKeys: cacheStats.size,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hitRate,
    },
    rateLimiting: {
      activeTrackedIps: rateLimitStats.activeTrackedClients,
    },
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV || 'development',
      uptime: formatUptime(uptimeSeconds),
      uptimeSeconds: Math.floor(uptimeSeconds),
      memory: {
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    },
  };
};
