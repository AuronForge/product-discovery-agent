# Product Discovery Agent

A backend agent in Node.js that performs macro-level product discovery using AI (GitHub Copilot). This agent receives a problem description and returns a structured solution with prioritized epics following product management best practices.

## 🎯 Features

- **REST API**: Clean RESTful endpoints for product discovery and history
- **Language Detection**: Automatically detects input language and responds accordingly
- **AI-Powered**: Uses GitHub Models API (free!) for intelligent discovery
- **Persistent Storage**: SQLite database for discovery history
- **Structured Output**: Returns JSON with solution and 7-12 macro-level epics
- **MoSCoW Prioritization**: Epics prioritized using Product Management best practices
- **Clean Architecture**: SOLID principles, separation of concerns, testable code
- **Repository Pattern**: Clean data access layer with SQLite
- **Comprehensive Testing**: 90%+ test coverage with Jest
- **API Documentation**: Swagger/OpenAPI with interactive UI
- **Input Validation**: Zod-based schema validation
- **Error Handling**: Consistent, user-friendly error responses

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Contracts](#api-contracts)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Controllers, Routes, Middlewares)         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Application Layer                  │
│         (Services, Use Cases)               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            Domain Layer                     │
│    (Entities, Interfaces, Business Logic)   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Infrastructure Layer                 │
│  (AI Provider, Language Detection, External)│
└─────────────────────────────────────────────┘
```

### Key Design Patterns

- **Dependency Injection**: Centralized DI container
- **Repository Pattern**: Abstract data access
- **Strategy Pattern**: Interchangeable AI providers
- **Factory Pattern**: Object creation
- **Singleton Pattern**: DI container
- **Facade Pattern**: Simplified interfaces

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3+
- **Framework**: Express 4.18
- **Database**: SQLite (better-sqlite3)
- **Validation**: Zod 3.22
- **Testing**: Jest 29.7
- **Documentation**: Swagger/OpenAPI 3.0
- **AI Provider**: GitHub Models API (gpt-4o) - Free!
- **Language Detection**: franc 6.2
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky, lint-staged
- **Commit Standards**: Commitlint, Commitizen
- **Versioning**: standard-version

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd product-discovery-agent
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development

# GitHub Models Configuration (Free! Recommended)
GITHUB_TOKEN=your_github_token_here
GITHUB_MODEL=gpt-4o
```

**Get your free GitHub Token**: Visit [GitHub Models](https://github.com/marketplace/models) and generate a token.

### Running the Application

#### Development Mode (with hot reload)

```bash
npm run dev
```

#### Build and Run Production

```bash
npm run build
npm start
```

The server will start at `http://localhost:3000`

### Verify Installation

```bash
# Health check
curl http://localhost:3000/api/health

# API documentation
open http://localhost:3000/docs
```

## 📡 API Contracts

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### 1. Execute Product Discovery

**Endpoint**: `POST /api/discovery`

**Description**: Analyzes a problem and returns a structured product discovery solution

**Request Body**:

```json
{
  "problem": "string (10-5000 characters)"
}
```

**Example Request** (English):

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "We need a system to manage customer relationships and track sales opportunities effectively"
  }'
```

**Example Request** (Portuguese):

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Precisamos de um sistema para gerenciar relacionamentos com clientes e acompanhar oportunidades de vendas de forma eficaz"
  }'
```

**Response** (200 OK):

```json
{
  "name": "Customer Relationship Management System",
  "solution": "A comprehensive CRM system that streamlines customer interactions, tracks sales opportunities, and provides actionable insights through advanced analytics.",
  "epics": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "User Authentication and Authorization",
      "description": "Implement secure authentication with MFA and role-based access control to ensure system security and compliance.",
      "requirements": [
        "Multi-factor authentication (MFA)",
        "Role-based access control (RBAC)",
        "Session management with JWT",
        "GDPR compliance for personal data",
        "Audit logging for security events"
      ],
      "priority": "P0 (Must)",
      "type": "Time de desenvolvimento"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Customer Data Management",
      "description": "Enable comprehensive customer data management with CRUD operations and data validation.",
      "requirements": [
        "CRUD operations for customer records",
        "Data validation and sanitization",
        "Search and filter capabilities",
        "Data import/export functionality",
        "GDPR compliance: right to be forgotten"
      ],
      "priority": "P0 (Must)",
      "type": "Time de desenvolvimento"
    }
    // ... 5-13 more epics
  ]
}
```

**Error Responses**:

- `400 Bad Request`: Validation error
- `422 Unprocessable Entity`: Business logic error
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: AI provider unavailable

#### 2. List All Discoveries

**Endpoint**: `GET /api/discoveries`

**Description**: Returns a paginated list of all product discoveries

**Query Parameters**:

- `limit` (optional): Maximum number of records (default: 10, max: 100)
- `offset` (optional): Number of records to skip (default: 0)

**Example Request**:

```bash
curl -X GET "http://localhost:3000/api/discoveries?limit=10&offset=0"
```

**Response** (200 OK):

```json
{
  "discoveries": [
    {
      "id": "7684dd52-8b58-4399-9be3-ebb3bcdcaf7c",
      "name": "E-Commerce Platform",
      "solution": "Complete platform with product management, cart, payments...",
      "problem": "Need to create a complete e-commerce platform...",
      "language": "pt",
      "epicCount": 10,
      "createdAt": "2026-01-28T18:10:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### 3. Get Discovery by ID

**Endpoint**: `GET /api/discoveries/:id`

**Description**: Returns a specific discovery with all details

**Example Request**:

```bash
curl -X GET "http://localhost:3000/api/discoveries/7684dd52-8b58-4399-9be3-ebb3bcdcaf7c"
```

**Response** (200 OK):

```json
{
  "id": "7684dd52-8b58-4399-9be3-ebb3bcdcaf7c",
  "solution": {
    "name": "E-Commerce Platform",
    "solution": "Complete platform description...",
    "epics": [
      {
        "id": "uuid",
        "name": "Product Management",
        "description": "...",
        "requirements": [...],
        "priority": "P0",
        "type": "Time de desenvolvimento"
      }
    ]
  },
  "problem": "Need to create a complete e-commerce platform...",
  "language": "pt",
  "createdAt": "2026-01-28T18:10:00.000Z"
}
```

**Error Response** (404 Not Found):

```json
{
  "error": "Discovery not found",
  "message": "No discovery found with ID: ..."
}
```

#### 4. Health Check

**Endpoint**: `GET /api/health`

**Response** (200 OK):

```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "service": "product-discovery-agent"
}
```

### Output Structure Details

#### Priority Levels (MoSCoW)

- **P0 (Must)**: Critical, must be delivered
- **P1 (Should)**: Important, should be included if possible
- **P2 (Could)**: Nice to have, could be included
- **P3 (Won't now)**: Will not be included in this iteration

#### Epic Types (Team Assignment)

- **Time de negócios**: Business team epics
- **Time de desenvolvimento**: Development team epics
- **Time de experiência do usuário**: UX team epics
- **Time de qualidade**: Quality/QA team epics

## 📁 Project Structure

```
product-discovery-agent/
├── docs/                                    # Documentation files
│   ├── ARCHITECTURE.md                      # Architecture details
│   ├── QUICKSTART.md                        # Quick start guide
│   ├── EXAMPLES.md                          # API examples
│   ├── SUMMARY.md                           # Implementation summary
│   └── PROJECT_INDEX.md                     # Complete file index
├── prompt/                                  # AI prompt templates
│   └── product-discovery-prompt.txt         # Main discovery prompt
├── src/
│   ├── domain/                              # Domain layer (business logic)
│   │   ├── interfaces/                      # Interface definitions
│   │   │   ├── IAIProvider.ts
│   │   │   ├── ILanguageDetector.ts
│   │   │   └── IProductDiscoveryService.ts
│   │   └── models/                          # Domain models
│   │       └── ProductDiscovery.ts
│   │
│   ├── application/                         # Application layer (use cases)
│   │   └── services/
│   │       ├── ProductDiscoveryService.ts
│   │       └── ProductDiscoveryService.spec.ts
│   │
│   ├── infrastructure/                      # Infrastructure layer (external)
│   │   ├── ai/
│   │   │   └── GitHubCopilotProvider.ts
│   │   └── language/
│   │       ├── LanguageDetector.ts
│   │       └── LanguageDetector.spec.ts
│   │
│   ├── presentation/                        # Presentation layer (API)
│   │   ├── controllers/
│   │   │   ├── ProductDiscoveryController.ts
│   │   │   └── ProductDiscoveryController.spec.ts
│   │   ├── routes/
│   │   │   └── productDiscoveryRoutes.ts
│   │   ├── middlewares/
│   │   │   └── errorHandler.ts
│   │   ├── validators/
│   │   │   ├── ProductDiscoveryValidator.ts
│   │   │   └── ProductDiscoveryValidator.spec.ts
│   │   ├── errors/
│   │   │   └── CustomErrors.ts
│   │   └── config/
│   │       └── swagger.ts
│   │
│   ├── config/                              # Configuration
│   │   └── DIContainer.ts
│   │
│   ├── app.ts                               # Express app setup
│   └── index.ts                             # Entry point
│
├── coverage/                                # Test coverage reports
├── dist/                                    # Compiled JavaScript
├── product-discovery-agent.postman_collection.json  # Postman collection
├── .env.example                             # Environment variables template
├── .eslintrc.json                           # ESLint configuration
├── .gitignore
├── jest.config.js                           # Jest configuration
├── package.json
├── tsconfig.json                            # TypeScript configuration
└── README.md
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Coverage Requirements

