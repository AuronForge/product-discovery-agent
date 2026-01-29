import { IAIProvider } from '../../domain/interfaces/IAIProvider';
import { ProductDiscoverySolution, ProductDiscoveryRequest, LanguageCode } from '../../domain/models/ProductDiscovery';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

/**
 * GitHub Copilot AI Provider implementation
 * Uses GitHub Models API for AI-powered product discovery
 */
export class GitHubCopilotProvider implements IAIProvider {
  private promptTemplate: string;

  constructor() {
    // Load prompt template from file
    const promptPath = path.join(__dirname, '../../../prompt/product-discovery-prompt.txt');
    this.promptTemplate = fs.readFileSync(promptPath, 'utf-8');
  }
  /**
   * Generate product discovery solution
   * @param request - Product discovery request
   * @param language - Detected language for response
   * @returns Product discovery solution
   */
  async generateDiscovery(
    request: ProductDiscoveryRequest,
    language: LanguageCode
  ): Promise<ProductDiscoverySolution> {
    try {
      const prompt = this.buildPrompt(request.problem, language);
      const response = await this.callCopilotAPI(prompt);
      return this.parseResponse(response, language);
    } catch (error) {
      console.error('Error generating discovery:', error);
      throw new Error('Failed to generate product discovery solution');
    }
  }

  /**
   * Build the prompt for GitHub Copilot
   * @param problem - Problem description
   * @param language - Target language
   * @returns Formatted prompt
   */
  private buildPrompt(problem: string, language: LanguageCode): string {
    const languageInstructions = this.getLanguageInstructions(language);
    
    return this.promptTemplate
      .replace('{LANGUAGE_INSTRUCTIONS}', languageInstructions)
      .replace('{PROBLEM}', problem);
  }

  /**
   * Get language-specific instructions
   * @param language - Target language
   * @returns Language instructions
   */
  private getLanguageInstructions(language: LanguageCode): string {
    const instructions: Record<LanguageCode, string> = {
      'pt': 'IMPORTANTE: Responda COMPLETAMENTE em PORTUGUÊS BRASILEIRO. Todos os campos (name, solution, epics, descriptions, requirements) devem estar em português.',
      'en': 'IMPORTANT: Respond COMPLETELY in ENGLISH. All fields (name, solution, epics, descriptions, requirements) must be in English.',
      'es': 'IMPORTANTE: Responda COMPLETAMENTE en ESPAÑOL. Todos los campos (name, solution, epics, descriptions, requirements) deben estar en español.',
      'fr': 'IMPORTANT: Répondez COMPLÈTEMENT en FRANÇAIS. Tous les champs (name, solution, epics, descriptions, requirements) doivent être en français.',
      'de': 'WICHTIG: Antworten Sie VOLLSTÄNDIG auf DEUTSCH. Alle Felder (name, solution, epics, descriptions, requirements) müssen auf Deutsch sein.',
      'it': 'IMPORTANTE: Rispondi COMPLETAMENTE in ITALIANO. Tutti i campi (name, solution, epics, descriptions, requirements) devono essere in italiano.',
      'unknown': 'IMPORTANT: Respond in ENGLISH. All fields must be in English.'
    };

    return instructions[language];
  }

  /**
   * Call GitHub Models API to generate discovery
   * @param prompt - The prompt to send
   * @returns AI response
   */
  private async callCopilotAPI(prompt: string): Promise<string> {
    const token = process.env.GITHUB_TOKEN;
    const model = process.env.GITHUB_MODEL || 'gpt-4o';

    // Check if token is configured
    if (!token) {
      console.warn('GitHub token not configured. Using mock response for development.');
      return this.generateMockResponse(prompt);
    }

    try {
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling GitHub Models API:', error);
      // Fallback to mock response on error
      return this.generateMockResponse(prompt);
    }
  }

