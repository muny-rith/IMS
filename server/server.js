import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { initDB } from './src/config/db.js';
import { errorMiddleware } from './src/middleware/error.middleware.js';
import ApiError from './src/shared/errors/ApiError.js';

// Route imports
import authRoutes from './src/features/auth/auth.routes.js';
import categoryRoutes from './src/features/categories/category.routes.js';
import brandRoutes from './src/features/brands/brand.routes.js';
import productRoutes from './src/features/products/product.routes.js';
import workerRoutes from './src/features/workers/worker.routes.js';
import loanRoutes from './src/features/loans/loan.routes.js';
import stockRoutes from './src/features/stocks/stock.routes.js';
import dashboardRoutes from './src/features/dashboard/dashboard.routes.js';
import reportRoutes from './src/features/reports/report.routes.js';
import webhookRoutes from './src/features/webhooks/webhook.routes.js';
import attributeRoutes from './src/features/attributes/attribute.routes.js';
import purchaseRequestRoutes from './src/features/purchase_requests/purchase_request.routes.js';
import stockIssueRoutes from './src/features/stock_issues/stock_issue.routes.js';
import saleRoutes from './src/features/sales/sale.routes.js';
import diagnosticsRoutes from './src/features/diagnostics/diagnostics.routes.js';
import { apiRateLimiter } from './src/middleware/rateLimit.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Allowed frontend origins for cross-origin credentials / cookies
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3002',
  process.env.CLIENT_URL,
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com') || origin.endsWith('.anajak.cloud')) {
      return callback(null, true);
    }
    return callback(null, true); // Dev flexibility
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Global API Rate Limiter
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Mounting routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/stock-issues', stockIssueRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);


// Fallback for unhandled routes
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl} on this server.`));
});

// Error handling middleware
app.use(errorMiddleware);

// Initialize DB and start server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`IMS backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start the backend server due to DB initialization failure:', err);
    process.exit(1);
  }
};

startServer();
