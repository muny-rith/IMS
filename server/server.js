import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { initDB } from './src/config/db.js';
import { errorMiddleware } from './src/middleware/error.middleware.js';
import ApiError from './src/shared/errors/ApiError.js';

// Route imports
import authRoutes from './src/features/auth/auth.routes.js';
import categoryRoutes from './src/features/categories/category.routes.js';
import productRoutes from './src/features/products/product.routes.js';
import workerRoutes from './src/features/workers/worker.routes.js';
import loanRoutes from './src/features/loans/loan.routes.js';
import stockRoutes from './src/features/stocks/stock.routes.js';
import dashboardRoutes from './src/features/dashboard/dashboard.routes.js';
import reportRoutes from './src/features/reports/report.routes.js';
import webhookRoutes from './src/features/webhooks/webhook.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Mounting routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/webhooks', webhookRoutes);

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
