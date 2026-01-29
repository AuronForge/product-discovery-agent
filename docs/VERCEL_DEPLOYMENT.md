# Vercel Deployment

This project is configured for automated deployment to Vercel using GitHub Actions.

## Environments

- **Staging**: Deployed from `develop` branch to Vercel preview environment
- **Production**: Deployed from `main` branch to Vercel production environment

## Setup Instructions

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Project to Vercel

```bash
vercel link
```

This will create `.vercel` directory with project configuration.

### 3. Get Vercel Credentials

```bash
# Get your Vercel token
vercel whoami

# Get project settings (from .vercel/project.json)
cat .vercel/project.json
```

### 4. Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `VERCEL_TOKEN`: Your Vercel authentication token
  - Get it from: https://vercel.com/account/tokens
- `VERCEL_ORG_ID`: Your Vercel organization ID
  - Found in `.vercel/project.json` as `orgId`
- `VERCEL_PROJECT_ID`: Your Vercel project ID
  - Found in `.vercel/project.json` as `projectId`

- `COPILOT_API_TOKEN`: Your GitHub Copilot API token
  - Required for the AI features to work in production

### 5. Configure Environment Variables in Vercel

Go to your Vercel project settings and add:

**Production Environment:**

- `NODE_ENV`: `production`
- `COPILOT_API_TOKEN`: Your GitHub Copilot API token
- `PORT`: `3000` (optional, Vercel handles this automatically)

**Preview/Staging Environment:**

- Same variables as production

## Deployment Workflow

### Staging Deployment (Automatic)

When you push to the `develop` branch:

1. GitHub Actions runs tests and builds
2. Deploys to Vercel preview environment
3. URL: `https://product-discovery-agent-<hash>.vercel.app`

### Production Deployment (Automatic)

When you push to the `main` branch:

1. GitHub Actions runs tests and builds
2. Deploys to Vercel production environment
3. URL: `https://product-discovery-agent.vercel.app` (or your custom domain)

## Manual Deployment

You can also deploy manually using Vercel CLI:

```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod
```

## Monitoring Deployments

- View deployments: https://vercel.com/dashboard
- Check logs in Vercel dashboard
- Monitor GitHub Actions: https://github.com/AuronForge/product-discovery-agent/actions

## Vercel Configuration

The `vercel.json` file configures:

- Build settings (Node.js runtime)
- Routes (all requests to Express app)
- Environment variables

## Troubleshooting

### Build Fails

1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Ensure `npm run build` works locally

### Runtime Errors

1. Check Vercel function logs in dashboard
2. Verify environment variables are set
3. Check that all dependencies are in `package.json`

### Database Issues

Note: Vercel functions are serverless. If using SQLite:

- Data is ephemeral and not persisted between deployments
- Consider using a persistent database (PostgreSQL, MongoDB, etc.)
- Or use Vercel's storage solutions (Vercel KV, Postgres)

## Custom Domain

To add a custom domain:

1. Go to Vercel project settings
2. Add domain under "Domains"
3. Update DNS records as instructed
4. Update workflow URLs in `.github/workflows/deploy.yml`

## Rollback

To rollback a deployment:

1. Go to Vercel dashboard
2. Select a previous deployment
3. Click "Promote to Production"

Or use CLI:

```bash
vercel rollback [deployment-url]
```
