# Architecture Documentation

## Overview

This Product Discovery Agent follows **Clean Architecture** principles, ensuring:
- **Separation of Concerns**: Each layer has a single, well-defined responsibility
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Testability**: Each component can be tested in isolation
- **Maintainability**: Changes in one layer don't affect others
- **Flexibility**: Easy to swap implementations (e.g., different AI providers)

## Layers

### 1. Domain Layer (`src/domain/`)

**Responsibility**: Core business logic and rules

**Components**:
- **Models** (`models/`): Pure data structures representing business entities
  - `ProductDiscovery.ts`: Epic, Priority, EpicType, ProductDiscoverySolution
- **Interfaces** (`interfaces/`): Contracts that other layers must implement
  - `IAIProvider.ts`: AI provider contract
  - `ILanguageDetector.ts`: Language detection contract
  - `IProductDiscoveryService.ts`: Service contract
- **Repositories** (`repositories/`): Data persistence contracts
  - `IProductDiscoveryRepository.ts`: Repository interface for data access

**Key Principles**:
- No dependencies on other layers
- Framework-agnostic
- Contains only business logic
- Defines interfaces, not implementations

### 2. Application Layer (`src/application/`)

**Responsibility**: Application-specific business rules and use cases

**Components**:
- **Services** (`services/`): Orchestrate domain logic and coordinate between layers
  - `ProductDiscoveryService.ts`: Main service implementing discovery workflow

**Key Principles**:
- Depends only on Domain layer
- Implements business workflows
- Coordinates between domain and infrastructure
- No knowledge of HTTP, databases, or external services

### 3. Infrastructure Layer (`src/infrastructure/`)

**Responsibility**: External integrations and technical implementations

**Components**:
- **AI** (`ai/`): AI provider implementations
  - `GitHubCopilotProvider.ts`: GitHub Models API integration (gpt-4o)
- **Language** (`language/`): Language detection implementations
  - `LanguageDetector.ts`: franc-based language detection
- **Database** (`database/`): Data persistence implementations
  - `DatabaseSchema.ts`: SQLite schema and migrations
  - `ProductDiscoveryRepository.ts`: Repository implementation with SQLite

**Key Principles**:
- Implements Domain interfaces
- Handles external communications
- Contains technical details
- Can be easily swapped with alternative implementations

### 4. Presentation Layer (`src/presentation/`)

**Responsibility**: HTTP interface and request/response handling

**Components**:
- **Controllers** (`controllers/`): Handle HTTP requests
  - `ProductDiscoveryController.ts`: REST endpoints
- **Routes** (`routes/`): Define API routes
  - `productDiscoveryRoutes.ts`: Express routes
- **Validators** (`validators/`): Input validation
  - `ProductDiscoveryValidator.ts`: Zod schemas
- **Middlewares** (`middlewares/`): Request processing
  - `errorHandler.ts`: Global error handling
- **Config** (`config/`): Presentation configuration
  - `swagger.ts`: OpenAPI documentation

**Key Principles**:
- Depends on Application layer
- Handles HTTP concerns
- Validates inputs
- Formats responses
- No business logic

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    HTTP Request                      │
│              POST /api/discovery                     │
│         { "problem": "description..." }              │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│                                                      │
│  1. Route receives request                          │
│  2. Controller validates input (Zod)                │
│  3. Controller calls Application Service            │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Application Layer                       │
│                                                      │
│  1. ProductDiscoveryService.executeDiscovery()      │
│  2. Validate problem description                    │
│  3. Call LanguageDetector (Infrastructure)          │
│  4. Call AIProvider (Infrastructure)                │
│  5. Validate solution output                        │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│           Infrastructure Layer                       │
│                                                      │
│  1. LanguageDetector detects language (franc)       │
│  2. GitHubCopilotProvider builds prompt             │
│  3. GitHubCopilotProvider calls AI API              │
│  4. GitHubCopilotProvider parses response           │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                Domain Layer                          │
│                                                      │
│  Business rules applied:                            │
│  - 5-15 epics required                              │
│  - Valid MoSCoW priorities                          │
│  - Valid epic types                                 │
│  - Requirements not empty                           │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                HTTP Response                         │
│                                                      │
│  200 OK: ProductDiscoverySolution JSON              │
│  400: Validation error                              │
│  422: Business logic error                          │
│  500: Internal error                                │
└─────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Dependency Injection (DI)

**Location**: `src/config/DIContainer.ts`

**Purpose**: Centralize object creation and manage dependencies