Minimum coverage thresholds (configured in `jest.config.js`):

- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%

### Test Structure

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **Coverage Reports**: HTML reports in `coverage/` directory

## 💻 Development

### Code Quality Tools

#### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

#### Formatting

```bash
# Format code with Prettier
npm run format

# Check formatting without modifying files
npm run format:check
```

#### Git Hooks (Husky)

The project uses Husky to ensure code quality before commits:

- **Pre-commit**: Runs lint-staged (ESLint + Prettier on staged files) and tests with coverage
- **Commit-msg**: Validates commit message format using Commitlint

#### Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Use commitizen for guided commits
npm run commit
```

**Commit Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (maintenance, etc.)

**Examples**:

```bash
feat: add user authentication endpoint
fix: resolve database connection timeout
docs: update API documentation
```

### Versioning and Changelog

The project uses `standard-version` for automated versioning and changelog generation:

```bash
# Generate a new version (automatically detects version bump)
npm run release

# Generate a specific version type
npm run release:patch  # 1.0.0 → 1.0.1
npm run release:minor  # 1.0.0 → 1.1.0
npm run release:major  # 1.0.0 → 2.0.0
```

This will:

1. Bump version in `package.json`
2. Generate/update `CHANGELOG.md`
3. Create a git commit
4. Create a git tag

### Example Test

```typescript
describe('ProductDiscoveryService', () => {
  it('should execute discovery successfully', async () => {
    const result = await service.executeDiscovery(validRequest);
    expect(result.epics).toHaveLength(10);
  });
});
```

## 💻 Development

### Code Style

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

### Adding New Features

1. **Domain Layer**: Define interfaces and models
2. **Infrastructure Layer**: Implement external integrations
3. **Application Layer**: Create service logic
4. **Presentation Layer**: Add controllers and routes
5. **Tests**: Write comprehensive unit tests
6. **Documentation**: Update Swagger annotations

### Debugging

```typescript
// Enable debug logging
console.log('Debug info:', variable);
```

## 🚢 Production Deployment

### Environment Variables

```env
PORT=3000
NODE_ENV=development

