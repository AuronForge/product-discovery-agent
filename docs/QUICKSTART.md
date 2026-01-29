# Quick Start Guide

## Installation

```bash
npm install
```

## Run Tests

```bash
npm test
npm run test:coverage
```

## Build

```bash
npm run build
```

## Start Development Server

```bash
npm run dev
```

## Start Production Server

```bash
npm start
```

## Access Documentation

After starting the server:
- API Documentation: http://localhost:3000/docs
- Health Check: http://localhost:3000/api/health
- Root Endpoint: http://localhost:3000/

## Test the API

### Using curl (English)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "We need a system to manage customer relationships and track sales opportunities effectively"}'
```

### Using curl (Portuguese)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "Precisamos de um sistema para gerenciar relacionamentos com clientes de forma eficaz"}'
```

### Using Postman

1. Import the collection from `./postman/product-discovery-agent.postman_collection.json`
2. Run any of the sample requests

## Project Status

✅ Complete implementation with:
- Clean Architecture
- SOLID principles
- TypeScript
- Express REST API
- Input validation (Zod)
- Error handling
- Swagger documentation
- Unit tests (42 passing tests)
- Postman collection
- Comprehensive README

## Notes

- The AI Provider currently returns mock data for development/testing
- To use actual GitHub Copilot/Azure OpenAI, configure environment variables and implement the API call in `GitHubCopilotProvider.ts`
- All source code follows English naming conventions
- API responses match the input language automatically
