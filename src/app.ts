import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { DIContainer } from './config/DIContainer';
import { createProductDiscoveryRoutes } from './presentation/routes/productDiscoveryRoutes';
import { errorHandler } from './presentation/middlewares/errorHandler';
import { swaggerSpec } from './presentation/config/swagger';

/**
 * Create and configure Express application
 * @returns Configured Express app
 */
export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Swagger documentation
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Product Discovery Agent API'
    })
  );

  // Swagger JSON endpoint
  app.get('/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Get dependencies from DI container
  const container = DIContainer.getInstance();
  const productDiscoveryController = container.productDiscoveryController;

  // API routes
  app.use('/api', createProductDiscoveryRoutes(productDiscoveryController));

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'Product Discovery Agent API',
      version: '1.0.0',
      description:
        'A backend agent that performs macro-level product discovery using AI',
      endpoints: {
        documentation: '/docs',
        swagger: '/swagger.json',
        discovery: 'POST /api/discovery',
        health: 'GET /api/health'
      }
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      availableRoutes: {
        documentation: '/docs',
        discovery: 'POST /api/discovery',
        health: 'GET /api/health'
      }
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};
