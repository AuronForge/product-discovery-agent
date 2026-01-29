import { Request, Response } from 'express';
import { ProductDiscoveryController } from './ProductDiscoveryController';
import { IProductDiscoveryService } from '../../domain/interfaces/IProductDiscoveryService';
import { ProductDiscoverySolution } from '../../domain/models/ProductDiscovery';
import { v4 as uuidv4 } from 'uuid';

describe('ProductDiscoveryController', () => {
  let controller: ProductDiscoveryController;
  let mockService: jest.Mocked<IProductDiscoveryService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockService = {
      executeDiscovery: jest.fn(),
      listDiscoveries: jest.fn(),
      getDiscoveryById: jest.fn()
    };

    controller = new ProductDiscoveryController(mockService);

    mockRequest = {
      body: {},
      query: {},
      params: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('executeDiscovery', () => {
    const mockSolution: ProductDiscoverySolution = {
      name: 'Test Solution',
      solution: 'Test solution description',
      epics: [
        {
          id: uuidv4(),
          name: 'Epic 1',
          description: 'Description 1',
          requirements: ['Req 1'],
          priority: 'P0 (Must)',
          type: 'Time de desenvolvimento'
        },
        {
          id: uuidv4(),
          name: 'Epic 2',
          description: 'Description 2',
          requirements: ['Req 2'],
          priority: 'P1 (Should)',
          type: 'Time de negócios'
        },
        {
          id: uuidv4(),
          name: 'Epic 3',
          description: 'Description 3',
          requirements: ['Req 3'],
          priority: 'P0 (Must)',
          type: 'Time de experiência do usuário'
        },
        {
          id: uuidv4(),
          name: 'Epic 4',
          description: 'Description 4',
          requirements: ['Req 4'],
          priority: 'P2 (Could)',
          type: 'Time de qualidade'
        },
        {
          id: uuidv4(),
          name: 'Epic 5',
          description: 'Description 5',
          requirements: ['Req 5'],
          priority: 'P1 (Should)',
          type: 'Time de desenvolvimento'
        }
      ]
    };

    it('should execute discovery and return 200 with solution', async () => {
      mockRequest.body = {
        problem: 'This is a valid problem description'
      };
      mockService.executeDiscovery.mockResolvedValue(mockSolution);

      await controller.executeDiscovery(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.executeDiscovery).toHaveBeenCalledWith({
        problem: 'This is a valid problem description'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSolution);
    });

    it('should throw validation error for invalid request', async () => {
      mockRequest.body = {
        problem: 'Short'
      };

      await expect(
        controller.executeDiscovery(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow();
    });

    it('should propagate service errors', async () => {
      mockRequest.body = {
        problem: 'Valid problem description for testing'
      };
      const error = new Error('Service error');
      mockService.executeDiscovery.mockRejectedValue(error);

      await expect(
        controller.executeDiscovery(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Service error');
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      controller.health(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'product-discovery-agent',
          timestamp: expect.any(String)
        })
      );
    });

    it('should return ISO timestamp', () => {
      controller.health(mockRequest as Request, mockResponse as Response);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = callArgs.timestamp;

      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('listDiscoveries', () => {
    const mockDiscoveries = {
      discoveries: [
        {
          id: 'uuid-1',
          name: 'E-Commerce Platform',
          solution: 'Complete platform...',
          problem: 'Need e-commerce...',
          language: 'en',
          epicCount: 10,
          createdAt: new Date('2026-01-28')
        },
        {
          id: 'uuid-2',
          name: 'CRM System',
          solution: 'Customer management...',
          problem: 'Need CRM...',
          language: 'pt',
          epicCount: 8,
          createdAt: new Date('2026-01-27')
        }
      ],
      total: 2,
      limit: 10,
      offset: 0
    };

    it('should return paginated list of discoveries with default params', async () => {
      mockRequest.query = {};
      mockService.listDiscoveries.mockResolvedValue(mockDiscoveries);

      await controller.listDiscoveries(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.listDiscoveries).toHaveBeenCalledWith(10, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDiscoveries);
    });

    it('should return paginated list with custom limit and offset', async () => {
      mockRequest.query = { limit: '5', offset: '10' };
      mockService.listDiscoveries.mockResolvedValue({
        ...mockDiscoveries,
        limit: 5,
        offset: 10
      });

      await controller.listDiscoveries(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.listDiscoveries).toHaveBeenCalledWith(5, 10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle invalid limit as default', async () => {
      mockRequest.query = { limit: 'invalid' };
      mockService.listDiscoveries.mockResolvedValue(mockDiscoveries);

      await controller.listDiscoveries(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.listDiscoveries).toHaveBeenCalledWith(10, 0);
    });

    it('should propagate service errors', async () => {
      mockRequest.query = {};
      const error = new Error('Database error');
      mockService.listDiscoveries.mockRejectedValue(error);

      await expect(
        controller.listDiscoveries(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Database error');
    });
  });

  describe('getDiscoveryById', () => {
    const mockDiscovery = {
      id: 'uuid-123',
      solution: {
        name: 'E-Commerce Platform',
        solution: 'Complete platform description...',
        epics: [
          {
            id: uuidv4(),
            name: 'Product Management',
            description: 'Manage products',
            requirements: ['CRUD', 'Search', 'Filters'],
            priority: 'P0',
            type: 'Time de desenvolvimento'
          }
        ]
      },
      problem: 'Need e-commerce platform',
      language: 'en',
      createdAt: new Date('2026-01-28')
    };

    it('should return discovery when found', async () => {
      mockRequest.params = { id: 'uuid-123' };
      mockService.getDiscoveryById.mockResolvedValue(mockDiscovery);

      await controller.getDiscoveryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getDiscoveryById).toHaveBeenCalledWith('uuid-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDiscovery);
    });

    it('should return 404 when discovery not found', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockService.getDiscoveryById.mockResolvedValue(null);

      await controller.getDiscoveryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getDiscoveryById).toHaveBeenCalledWith('non-existent');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Discovery not found',
        message: 'No discovery found with ID: non-existent'
      });
    });

    it('should propagate service errors', async () => {
      mockRequest.params = { id: 'uuid-123' };
      const error = new Error('Database connection failed');
      mockService.getDiscoveryById.mockRejectedValue(error);

      await expect(
        controller.getDiscoveryById(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Database connection failed');
    });
  });
});
