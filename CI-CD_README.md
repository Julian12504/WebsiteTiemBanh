# CI/CD Configuration

This repository includes two GitHub Actions workflows for CI and CD.

## Project Structure

This is a monorepo with 3 separate applications:
- **Backend**: Express.js API server
- **Frontend**: React customer-facing app (Vite)
- **Admin**: React admin panel app (Vite)

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` branch.

**Jobs**:
- `backend-tests`: Runs Jest tests for Backend API
- `frontend-build`: Builds Frontend (Customer) app
- `admin-build`: Builds Admin Panel app

**Node.js Version**: 18 (configurable in workflow file)

### 2. Docker Build & Publish (`.github/workflows/docker-publish.yml`)

Builds and pushes Docker images for all 3 apps to Docker Hub on push to `main`.

**Images Built**:
- `${DOCKERHUB_USERNAME}/backend:latest`
- `${DOCKERHUB_USERNAME}/frontend:latest`
- `${DOCKERHUB_USERNAME}/admin:latest`

**Platforms**: linux/amd64, linux/arm64

## Required Secrets

Set these in GitHub repository Settings > Secrets > Actions:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token or password

## Deployment

For deployment to production (Vercel + Railway), see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## Customizing

### Change Node.js Version

Edit `.github/workflows/ci.yml`:
```yaml
- name: Use Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change to your desired version
```

### Change Docker Image Names

Edit `.github/workflows/docker-publish.yml`:
```yaml
tags: ${{ secrets.DOCKERHUB_USERNAME }}/your-custom-name:latest
```

### Add More Tests

Add test scripts to respective `package.json` files:
- Backend: Already has `npm test`
- Frontend/Admin: Add `"test": "vitest"` if using Vitest

## Workflow Triggers

### CI Workflow
- Triggers on: `push` and `pull_request` to `main`
- To change branches: Edit `on.push.branches` and `on.pull_request.branches`

### Docker Workflow
- Triggers on: `push` to `main` only
- To add tags: Modify `on.push.tags` section

## Notes

- CI uses `npm ci` for faster, reproducible installs
- Docker workflow uses buildx for multi-platform builds
- All workflows use latest GitHub Actions (v4 for checkout, setup-node)
