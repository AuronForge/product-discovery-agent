# GitHub Actions - Vercel Deployment Setup

Este documento descreve como configurar os secrets necessários para o deploy automático no Vercel via GitHub Actions.

## Secrets Necessários

Configure os seguintes secrets no GitHub em: **Settings → Secrets and variables → Actions → New repository secret**

### 1. VERCEL_TOKEN

Token de autenticação do Vercel CLI.

**Como obter:**

```bash
vercel login
vercel token create
```

Ou acesse: https://vercel.com/account/tokens

**Nome do Secret:** `VERCEL_TOKEN`  
**Valor:** O token gerado pelo comando acima

---

### 2. VERCEL_ORG_ID

ID da organização/equipe do Vercel.

**Como obter:**

```bash
cat .vercel/project.json
```

Procure pelo campo `orgId`.

**Valor atual do projeto:**

```
team_fIfJ5ABLF77tVVuldFNkfPhR
```

**Nome do Secret:** `VERCEL_ORG_ID`  
**Valor:** `team_fIfJ5ABLF77tVVuldFNkfPhR`

---

### 3. VERCEL_PROJECT_ID

ID do projeto no Vercel.

**Como obter:**

```bash
cat .vercel/project.json
```

Procure pelo campo `projectId`.

**Valor atual do projeto:**

```
prj_juUhhPfNvnMOzm1ODKcOH2eDvW5o
```

**Nome do Secret:** `VERCEL_PROJECT_ID`  
**Valor:** `prj_juUhhPfNvnMOzm1ODKcOH2eDvW5o`

---

### 4. COPILOT_API_TOKEN (Opcional)

Token da API do GitHub Copilot para geração de discovery.

**Nome do Secret:** `COPILOT_API_TOKEN`  
**Valor:** Seu token do GitHub Copilot

---

## Fluxo de Deploy

### Deploy para Staging (Preview)

- **Branch:** `develop`
- **Trigger:** Push para `develop`
- **Ambiente:** Preview do Vercel
- **URL:** Gerada dinamicamente pelo Vercel

### Deploy para Production

- **Branch:** `main`
- **Trigger:** Push para `main`
- **Ambiente:** Production do Vercel
- **URL:** https://product-discovery-agent.vercel.app

---

## Workflow

O workflow executa os seguintes jobs:

1. **lint** - Verifica código com ESLint e Prettier
2. **test** - Executa testes com coverage
3. **build** - Compila o código TypeScript
4. **deploy-staging** - Deploy para preview (apenas branch `develop`)
5. **deploy-production** - Deploy para produção (apenas branch `main`)

---

## Comandos Manuais

### Deploy manual para preview:

```bash
vercel
```

### Deploy manual para produção:

```bash
vercel --prod
```

### Ver logs de deployment:

```bash
vercel logs <deployment-url>
```

### Listar deployments:

```bash
vercel list
```

---

## Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no Vercel Dashboard:

1. Acesse: https://vercel.com/eduk29s-projects/product-discovery-agent/settings/environment-variables

2. Adicione as variáveis necessárias:
   - `GITHUB_COPILOT_API_KEY` - Token da API do Copilot
   - Outras variáveis específicas do projeto

---

## Troubleshooting

### Erro: "Error: No token provided"

- Verifique se o secret `VERCEL_TOKEN` está configurado corretamente

### Erro: "Error: Project not found"

- Verifique se os secrets `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estão corretos

### Deploy falhando no build

- Verifique os logs do GitHub Actions
- Execute `vercel build` localmente para reproduzir o erro

### Database error em produção

- Lembre-se que o Vercel usa `/tmp` para o SQLite (ephemeral storage)
- Considere usar um banco de dados externo para persistência

---

## Links Úteis

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel + GitHub Actions Guide](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)
