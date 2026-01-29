import { GitHubCopilotProvider } from '../GitHubCopilotProvider';
import type { ProductDiscoveryRequest } from '../../../domain/models/ProductDiscovery';

// Mock global fetch
global.fetch = jest.fn();

describe('GitHubCopilotProvider', () => {
  let provider: GitHubCopilotProvider;
  const mockInput: ProductDiscoveryRequest = {
    problem: 'Need to solve customer engagement'
  };

  beforeEach(() => {
    provider = new GitHubCopilotProvider();
    jest.clearAllMocks();
    // Clear environment variables
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_MODEL;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateDiscovery', () => {
    it('should return mock response when GITHUB_TOKEN is not configured', async () => {
      const result = await provider.generateDiscovery(mockInput, 'en');

      expect(result).toBeDefined();
      expect(result.solution).toContain('integrated solution');
      expect(result.epics).toHaveLength(10);
      expect(result.epics[0].name).toBe('Base Architecture Setup');
      expect(result.epics[0].requirements.length).toBeGreaterThan(0);
    });

    it('should use environment variables for API configuration', async () => {
      process.env.GITHUB_TOKEN = 'test-token-123';
      process.env.GITHUB_MODEL = 'gpt-4o-mini';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  name: 'Test Product',
                  solution: 'AI Generated Solution',
                  epics: [
                    {
                      id: 'epic-1',
                      name: 'Epic 1',
                      description: 'Description 1',
                      requirements: ['Requirement 1'],
                      priority: 'P0 (Must)',
                      type: 'Time de desenvolvimento'
                    }
                  ]
                })
              }
            }
          ]
        })
      });

      const result = await provider.generateDiscovery(mockInput, 'en');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://models.inference.ai.azure.com/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token-123'
          }),
          body: expect.stringContaining('gpt-4o-mini')
        })
      );

      expect(result.solution).toBe('AI Generated Solution');
      expect(result.epics).toHaveLength(1);
      expect(result.epics[0].name).toBe('Epic 1');
    });

    it('should use default model when GITHUB_MODEL is not set', async () => {
      process.env.GITHUB_TOKEN = 'test-token-123';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  name: 'Test',
                  solution: 'Default model response',
                  epics: []
                })
              }
            }
          ]
        })
      });

      await provider.generateDiscovery(mockInput, 'en');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('gpt-4o')
        })
      );
    });

    it('should construct proper prompt with language instructions', async () => {
      process.env.GITHUB_TOKEN = 'test-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  name: 'Test Product',
                  solution: 'Test',
                  epics: []
                })
              }
            }
          ]
        })
      });

      await provider.generateDiscovery(mockInput, 'en');

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body
      );
      const userMessage = callBody.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain(
        'Need to solve customer engagement'
      );
      expect(userMessage.content).toContain('ENGLISH');
    });

    it('should fallback to mock when API fetch fails', async () => {
      process.env.GITHUB_TOKEN = 'test-token';

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await provider.generateDiscovery(mockInput, 'en');

      expect(result).toBeDefined();
      expect(result.solution).toContain('integrated solution');
      expect(result.epics).toHaveLength(10);
    });

    it('should fallback to mock when API returns non-ok response', async () => {
      process.env.GITHUB_TOKEN = 'test-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await provider.generateDiscovery(mockInput, 'en');

      expect(result).toBeDefined();
      expect(result.solution).toContain('integrated solution');
      expect(result.epics).toHaveLength(10);
    });

    it('should throw error when API returns invalid JSON', async () => {
      process.env.GITHUB_TOKEN = 'test-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Invalid JSON content'
              }
            }
          ]
        })
      });

      await expect(provider.generateDiscovery(mockInput, 'en')).rejects.toThrow(
        'Failed to generate product discovery solution'
      );
    });

    it('should fallback to mock when API response has no choices', async () => {
      process.env.GITHUB_TOKEN = 'test-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await provider.generateDiscovery(mockInput, 'en');

      expect(result).toBeDefined();
      expect(result.solution).toContain('integrated solution');
      expect(result.epics).toHaveLength(10);
    });

    it('should generate valid mock response structure when no token', async () => {
      const result = await provider.generateDiscovery(mockInput, 'en');

      expect(result).toMatchObject({
        name: expect.any(String),
        solution: expect.any(String),
        epics: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            requirements: expect.any(Array),
            priority: expect.stringMatching(/^P[0-3] \(/),
            type: expect.any(String)
          })
        ])
      });
    });

    it('should log warning when using fallback response', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await provider.generateDiscovery(mockInput, 'en');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('GitHub token not configured')
      );

      consoleSpy.mockRestore();
    });
  });
});