  /**
   * Generate mock response for development/testing
   * @param prompt - The prompt (contains problem description)
   * @returns Mock JSON response
   */
  private generateMockResponse(prompt: string): string {
    // Extract language from prompt to determine response language
    const isPortuguese = prompt.includes('PORTUGUÊS');
    
    if (isPortuguese) {
      return JSON.stringify({
        "name": "Sistema de Gestão Inteligente",
        "solution": "Desenvolvimento de solução integrada que otimiza processos, melhora experiência do usuário e gera valor mensurável através de automação, analytics e interface intuitiva.",
        "epics": [
          {
            "id": uuidv4(),
            "name": "Autenticação e Controle de Acesso",
            "description": "Implementar sistema robusto de autenticação e autorização com múltiplos níveis de permissão, garantindo segurança e conformidade.",
            "requirements": [
              "Login com email/senha e autenticação em dois fatores (2FA)",
              "Sistema de papéis (RBAC)",
              "Gerenciamento seguro de sessões e tokens JWT",
              "Conformidade com LGPD para dados pessoais",
              "Auditoria de acessos e tentativas de login",
              "Recuperação segura de senha",
              "Integração com provedores externos (OAuth2, SAML)"
            ],
            "priority": "P0 (Must)",
            "type": "Time de desenvolvimento"
          },
          {
            "id": uuidv4(),
            "name": "Dashboard e Visualização de Dados",
            "description": "Criar interface centralizada com métricas, KPIs e visualizações que permitam tomada de decisão informada em tempo real.",
            "requirements": [
              "Dashboard responsivo e intuitivo",
              "Gráficos interativos e customizáveis",
              "Filtros dinâmicos por período, categoria e segmento",
              "Exportação de relatórios em PDF e Excel",
              "Atualização de dados em tempo real ou near-real-time",
              "Acessibilidade WCAG 2.1 nível AA",
              "Performance: carregamento em menos de 2 segundos"
            ],
            "priority": "P0 (Must)",
            "type": "Time de experiência do usuário"
          },
          {
            "id": uuidv4(),
            "name": "Módulo de Gestão de Usuários",
            "description": "Permitir administração completa de usuários, perfis, permissões e grupos, com interface amigável e auditoria completa.",
            "requirements": [
              "CRUD completo de usuários com validações",
              "Gestão de perfis e permissões granulares",
              "Organização em grupos e times",
              "Histórico de alterações e auditoria",
              "Bulk operations (importação/exportação)",
              "Notificações automáticas de criação/alteração de conta",
              "Conformidade com LGPD: consentimento e direito ao esquecimento"
            ],
            "priority": "P0 (Must)",
            "type": "Time de negócios"
          },
          {
            "id": uuidv4(),
            "name": "API Gateway e Integração Externa",
            "description": "Desenvolver camada de integração robusta que permita comunicação segura com sistemas externos e terceiros.",
            "requirements": [
              "API Gateway com rate limiting e throttling",
              "Documentação OpenAPI/Swagger completa",
              "Autenticação via API Keys e OAuth2",
              "Webhooks para notificações assíncronas",
              "Versionamento de API",
              "Logs e monitoramento de chamadas",
              "Tratamento de erros padronizado",
              "SLA de 99.9% de disponibilidade"
            ],
            "priority": "P1 (Should)",
            "type": "Time de desenvolvimento"
          },
          {
            "id": uuidv4(),
            "name": "Motor de Notificações Multi-Canal",
            "description": "Implementar sistema centralizado de notificações via email, SMS, push e in-app, com preferências do usuário e templates customizáveis.",
            "requirements": [
              "Suporte a múltiplos canais (email, SMS, push, in-app)",
              "Gestão de templates personalizáveis",
              "Preferências de notificação por usuário",
              "Fila de processamento assíncrono",
              "Retry logic para falhas",
              "Tracking de entrega e leitura",
              "Conformidade com LGPD: opt-in/opt-out"
            ],
            "priority": "P1 (Should)",
            "type": "Time de desenvolvimento"
          },
          {
            "id": uuidv4(),
            "name": "Sistema de Busca e Filtros Avançados",
            "description": "Oferecer capacidade de busca rápida e precisa com filtros avançados, melhorando a descoberta de informações e eficiência do usuário.",
            "requirements": [
              "Busca full-text com relevância",
              "Filtros combinados e salvos",
              "Sugestões e autocomplete",
              "Busca facetada por múltiplas dimensões",
              "Performance: resultados em menos de 500ms",
              "Indexação eficiente e escalável",
              "Acessibilidade em componentes de busca"
            ],
            "priority": "P1 (Should)",
            "type": "Time de experiência do usuário"
          },
          {
            "id": uuidv4(),
            "name": "Módulo de Analytics e Relatórios",
            "description": "Fornecer capacidade analítica avançada com relatórios customizáveis, insights automáticos e exportação de dados.",
            "requirements": [
              "Relatórios pré-configurados e customizáveis",
              "Agendamento de relatórios automáticos",
              "Exportação em múltiplos formatos (PDF, Excel, CSV)",
              "Visualizações de tendências e comparações",
              "Drill-down para análise detalhada",
              "Insights automáticos com ML (quando aplicável)",
              "Performance otimizada para grandes volumes"
            ],
            "priority": "P1 (Should)",
            "type": "Time de negócios"
          },
          {
            "id": uuidv4(),
            "name": "Automação de Testes E2E",
            "description": "Estabelecer suite completa de testes automatizados que garanta qualidade, reduza regressões e acelere entregas.",
            "requirements": [
              "Testes unitários com cobertura mínima de 80%",
              "Testes de integração para APIs críticas",
              "Testes E2E para fluxos principais",
              "Testes de performance e carga",
              "Testes de segurança automatizados",
              "Integração com CI/CD pipeline",
              "Relatórios automáticos de qualidade"
            ],
            "priority": "P0 (Must)",
            "type": "Time de qualidade"
          },
          {
            "id": uuidv4(),
            "name": "Sistema de Auditoria e Compliance",
            "description": "Registrar todas as ações críticas do sistema para fins de auditoria, compliance e troubleshooting.",
            "requirements": [
              "Log de todas as ações críticas (CRUD, acessos, mudanças de permissão)",
              "Armazenamento imutável de logs",
              "Rastreabilidade completa (quem, o quê, quando, onde)",
              "Retenção de logs conforme regulamentações",
              "Interface de consulta de auditoria",
              "Alertas para ações suspeitas",
              "Conformidade com LGPD e SOC2"
            ],
            "priority": "P0 (Must)",
            "type": "Time de qualidade"
          }
        ]
      });
    } else {
      return JSON.stringify({
        "name": "Intelligent Management System",
        "solution": "Development of an integrated solution that optimizes processes, improves user experience, and generates measurable value through automation, analytics, and intuitive interface.",
        "epics": [
          {
            "id": uuidv4(),
            "name": "Base Architecture Setup",
            "description": "Establish the technical foundation of the system, including infrastructure, code standards, CI/CD, and environments. Ensures scalability, maintainability, and quality from the start.",
            "requirements": [
              "Define microservices or modular monolith architecture based on expected scale",
              "Configure automated CI/CD pipelines",
              "Implement code standards and mandatory code review",
              "Ensure GDPR compliance and security requirements",
              "Configure monitoring and observability",
              "Establish development, staging, and production environments"
            ],
            "priority": "P0 (Must)",
            "type": "Time de desenvolvimento"
          },
          {
            "id": uuidv4(),
            "name": "Authentication and Authorization System",
            "description": "Implement secure multi-factor authentication and role-based access control (RBAC), ensuring security and compliance.",
            "requirements": [
              "Multi-Factor Authentication (MFA)",
              "Role-Based Access Control (RBAC)",
              "Secure session and JWT token management",
              "GDPR compliance for personal data",
              "Access audit and login attempt tracking",
              "Secure password recovery",
              "Integration with external providers (OAuth2, SAML)"
            ],
            "priority": "P0 (Must)",
            "type": "Time de desenvolvimento"
          },
          {
            "id": uuidv4(),
            "name": "Dashboard and Data Visualization",
            "description": "Create centralized interface with metrics, KPIs, and visualizations enabling real-time informed decision-making.",
            "requirements": [
              "Responsive and intuitive dashboard",
              "Interactive and customizable charts",
              "Dynamic filters by period, category, and segment",
              "Report export in PDF and Excel",
              "Real-time or near-real-time data updates",
              "WCAG 2.1 Level AA accessibility",
              "Performance: loading under 2 seconds"
            ],
            "priority": "P0 (Must)",
            "type": "Time de experiência do usuário"
          },
          {
            "id": uuidv4(),
            "name": "User Management Module",
            "description": "Enable complete user administration, profiles, permissions, and groups with user-friendly interface and full audit trail.",
            "requirements": [
              "Complete CRUD for users with validations",
              "Granular profile and permission management",
              "Organization into groups and teams",
              "Change history and audit trail",
              "Bulk operations (import/export)",
              "Automatic notifications for account creation/changes",
              "GDPR compliance: consent and right to be forgotten"
            ],
            "priority": "P0 (Must)",
            "type": "Time de negócios"
          },
          {
            "id": uuidv4(),
            "name": "API Gateway and External Integration",
            "description": "Develop robust integration layer enabling secure communication with external systems and third parties.",
            "requirements": [
              "API Gateway with rate limiting and throttling",
              "Complete OpenAPI/Swagger documentation",
              "Authentication via API Keys and OAuth2",
              "Webhooks for asynchronous notifications",
              "API versioning",
              "Call logging and monitoring",
              "Standardized error handling",
              "99.9% availability SLA"
            ],
            "priority": "P1 (Should)",
            "type": "Time de desenvolvimento"
          },
          {
            "id": uuidv4(),
            "name": "Multi-Channel Notification Engine",
            "description": "Implement centralized notification system via email, SMS, push, and in-app, with user preferences and customizable templates.",
            "requirements": [
              "Multi-channel support (email, SMS, push, in-app)",
              "Customizable template management",
              "Per-user notification preferences",
              "Asynchronous processing queue",
              "Retry logic for failures",
              "Delivery and read tracking",
              "GDPR compliance: opt-in/opt-out"
            ],
            "priority": "P1 (Should)",
            "type": "Time de desenvolvimento"
          },
          {
            "id": uuidv4(),
            "name": "Advanced Search and Filter System",
            "description": "Offer fast and accurate search capability with advanced filters, improving information discovery and user efficiency.",
            "requirements": [
              "Full-text search with relevance",
              "Combined and saved filters",
              "Suggestions and autocomplete",
              "Faceted search across multiple dimensions",
              "Performance: results under 500ms",
              "Efficient and scalable indexing",
              "Accessibility in search components"
            ],
            "priority": "P1 (Should)",
            "type": "Time de experiência do usuário"
          },
          {
            "id": uuidv4(),
            "name": "Analytics and Reporting Module",
            "description": "Provide advanced analytical capability with customizable reports, automatic insights, and data export.",
            "requirements": [
              "Pre-configured and customizable reports",
              "Automatic report scheduling",
              "Export in multiple formats (PDF, Excel, CSV)",
              "Trend and comparison visualizations",
              "Drill-down for detailed analysis",
              "Automatic ML insights (when applicable)",
              "Performance optimized for large volumes"
            ],
            "priority": "P1 (Should)",
            "type": "Time de negócios"
          },
          {
            "id": uuidv4(),
            "name": "E2E Test Automation",
            "description": "Establish complete automated test suite ensuring quality, reducing regressions, and accelerating deliveries.",
            "requirements": [
              "Unit tests with minimum 80% coverage",
              "Integration tests for critical APIs",
              "E2E tests for main flows",
              "Performance and load tests",
              "Automated security tests",
              "CI/CD pipeline integration",
              "Automatic quality reports"
            ],
            "priority": "P0 (Must)",
            "type": "Time de qualidade"
          },
          {
            "id": uuidv4(),
            "name": "Audit and Compliance System",
            "description": "Record all critical system actions for audit, compliance, and troubleshooting purposes.",
            "requirements": [
              "Logging of all critical actions (CRUD, access, permission changes)",
              "Immutable log storage",
              "Complete traceability (who, what, when, where)",
              "Log retention per regulations",
              "Audit query interface",
              "Alerts for suspicious actions",
              "GDPR and SOC2 compliance"
            ],
            "priority": "P0 (Must)",
            "type": "Time de qualidade"
          }
        ]
      });
    }
  }

  /**
   * Parse AI response into structured format
   * @param response - Raw AI response
   * @param _language - Language code
   * @returns Parsed product discovery solution
   */
  private parseResponse(response: string, _language: LanguageCode): ProductDiscoverySolution {
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedResponse);

      // Validate and ensure UUIDs
      if (parsed.epics && Array.isArray(parsed.epics)) {
        parsed.epics = parsed.epics.map((epic: any) => ({
          ...epic,
          id: this.isValidUUID(epic.id) ? epic.id : uuidv4()
        }));
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Validate UUID format
   * @param id - ID to validate
   * @returns True if valid UUID
   */
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}
