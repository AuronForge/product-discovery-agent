import dotenv from 'dotenv';
import { printAgentBanner } from 'agent-banner-library';
import { createApp } from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
const startServer = () => {
  const app = createApp();

  app.listen(PORT, () => {
    printAgentBanner({
      agentName: 'Product Discovery Agent API',
      baseUrl: `http://localhost:${PORT}`,
      prefix: '/',
      docsPath: '/docs',
      healthPath: '/api/v1/health',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/discovery',
          description: 'Run product discovery'
        },
        {
          method: 'GET',
          path: '/api/v1/discoveries',
          description: 'List discoveries'
        },
        {
          method: 'GET',
          path: '/api/v1/discoveries/:id',
          description: 'Get discovery by id'
        }
      ]
    });
  });
};

// Handle uncaught errors
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
startServer();
