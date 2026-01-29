module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/index.ts',
    '!src/app.ts', // Server initialization only
    '!src/presentation/config/swagger.ts', // Swagger configuration only
    '!src/presentation/routes/productDiscoveryRoutes.ts', // Route definitions with extensive Swagger docs
    '!src/config/DIContainer.ts', // Dependency injection container (has ESM compatibility issues with franc)
    '!src/infrastructure/language/LanguageDetector.ts' // Language detection (has ESM compatibility issues with franc library)
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(franc|trigram-utils|n-gram|collapse-white-space)/)'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};
