# API Examples

## Discovery Endpoints

### Create New Discovery (POST)

#### Example 1: CRM System (English)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "We need a system to manage customer relationships and track sales opportunities effectively. The system should help our sales team stay organized, improve customer communication, and provide insights into our sales pipeline."
  }'
```

#### Example 2: Sistema CRM (Portuguese)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Precisamos de um sistema para gerenciar relacionamentos com clientes e acompanhar oportunidades de vendas de forma eficaz. O sistema deve ajudar nossa equipe de vendas a se manter organizada, melhorar a comunicação com clientes e fornecer insights sobre nosso pipeline de vendas."
  }'
```

#### Example 3: E-commerce Platform (English)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "We want to build an e-commerce platform that allows small businesses to easily create online stores, manage inventory, process payments securely, and track orders. The platform should be user-friendly, scalable, and mobile-responsive."
  }'
```

### List All Discoveries (GET)

#### Example 1: Get first 10 discoveries

```bash
curl -X GET "http://localhost:3000/api/discoveries?limit=10&offset=0"
```

#### Example 2: Get next 10 discoveries (pagination)

```bash
curl -X GET "http://localhost:3000/api/discoveries?limit=10&offset=10"
```

#### Example 3: Get only 5 discoveries

```bash
curl -X GET "http://localhost:3000/api/discoveries?limit=5"
```

### Get Discovery by ID (GET)

```bash
# Replace {id} with actual discovery ID
curl -X GET "http://localhost:3000/api/discoveries/7684dd52-8b58-4399-9be3-ebb3bcdcaf7c"
```

## Complete Workflow Examples

### Example 4: Healthcare Application (English)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Create a healthcare application that enables patients to schedule appointments, access medical records, communicate with doctors via telemedicine, and receive medication reminders. The app must comply with HIPAA and ensure data privacy."
  }'
```

### Example 5: Plataforma de Educação (Portuguese)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Queremos desenvolver uma plataforma de educação online que permita professores criarem e compartilharem cursos, alunos assistirem aulas ao vivo e gravadas, realizarem avaliações, e acompanharem seu progresso. A plataforma deve ser acessível, interativa e suportar diversos formatos de conteúdo."
  }'
```

## Using PowerShell

### Example 1: Basic Request

```powershell
$body = @{
    problem = "We need a project management tool that helps teams collaborate effectively"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/discovery" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | ConvertTo-Json -Depth 10
```

## Using JavaScript (Node.js)

### Example 1: Using fetch

```javascript
const response = await fetch('http://localhost:3000/api/discovery', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    problem: 'We need a system to manage customer relationships and track sales opportunities effectively'
  })
});

const solution = await response.json();
console.log(JSON.stringify(solution, null, 2));
```

### Example 2: Using axios

```javascript
const axios = require('axios');

const solution = await axios.post('http://localhost:3000/api/discovery', {
  problem: 'We need a system to manage customer relationships and track sales opportunities effectively'
});

console.log(JSON.stringify(solution.data, null, 2));
```

## Using Python

### Example 1: Using requests

```python
import requests
import json

response = requests.post(
    'http://localhost:3000/api/discovery',
    json={
        'problem': 'We need a system to manage customer relationships and track sales opportunities effectively'
    }
)

solution = response.json()
print(json.dumps(solution, indent=2))
```

## Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T17:47:06.849Z",
  "service": "product-discovery-agent"
}
```

## Error Examples

### Validation Error - Empty Problem

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": ""}'
```

Response (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "problem",
      "message": "Problem description must be at least 10 characters long"
    }
  ]
}
```

### Validation Error - Missing Field

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "problem",
      "message": "Required"
    }
  ]
}
```

### Validation Error - Too Short

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "Short"}'
```

Response (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "problem",
      "message": "Problem description must be at least 10 characters long"
    }
  ]
}
```

## Pretty Print Response

### Using jq (Linux/Mac)

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "We need a CRM system"}' | jq .
```

### Using Python

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "We need a CRM system"}' | python -m json.tool
```

## Save Response to File

```bash
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "We need a CRM system"}' \
  -o discovery-result.json
```

## Test Multiple Languages

```bash
# English
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "We need a customer management system"}' \
  | jq '.epics[0].name'

# Portuguese
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "Precisamos de um sistema de gestão de clientes"}' \
  | jq '.epics[0].name'

# Spanish
curl -X POST http://localhost:3000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{"problem": "Necesitamos un sistema de gestión de clientes"}' \
  | jq '.epics[0].name'
```

## Postman Collection

Import the Postman collection from:
```
./postman/product-discovery-agent.postman_collection.json
```

The collection includes:
- All example requests
- Pre-configured environments
- Sample responses
- Error scenarios
