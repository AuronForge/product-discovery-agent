# Contributing to Product Discovery Agent

Thank you for your interest in contributing to the Product Discovery Agent! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## 📜 Code of Conduct

This project follows a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to edu.temarques@gmail.com.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git
- A GitHub account

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/product-discovery-agent.git
cd product-discovery-agent
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/AuronForge/product-discovery-agent.git
```

4. Install dependencies:

```bash
npm install
```

5. Create a `.env` file based on `.env.example`

### Branches

- `main` - Production-ready code
- `develop` - Development branch (base your work on this)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test improvements

## 💻 Development Process

### 1. Create a Branch

Always create a new branch from `develop`:

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

Run the full test suite before committing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Format code
npm run format
```

### 4. Commit Your Changes

Use commitizen for consistent commits:

```bash
npm run commit
```

Or use conventional commits format:

```bash
git commit -m "feat: add new feature description"
```

## 📝 Coding Standards

### TypeScript Guidelines

- Use TypeScript strict mode
- Avoid `any` types when possible
- Define proper interfaces and types
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)

### Architecture Principles

- Follow **Clean Architecture** principles
- Maintain separation of concerns
- Use **SOLID** principles
- Apply appropriate design patterns
- Keep dependencies pointing inward (domain should not depend on infrastructure)

### Code Style

This project uses:

- **ESLint** for linting
- **Prettier** for code formatting

Code style is automatically enforced through git hooks. Format your code before committing:

```bash
npm run format
```

### Best Practices

1. **Functions**: Keep functions pure when possible
2. **Classes**: Prefer composition over inheritance
3. **Naming**: Use descriptive names (no abbreviations unless widely known)
4. **Comments**: Write self-documenting code; use comments for complex logic only
5. **Error Handling**: Use custom error classes and proper error messages
6. **Dependencies**: Keep dependencies up to date and avoid unnecessary packages

## 📦 Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Other changes (maintenance tasks)
- `revert`: Revert a previous commit

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example**:

```
feat(api): add endpoint to list discoveries

Implements pagination and filtering for the discoveries endpoint.
Includes unit and integration tests.

Closes #123
```

### Using Commitizen

The easiest way to create proper commits:

```bash
npm run commit
```

This will guide you through creating a conventional commit.

## 🧪 Testing Requirements

### Coverage Requirements

All contributions must maintain or improve test coverage:

- **Branches**: 90% minimum
- **Functions**: 90% minimum
- **Lines**: 90% minimum
- **Statements**: 90% minimum

### Writing Tests

1. **Location**: Place tests next to the code they test (e.g., `Service.spec.ts` next to `Service.ts`)
2. **Naming**: Use descriptive test names that explain what is being tested
3. **Structure**: Follow AAA pattern (Arrange, Act, Assert)
4. **Isolation**: Tests should not depend on each other
5. **Mocking**: Use Jest mocks for external dependencies

### Test Example

```typescript
describe('ProductDiscoveryService', () => {
  let service: ProductDiscoveryService;
  let mockProvider: jest.Mocked<IAIProvider>;
  let mockRepository: jest.Mocked<IProductDiscoveryRepository>;

  beforeEach(() => {
    // Arrange
    mockProvider = {
      generateDiscovery: jest.fn()
    };
    mockRepository = {
      save: jest.fn()
    };
    service = new ProductDiscoveryService(mockProvider, mockRepository);
  });

  describe('executeDiscovery', () => {
    it('should generate and save discovery successfully', async () => {
      // Arrange
      const problem = 'Test problem';
      const mockSolution = {
        /* ... */
      };
      mockProvider.generateDiscovery.mockResolvedValue(mockSolution);
      mockRepository.save.mockResolvedValue('discovery-id');

      // Act
      const result = await service.executeDiscovery(problem);

      // Assert
      expect(result).toEqual(mockSolution);
      expect(mockProvider.generateDiscovery).toHaveBeenCalledWith(
        problem,
        'en'
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update from upstream**:

```bash
git checkout develop
git pull upstream develop
git checkout your-branch
git rebase develop
```

2. **Run all checks**:

```bash
npm run lint
npm run format:check
npm run test:coverage
npm run build
```

3. **Ensure git hooks pass**: Make a test commit to verify hooks work

### Submitting a Pull Request

1. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

2. Go to the repository on GitHub and create a Pull Request

3. Fill out the PR template with:
   - **Description**: Clear description of changes
   - **Type**: Feature, fix, docs, etc.
   - **Related Issues**: Link to related issues
   - **Screenshots**: If applicable (UI changes)
   - **Testing**: How you tested the changes
   - **Checklist**: Complete all items

### PR Requirements

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Coverage thresholds met (90%+)
- [ ] All git hooks pass
- [ ] Conventional commits used

### Review Process

1. At least one maintainer must review and approve
2. All automated checks must pass (tests, linting, etc.)
3. Address review feedback promptly
4. Once approved, a maintainer will merge your PR

### After Merging

1. Delete your feature branch:

```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

2. Update your local develop:

```bash
git checkout develop
git pull upstream develop
```

## 📁 Project Structure

Understanding the project structure helps you know where to place your code:

```
src/
├── domain/                    # Business logic and entities
│   ├── interfaces/           # Contracts and abstractions
│   ├── models/               # Domain entities
│   └── repositories/         # Repository interfaces
├── application/              # Application services
│   └── services/             # Use cases and business rules
├── infrastructure/           # External concerns
│   ├── ai/                   # AI provider implementations
│   ├── database/             # Database and repositories
│   └── language/             # Language detection
├── presentation/             # HTTP layer
│   ├── controllers/          # Request handlers
│   ├── routes/               # Route definitions
│   ├── middlewares/          # Express middlewares
│   ├── validators/           # Input validation
│   └── errors/               # Error definitions
├── config/                   # Configuration
└── app.ts                    # Application setup
```

### Where to Add New Code

- **New endpoint**: Add route in `presentation/routes/`, controller in `presentation/controllers/`
- **Business logic**: Add service in `application/services/`
- **Data access**: Add repository in `infrastructure/database/`
- **External integration**: Add in `infrastructure/`
- **Domain model**: Add in `domain/models/`
- **Validation**: Add in `presentation/validators/`

## 🐛 Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Verify you're using the latest version
- Try to reproduce the bug in isolation

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., Windows 11]
- Node.js version: [e.g., 20.10.0]
- npm version: [e.g., 10.2.3]

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context, screenshots, or examples.
```

## 📞 Getting Help

If you need help:

- **Documentation**: Check the [README.md](README.md) and [docs/](docs/) folder
- **Issues**: Search existing issues or create a new one
- **Email**: Contact edu.temarques@gmail.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

## 🙏 Thank You!

Your contributions make this project better. Thank you for taking the time to contribute!

---

**Built with ❤️ by the community**
