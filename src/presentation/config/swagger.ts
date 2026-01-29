import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI configuration
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Discovery Agent API',
      version: '1.0.0',
      description: `
# Product Discovery Agent

A backend agent that performs macro-level product discovery using AI (GitHub Copilot).

## Features

- 🎯 Analyzes problem descriptions and generates solution proposals
- 🔄 Automatic language detection (matches input language)
- 📋 Generates 7-12 macro-level epics with MoSCoW prioritization
- 🏗️ Clean Architecture with SOLID principles
- ✅ Comprehensive input validation
- 📊 Structured JSON output

## Usage

1. Send a POST request to \`/api/discovery\` with a problem description
2. The agent detects the language automatically
3. Receives a structured solution with epics in the same language

## Output Structure

The API returns a JSON with:
- **name**: Solution name
- **solution**: Detailed solution description
- **epics**: Array of 7-12 epics with:
  - UUID v4 identifier
  - Name and description
  - Requirements (business, functional, non-functional)
  - MoSCoW priority (P0-P3)
  - Team type assignment

## Prioritization

Epics are prioritized using:
- **MoSCoW**: Must, Should, Could, Won't now (P0-P3)
- **RICE**: Reach, Impact, Confidence, Effort (mental model)
- **User Journey Mapping**: End-to-end value delivery
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Product Discovery',
        description: 'Product discovery endpoints'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      }
    ],
    components: {
      schemas: {
        ProductDiscoverySolution: {
          type: 'object',
          required: ['name', 'solution', 'epics'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the solution/product',
              example: 'Customer Relationship Management System'
            },
            solution: {
              type: 'string',
              description: 'Detailed solution description covering approach, value proposition, and key benefits',
              example: 'A comprehensive CRM system that streamlines customer interactions, tracks sales opportunities, and provides actionable insights through advanced analytics.'
            },
            epics: {
              type: 'array',
              description: 'List of macro-level epics (7-12 items)',
              minItems: 5,
              maxItems: 15,
              items: {
                $ref: '#/components/schemas/Epic'
              }
            }
          }
        },
        Epic: {
          type: 'object',
          required: ['id', 'name', 'description', 'requirements', 'priority', 'type'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier (UUID v4)',
              example: '550e8400-e29b-41d4-a716-446655440000'
            },
            name: {
              type: 'string',
              description: 'Concise, action-oriented epic name',
              example: 'Customer Data Management'
            },
            description: {
              type: 'string',
              description: 'Detailed description covering intent, scope, and value delivered',
              example: 'Enable comprehensive customer data management with CRUD operations, data validation, and GDPR compliance to provide a centralized source of truth for customer information.'
            },
            requirements: {
              type: 'array',
              description: 'List of requirements (business, functional, non-functional, acceptance criteria)',
              minItems: 1,
              items: {
                type: 'string',
                example: 'Implement CRUD operations for customer records with validation'
              }
            },
            priority: {
              type: 'string',
              enum: ['P0 (Must)', 'P1 (Should)', 'P2 (Could)', 'P3 (Won\'t now)'],
              description: 'MoSCoW prioritization level',
              example: 'P0 (Must)'
            },
            type: {
              type: 'string',
              enum: [
                'Time de negócios',
                'Time de desenvolvimento',
                'Time de experiência do usuário',
                'Time de qualidade'
              ],
              description: 'Team responsible for the epic',
              example: 'Time de desenvolvimento'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Validation Error'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Problem description is required'
            },
            details: {
              type: 'array',
              description: 'Detailed error information (for validation errors)',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'problem'
                  },
                  message: {
                    type: 'string',
                    example: 'Problem description must be at least 10 characters long'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/presentation/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
