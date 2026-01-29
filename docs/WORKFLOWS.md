# GitHub Workflows - CI/CD Pipeline

This document explains the CI/CD pipeline configuration for the Product Discovery Agent.

## Workflows

### Main Pipeline (`deploy.yml`)

The main CI/CD pipeline runs on every push and pull request to `main` and `develop` branches.

#### Jobs

1. **Lint** - Code quality checks
   - Runs ESLint
   - Checks code formatting with Prettier

2. **Test** - Runs test suite
   - Executes all tests with coverage
   - Uploads coverage to Codecov (optional)
   - Requires 90%+ coverage

3. **Build** - Compiles application
   - Builds TypeScript to JavaScript
   - Uploads build artifacts

4. **Deploy Staging** - Deploys to staging environment
   - Triggers on push to `develop` branch
   - Downloads build artifacts
   - Deploys to staging server

5. **Deploy Production** - Deploys to production
   - Triggers on push to `main` branch
   - Downloads build artifacts
   - Deploys to production server
   - Creates release notes

6. **Docker** - Builds and pushes Docker image
   - Creates multi-platform Docker image
   - Pushes to Docker Hub
   - Tags with branch name, PR number, version, and SHA

## Required Secrets

Configure these secrets in GitHub repository settings (Settings → Secrets and variables → Actions):

### Optional Secrets

- `CODECOV_TOKEN` - For uploading test coverage to Codecov
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password or access token

### Deployment Secrets (add based on your deployment method)

- `HEROKU_API_KEY` - For Heroku deployment
- `AWS_ACCESS_KEY_ID` - For AWS deployment
- `AWS_SECRET_ACCESS_KEY` - For AWS deployment
- `SSH_PRIVATE_KEY` - For SSH deployment
- `DEPLOY_HOST` - Deployment server hostname
- `DEPLOY_USER` - Deployment server username

## Environments

GitHub Environments can be configured for additional protection:

1. Go to Settings → Environments
2. Create `staging` and `production` environments
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches

## Customizing Deployment

### Heroku

```yaml
- name: Deploy to Heroku
  run: |
    git push https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/your-app.git HEAD:main
```

### AWS S3 + CloudFront

```yaml
- name: Deploy to AWS
  run: |
    aws s3 sync dist/ s3://your-bucket --delete
    aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### SSH Deployment

```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /app
      git pull origin main
      npm ci --only=production
      npm run build
      pm2 restart product-discovery-agent
```

### Docker Compose Deployment

```yaml
- name: Deploy with Docker Compose
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /app
      docker-compose pull
      docker-compose up -d
```

## Docker

### Building Locally

```bash
docker build -t product-discovery-agent .
docker run -p 3000:3000 -e GITHUB_TOKEN=your_token product-discovery-agent
```

### Using Docker Compose

```bash
# Create .env file with your secrets
echo "GITHUB_TOKEN=your_token" > .env

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Multi-stage Build

The Dockerfile uses multi-stage builds for optimal image size:

- **Builder stage**: Compiles TypeScript
- **Production stage**: Only includes runtime dependencies

## Status Badges

Add these badges to your README:

```markdown
![CI/CD](https://github.com/yourusername/product-discovery-agent/actions/workflows/deploy.yml/badge.svg)
![codecov](https://codecov.io/gh/yourusername/product-discovery-agent/branch/main/graph/badge.svg)
```

## Troubleshooting

### Workflow not triggering

- Check branch names match exactly
- Verify workflow file is in `.github/workflows/`
- Check repository permissions

### Tests failing in CI but passing locally

- Ensure `.env` file is not committed
- Check Node.js version matches (20.x)
- Verify all dependencies are in `package.json`

### Docker build failing

- Check Dockerfile syntax
- Ensure all required files are copied
- Verify build context includes necessary files

### Deployment failing

- Verify all required secrets are configured
- Check deployment target is accessible
- Review deployment logs in Actions tab

## Best Practices

1. **Branch Protection**: Enable branch protection for `main` and `develop`
2. **Required Reviews**: Require PR reviews before merging
3. **Status Checks**: Make CI jobs required before merging
4. **Environment Secrets**: Use environment-specific secrets
5. **Rollback Plan**: Keep previous Docker images for quick rollback

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Codecov Documentation](https://docs.codecov.com/)
