import { Request, Response } from 'express';
import { IProductDiscoveryService } from '../../domain/interfaces/IProductDiscoveryService';
import { ProductDiscoveryRequestSchema } from '../validators/ProductDiscoveryValidator';

/**
 * Product Discovery Controller
 * Handles HTTP requests and responses
 * Follows Controller pattern from Clean Architecture
 */
export class ProductDiscoveryController {
  constructor(private readonly productDiscoveryService: IProductDiscoveryService) {}

  /**
   * Handle POST /discovery request
   * @param req - Express request
   * @param res - Express response
   */
  async executeDiscovery(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedRequest = ProductDiscoveryRequestSchema.parse(req.body);

      // Execute discovery service
      const solution = await this.productDiscoveryService.executeDiscovery(validatedRequest);

      // Return JSON response
      res.status(200).json(solution);
    } catch (error) {
      // Error is handled by global error handler middleware
      throw error;
    }
  }

  /**
   * Handle GET /health request
   * @param _req - Express request
   * @param res - Express response
   */
  health(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'product-discovery-agent'
    });
  }

  /**
   * Handle GET /discoveries request
   * @param req - Express request
   * @param res - Express response
   */
  async listDiscoveries(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this.productDiscoveryService.listDiscoveries(limit, offset);

      res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle GET /discoveries/:id request
   * @param req - Express request
   * @param res - Express response
   */
  async getDiscoveryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const discovery = await this.productDiscoveryService.getDiscoveryById(id);

      if (!discovery) {
        res.status(404).json({
          error: 'Discovery not found',
          message: `No discovery found with ID: ${id}`
        });
        return;
      }

      res.status(200).json(discovery);
    } catch (error) {
      throw error;
    }
  }
}
