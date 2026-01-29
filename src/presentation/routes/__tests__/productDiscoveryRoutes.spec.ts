import { createProductDiscoveryRoutes } from '../productDiscoveryRoutes';
import { ProductDiscoveryController } from '../../controllers/ProductDiscoveryController';

// Mock controller
const mockController = {
  executeDiscovery: jest.fn(),
  listDiscoveries: jest.fn(),
  getDiscoveryById: jest.fn(),
  health: jest.fn()
} as unknown as ProductDiscoveryController;

describe('productDiscoveryRoutes', () => {
  describe('createProductDiscoveryRoutes', () => {
    it('should return an Express Router instance', () => {
      const router = createProductDiscoveryRoutes(mockController);

      expect(router).toBeDefined();
      expect(typeof router).toBe('function'); // Express Router is a function
      expect(router.stack).toBeDefined(); // Routers have a stack property
    });

    it('should register POST /discovery route', () => {
      const router = createProductDiscoveryRoutes(mockController);
      const routes = (router as any).stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          method: Object.keys(layer.route.methods)[0]
        }));

      const discoveryRoute = routes.find((r: any) => r.path === '/discovery');
      expect(discoveryRoute).toBeDefined();
      expect(discoveryRoute.method).toBe('post');
    });

    it('should register GET /discoveries route', () => {
      const router = createProductDiscoveryRoutes(mockController);
      const routes = (router as any).stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          method: Object.keys(layer.route.methods)[0]
        }));

      const listRoute = routes.find((r: any) => r.path === '/discoveries');
      expect(listRoute).toBeDefined();
      expect(listRoute.method).toBe('get');
    });

    it('should register GET /discoveries/:id route', () => {
      const router = createProductDiscoveryRoutes(mockController);
      const routes = (router as any).stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          method: Object.keys(layer.route.methods)[0]
        }));

      const getByIdRoute = routes.find(
        (r: any) => r.path === '/discoveries/:id'
      );
      expect(getByIdRoute).toBeDefined();
      expect(getByIdRoute.method).toBe('get');
    });

    it('should register GET /health route', () => {
      const router = createProductDiscoveryRoutes(mockController);
      const routes = (router as any).stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          method: Object.keys(layer.route.methods)[0]
        }));

      const healthRoute = routes.find((r: any) => r.path === '/health');
      expect(healthRoute).toBeDefined();
      expect(healthRoute.method).toBe('get');
    });

    it('should configure all 4 routes', () => {
      const router = createProductDiscoveryRoutes(mockController);
      const routes = (router as any).stack.filter((layer: any) => layer.route);

      expect(routes).toHaveLength(4);
    });

    it('should accept ProductDiscoveryController as parameter', () => {
      expect(() => {
        createProductDiscoveryRoutes(mockController);
      }).not.toThrow();
    });
  });
});