**Example**:
```typescript
const aiProvider = new GitHubCopilotProvider();
const languageDetector = new LanguageDetector();
const service = new ProductDiscoveryService(aiProvider, languageDetector);
const controller = new ProductDiscoveryController(service);
```

**Benefits**:
- Loose coupling
- Easy testing (mock dependencies)
- Single source of truth for dependencies

### 2. Repository Pattern

**Implementation**: Through interfaces (`IAIProvider`, `ILanguageDetector`)

**Purpose**: Abstract data access and external services

**Benefits**:
- Easy to swap implementations
- Testable (use mocks)
- Consistent interface

### 3. Strategy Pattern

**Implementation**: `IAIProvider` interface with multiple possible implementations

**Purpose**: Interchangeable algorithms/implementations

**Example**:
- `GitHubCopilotProvider` (current)
- `OpenAIProvider` (future)
- `AnthropicProvider` (future)

### 4. Facade Pattern

**Implementation**: `ProductDiscoveryService` simplifies complex workflow

**Purpose**: Provide simple interface to complex subsystem

**Benefits**:
- Hide complexity
- Easy to use
- Single entry point

### 5. Singleton Pattern

**Implementation**: `DIContainer.getInstance()`

**Purpose**: Ensure single instance of DI container

## SOLID Principles

### Single Responsibility Principle (SRP)

Each class/module has one reason to change:
- `LanguageDetector`: Only language detection
- `GitHubCopilotProvider`: Only AI interaction
- `ProductDiscoveryService`: Only discovery orchestration
- `ProductDiscoveryController`: Only HTTP handling

### Open/Closed Principle (OCP)

Open for extension, closed for modification:
- Add new AI providers by implementing `IAIProvider`
- Add new language detectors by implementing `ILanguageDetector`
- No need to modify existing code

### Liskov Substitution Principle (LSP)

Subtypes are substitutable for base types:
- Any `IAIProvider` implementation can replace another
- Any `ILanguageDetector` implementation can replace another

### Interface Segregation Principle (ISP)

Clients shouldn't depend on interfaces they don't use:
- `IAIProvider`: Only AI-related methods
- `ILanguageDetector`: Only language detection methods
- Small, focused interfaces

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:
- `ProductDiscoveryService` depends on `IAIProvider` interface, not `GitHubCopilotProvider` class
- Application layer knows nothing about infrastructure implementations

## Testing Strategy

### Unit Tests

**Coverage**: 90%+ required

**Structure**:
```
Component.spec.ts (next to Component.ts)
```

**Mocking**:
- Mock all dependencies
- Test in isolation
- Use Jest mocks

**Example**:
```typescript
const mockAIProvider = { generateDiscovery: jest.fn() };
const service = new ProductDiscoveryService(mockAIProvider, mockLanguageDetector);
```

### Integration Tests

**Scope**: Test component interactions

**Example**: Test entire request flow through multiple layers

## Error Handling

### Custom Error Types

1. **ValidationError**: Input validation failures
2. **AIProviderError**: AI service issues
3. **BusinessError**: Business rule violations

### Error Flow

```
Error occurs → Custom error thrown → Global error handler → HTTP response
```

### HTTP Status Codes

- `200`: Success
- `400`: Validation error (client fault)
- `422`: Business logic error (client fault)
- `500`: Internal error (server fault)
- `503`: External service unavailable

## Scalability Considerations

### Current Design Supports

1. **Horizontal Scaling**: Stateless API can run multiple instances
2. **Caching**: Can add Redis for caching AI responses
3. **Queue System**: Can add message queue for async processing
4. **Rate Limiting**: Can add rate limiting per client
5. **Load Balancing**: Multiple instances behind load balancer

### Future Enhancements

1. **Database**: Add persistence layer for solutions
2. **Authentication**: Add JWT-based auth
3. **Versioning**: API versioning support
4. **Monitoring**: Add APM (Application Performance Monitoring)
5. **Circuit Breaker**: Protect against external service failures

## Security Considerations

1. **Input Validation**: Zod schemas prevent injection
2. **Error Messages**: Don't leak sensitive information
3. **CORS**: Configurable CORS policies
4. **Rate Limiting**: Prevent abuse (to be implemented)
5. **API Keys**: Authentication (to be implemented)

## Performance Optimizations

1. **Async/Await**: Non-blocking I/O
2. **Streaming**: For large responses (future)
3. **Compression**: Response compression (future)
4. **Caching**: Cache AI responses (future)
5. **Connection Pooling**: Reuse connections (future)
