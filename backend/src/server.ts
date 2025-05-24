import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { pageRoutes } from './routes/page.routes.js';
import { menuRoutes } from './routes/menu.routes.js';
import { roleRoutes } from './routes/role.routes.js';
import { securityRoutes } from './routes/security.routes.js';
import { swaggerDocs } from './utils/swagger.js';
import { seedDatabase } from './utils/seed.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use((req, res, next) => {
  res.setTimeout(25000, () => {
    logger.error('Request timeout', {
      path: req.path,
      method: req.method,
      body: req.body
    });
    res.status(408).json({ message: 'Request timeout' });
  }); 
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/security', securityRoutes);

// Health check endpoint - Move this BEFORE the 404 handler
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 404 handler - must be after all routes
app.use(notFoundHandler);


// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {    
    logger.info('Attempting to connect to MongoDB...');
    const uri = process.env.MONGO_URI as string;
    const options: ConnectOptions = {
      dbName: 'rbac',
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 25000, // 25 seconds
      connectTimeoutMS: 10000, // 10 seconds
      maxPoolSize: 10, // Limit connection pool
      minPoolSize: 5, // Maintain minimum connections
      maxIdleTimeMS: 60000, // Close idle connections after 1 minute
      heartbeatFrequencyMS: 10000, // Check connection health every 10 
    };
    
    logger.info(`Connection URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`); // Hide credentials in logs
    await mongoose.connect(uri, options);
    logger.info('Connected to MongoDB');

    // Seed database with initial data if needed
    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      name: (error as any)?.name
    });
    process.exit(1);
  }
};

startServer();

// Handle unexpected errors
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection', error);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  //process.exit(1);
});

export default app;