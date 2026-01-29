import { Router } from 'express';
import { ProductDiscoveryController } from '../controllers/ProductDiscoveryController';

/**
 * Configure and return routes for Product Discovery API
 * @param controller - Product Discovery Controller instance
 * @returns Configured Express Router
 */
export const createProductDiscoveryRoutes = (controller: ProductDiscoveryController): Router => {
  const router = Router();

  /**
   * @swagger
   * /api/discovery:
   *   post:
   *     summary: Execute product discovery
   *     description: Analyzes a problem description and returns a comprehensive product discovery solution with epics
   *     tags:
   *       - Product Discovery
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - problem
   *             properties:
   *               problem:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 5000
   *                 description: Description of the problem, need, or opportunity (in any language)
   *                 example: "We need a system to manage customer relationships and track sales opportunities effectively"
   *     responses:
   *       200:
   *         description: Product discovery solution generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ProductDiscoverySolution'
   *       400:
   *         description: Invalid request (validation error)
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       422:
   *         description: Business logic error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       503:
   *         description: AI provider unavailable
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post('/discovery', (req, res, next) => {
    controller.executeDiscovery(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/discoveries:
   *   get:
   *     summary: List all discoveries
   *     description: Returns a paginated list of all product discoveries
   *     tags:
   *       - Product Discovery
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           minimum: 1
   *           maximum: 100
   *         description: Maximum number of discoveries to return
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *           minimum: 0
   *         description: Number of discoveries to skip
   *     responses:
   *       200:
   *         description: List of discoveries retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 discoveries:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                       name:
   *                         type: string
   *                       solution:
   *                         type: string
   *                       problem:
   *                         type: string
   *                       language:
   *                         type: string
   *                       epicCount:
   *                         type: integer
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                 total:
   *                   type: integer
   *                 limit:
   *                   type: integer
   *                 offset:
   *                   type: integer
   */
  router.get('/discoveries', (req, res, next) => {
    controller.listDiscoveries(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/discoveries/{id}:
   *   get:
   *     summary: Get discovery by ID
   *     description: Returns a specific product discovery with all details
   *     tags:
   *       - Product Discovery
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The discovery ID
   *     responses:
   *       200:
   *         description: Discovery retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   format: uuid
   *                 solution:
   *                   $ref: '#/components/schemas/ProductDiscoverySolution'
   *                 problem:
   *                   type: string
   *                 language:
   *                   type: string
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *       404:
   *         description: Discovery not found
   */
  router.get('/discoveries/:id', (req, res, next) => {
    controller.getDiscoveryById(req, res).catch(next);
  });

  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Health check endpoint
   *     description: Returns the health status of the service
   *     tags:
   *       - Health
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: healthy
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 service:
   *                   type: string
   *                   example: product-discovery-agent
   */
  router.get('/health', (req, res) => {
    controller.health(req, res);
  });

  return router;
};
