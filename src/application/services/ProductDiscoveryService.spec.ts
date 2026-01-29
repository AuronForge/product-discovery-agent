import { ProductDiscoveryService } from './ProductDiscoveryService';
import { IAIProvider } from '../../domain/interfaces/IAIProvider';
import { ILanguageDetector } from '../../domain/interfaces/ILanguageDetector';
import { IProductDiscoveryRepository } from '../../domain/repositories/IProductDiscoveryRepository';
import {
  ProductDiscoverySolution,
  ProductDiscoveryRequest
} from '../../domain/models/ProductDiscovery';
import { v4 as uuidv4 } from 'uuid';

describe('ProductDiscoveryService', () => {
  let service: ProductDiscoveryService;
  let mockAIProvider: jest.Mocked<IAIProvider>;
  let mockLanguageDetector: jest.Mocked<ILanguageDetector>;
  let mockRepository: jest.Mocked<IProductDiscoveryRepository>;

  beforeEach(() => {
    mockAIProvider = {
      generateDiscovery: jest.fn()
    };

    mockLanguageDetector = {
      detect: jest.fn()
    };

    mockRepository = {
      save: jest.fn().mockResolvedValue('mock-uuid-123'),
      findById: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      deleteById: jest.fn()
    };

    service = new ProductDiscoveryService(
      mockAIProvider,
      mockLanguageDetector,
      mockRepository
    );
  });

  describe('executeDiscovery', () => {
    const validRequest: ProductDiscoveryRequest = {
      problem: 'We need a system to manage customer relationships effectively'
    };

    const mockSolution: ProductDiscoverySolution = {
      name: 'CRM System',
      solution: 'A comprehensive customer relationship management system',
      epics: [
        {
          id: uuidv4(),
          name: 'User Management',
          description: 'Implement user management functionality',
          requirements: ['CRUD operations', 'Authentication', 'Authorization'],
          priority: 'P0 (Must)',
          type: 'Time de desenvolvimento'
        },
        {
          id: uuidv4(),
          name: 'Customer Database',
          description: 'Create customer database',
          requirements: [
            'Database schema',
            'CRUD operations',
            'Data validation'
          ],
          priority: 'P0 (Must)',
          type: 'Time de desenvolvimento'
        },
        {
          id: uuidv4(),
          name: 'Dashboard',
          description: 'Create dashboard for metrics',
          requirements: ['UI design', 'Charts', 'Real-time updates'],
          priority: 'P1 (Should)',
          type: 'Time de experiência do usuário'
        },
        {
          id: uuidv4(),
          name: 'Reporting',
          description: 'Generate reports',
          requirements: [
            'Report templates',
            'Export functionality',
            'Scheduling'
          ],
          priority: 'P1 (Should)',
          type: 'Time de negócios'
        },
        {
          id: uuidv4(),
          name: 'Testing Framework',
          description: 'Implement testing',
          requirements: ['Unit tests', 'Integration tests', 'E2E tests'],
          priority: 'P0 (Must)',
          type: 'Time de qualidade'
        }
      ]
    };

    it('should execute discovery successfully', async () => {
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(mockSolution);

      const result = await service.executeDiscovery(validRequest);

      expect(mockLanguageDetector.detect).toHaveBeenCalledWith(
        validRequest.problem
      );
      expect(mockAIProvider.generateDiscovery).toHaveBeenCalledWith(
        validRequest,
        'en'
      );
      expect(result).toEqual(mockSolution);
    });

    it('should detect Portuguese language', async () => {
      const portugueseRequest = {
        problem:
          'Precisamos de um sistema para gerenciar relacionamento com clientes'
      };
      mockLanguageDetector.detect.mockReturnValue('pt');
      mockAIProvider.generateDiscovery.mockResolvedValue(mockSolution);

      await service.executeDiscovery(portugueseRequest);

      expect(mockLanguageDetector.detect).toHaveBeenCalledWith(
        portugueseRequest.problem
      );
      expect(mockAIProvider.generateDiscovery).toHaveBeenCalledWith(
        portugueseRequest,
        'pt'
      );
    });

    it('should throw error for empty problem', async () => {
      const invalidRequest = { problem: '' };

      await expect(service.executeDiscovery(invalidRequest)).rejects.toThrow(
        'Problem description is required'
      );
    });

    it('should throw error for short problem description', async () => {
      const invalidRequest = { problem: 'Short' };

      await expect(service.executeDiscovery(invalidRequest)).rejects.toThrow(
        'Problem description is too short'
      );
    });

    it('should throw error for long problem description', async () => {
      const invalidRequest = { problem: 'a'.repeat(5001) };

      await expect(service.executeDiscovery(invalidRequest)).rejects.toThrow(
        'Problem description is too long'
      );
    });

    it('should throw error when solution name is missing', async () => {
      const invalidSolution = { ...mockSolution, name: '' };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'Solution name is required'
      );
    });

    it('should throw error when solution description is missing', async () => {
      const invalidSolution = { ...mockSolution, solution: '' };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'Solution description is required'
      );
    });

    it('should throw error when epics array is not present', async () => {
      const invalidSolution = { ...mockSolution, epics: null as any };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'Epics must be an array'
      );
    });

    it('should throw error when less than 5 epics', async () => {
      const invalidSolution = {
        ...mockSolution,
        epics: mockSolution.epics.slice(0, 3)
      };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'Minimum 5 epics required'
      );
    });

    it('should throw error when more than 15 epics', async () => {
      const manyEpics = Array(16).fill(mockSolution.epics[0]);
      const invalidSolution = {
        ...mockSolution,
        epics: manyEpics
      };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'Maximum 15 epics allowed'
      );
    });

    it('should throw error for epic with invalid priority', async () => {
      const invalidSolution = {
        ...mockSolution,
        epics: [
          ...mockSolution.epics.slice(0, 4),
          {
            ...mockSolution.epics[4],
            priority: 'Invalid Priority' as any
          }
        ]
      };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'has invalid priority'
      );
    });

    it('should throw error for epic with invalid type', async () => {
      const invalidSolution = {
        ...mockSolution,
        epics: [
          ...mockSolution.epics.slice(0, 4),
          {
            ...mockSolution.epics[4],
            type: 'Invalid Type' as any
          }
        ]
      };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'has invalid type'
      );
    });

    it('should throw error for epic without requirements', async () => {
      const invalidSolution = {
        ...mockSolution,
        epics: [
          ...mockSolution.epics.slice(0, 4),
          {
            ...mockSolution.epics[4],
            requirements: []
          }
        ]
      };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'must have at least one requirement'
      );
    });

    it('should throw error for epic with missing fields', async () => {
      const invalidSolution = {
        ...mockSolution,
        epics: [
          ...mockSolution.epics.slice(0, 4),
          {
            id: uuidv4(),
            name: '',
            description: '',
            requirements: ['test'],
            priority: 'P0 (Must)' as any,
            type: 'Time de qualidade' as any
          }
        ]
      };
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockResolvedValue(invalidSolution);

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'is missing required fields'
      );
    });

    it('should handle AI provider errors', async () => {
      mockLanguageDetector.detect.mockReturnValue('en');
      mockAIProvider.generateDiscovery.mockRejectedValue(
        new Error('AI provider error')
      );

      await expect(service.executeDiscovery(validRequest)).rejects.toThrow(
        'AI provider error'
      );
    });
  });

  describe('listDiscoveries', () => {
    const mockDiscoveryData = [
      {
        id: 'id-1',
        solution: {
          name: 'Product 1',
          solution: 'Solution 1',
          epics: [{} as any, {} as any, {} as any]
        },
        problem: 'Problem 1',
        language: 'en',
        createdAt: new Date('2026-01-01')
      },
      {
        id: 'id-2',
        solution: {
          name: 'Product 2',
          solution: 'Solution 2',
          epics: [{} as any, {} as any]
        },
        problem: 'Problem 2',
        language: 'pt',
        createdAt: new Date('2026-01-02')
      }
    ];

    it('should list discoveries with default pagination', async () => {
      mockRepository.findAll.mockResolvedValue(mockDiscoveryData);
      mockRepository.count.mockResolvedValue(2);

      const result = await service.listDiscoveries();

      expect(mockRepository.findAll).toHaveBeenCalledWith(10, 0);
      expect(mockRepository.count).toHaveBeenCalled();
      expect(result.discoveries).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should list discoveries with custom pagination', async () => {
      mockRepository.findAll.mockResolvedValue([mockDiscoveryData[0]]);
      mockRepository.count.mockResolvedValue(2);

      const result = await service.listDiscoveries(5, 1);

      expect(mockRepository.findAll).toHaveBeenCalledWith(5, 1);
      expect(result.discoveries).toHaveLength(1);
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(1);
    });

    it('should map discovery data correctly', async () => {
      mockRepository.findAll.mockResolvedValue([mockDiscoveryData[0]]);
      mockRepository.count.mockResolvedValue(1);

      const result = await service.listDiscoveries();

      expect(result.discoveries[0]).toEqual({
        id: 'id-1',
        name: 'Product 1',
        solution: 'Solution 1',
        problem: 'Problem 1',
        language: 'en',
        epicCount: 3,
        createdAt: new Date('2026-01-01')
      });
    });

    it('should return empty array when no discoveries found', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const result = await service.listDiscoveries();

      expect(result.discoveries).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getDiscoveryById', () => {
    const mockDiscovery = {
      id: 'test-id',
      solution: {
        name: 'Test Product',
        solution: 'Test Solution',
        epics: []
      },
      problem: 'Test Problem',
      language: 'en',
      createdAt: new Date('2026-01-01')
    };

    it('should return discovery when found', async () => {
      mockRepository.findById.mockResolvedValue(mockDiscovery);

      const result = await service.getDiscoveryById('test-id');

      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockDiscovery);
    });

    it('should return null when discovery not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getDiscoveryById('non-existent-id');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.getDiscoveryById('test-id')).rejects.toThrow(
        'Database error'
      );
    });
  });
});