# Azure OpenAI / GitHub Copilot Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t product-discovery-agent .
docker run -p 3000:3000 product-discovery-agent
```

### Health Checks

Configure health check endpoint in your orchestration tool:

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
  interval: 30s
  timeout: 10s
  retries: 3
```

## 📚 Additional Resources

- **API Documentation**: `http://localhost:3000/docs`
- **Swagger JSON**: `http://localhost:3000/swagger.json`
- **Postman Collection**: `./product-discovery-agent.postman_collection.json`
- **Architecture Details**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Quick Start Guide**: [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **API Examples**: [docs/EXAMPLES.md](docs/EXAMPLES.md)
- **Project Index**: [docs/PROJECT_INDEX.md](docs/PROJECT_INDEX.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes using commitizen: `npm run commit`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Contribution Guidelines

- Follow Clean Architecture principles
- Maintain 90%+ test coverage
- Update documentation
- Follow TypeScript best practices
- Use conventional commits (use `npm run commit`)
- Ensure all git hooks pass (linting, formatting, tests)
- Run `npm run format` before committing

## 📝 License

Apache License 2.0 - see LICENSE file for details

## 🔧 Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@azure/openai'`

**Solution**: Run `npm install`

---

**Issue**: Tests failing with coverage below 90%

**Solution**: Add more test cases to increase coverage

---

**Issue**: Port 3000 already in use

**Solution**: Change PORT in `.env` file or kill the process using port 3000

---

**Issue**: Language detection not working

**Solution**: Ensure input text is at least 10 characters long

## 📞 Support

For questions or issues:

- Create an issue in the repository

## 👨‍💻 Author

**José Eduardo Trindade E Marques**

- Company: AuronForge 🚀
- Email: edu.temarques@gmail.com
- LinkedIn: [linkedin.com/in/edu-marques29](https://linkedin.com/in/edu-marques29)

---

**Built with ❤️ using Clean Architecture and SOLID principles**
