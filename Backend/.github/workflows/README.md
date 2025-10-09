# GitHub Actions CI/CD Pipeline

This workflow automatically builds, tests, and deploys your Cake Shop Website project.

## Workflow Overview

The pipeline includes the following jobs:

### 1. Backend Tests (`backend-test`)
- Sets up MySQL database service for testing
- Installs dependencies and runs tests
- Tests database connectivity

### 2. Frontend Tests (`frontend-test`)
- Installs dependencies
- Runs ESLint for code quality
- Builds the React frontend application
- Uploads build artifacts

### 3. Admin Panel Tests (`admin-test`)
- Installs dependencies
- Runs ESLint for code quality
- Builds the React admin panel
- Uploads build artifacts

### 4. Integration Tests (`integration-test`)
- Runs after all individual tests pass
- Tests the complete system integration
- Verifies API endpoints are working

### 5. Security Scan (`security-scan`)
- Scans for vulnerabilities using Trivy
- Uploads results to GitHub Security tab

### 6. Deploy (`deploy`)
- Only runs on main branch pushes
- Downloads build artifacts
- Deploys to production (configuration needed)

## Required Environment Variables

### For Testing (automatically set in workflow):
- `MYSQL_ROOT_PASSWORD`: Database root password for testing
- `MYSQL_DATABASE`: Test database name
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database connection details

### For Deployment (add to GitHub Secrets):

#### For Vercel Deployment:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### For AWS Deployment:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

#### For Docker Registry:
```
DOCKER_USERNAME=your_username
DOCKER_PASSWORD=your_password
```

## Setting up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Navigate to "Secrets and variables" > "Actions"
4. Click "New repository secret"
5. Add the required secrets for your deployment platform

## Customizing Deployment

The workflow includes placeholder deployment steps for common platforms:

### Vercel (uncomment to use):
```yaml
- name: Deploy Frontend to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    working-directory: ./Frontend
```

### AWS S3 (uncomment to use):
```yaml
- name: Deploy Frontend to S3
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1
```

## Database Setup

The workflow automatically:
1. Starts a MySQL 8.0 service
2. Waits for the database to be ready
3. Creates the test database using your SQL file
4. Runs tests with the test database

## Monitoring

- Check the "Actions" tab in your GitHub repository to see workflow runs
- Security scan results appear in the "Security" tab
- Failed builds will show detailed error logs

## Troubleshooting

### Common Issues:

1. **Database Connection Fails**: Check if your SQL file is valid and accessible
2. **Build Fails**: Ensure all dependencies are in package.json
3. **Linting Errors**: Fix ESLint issues or update the configuration
4. **Deployment Fails**: Verify your deployment secrets are correct

### Adding Tests:

To add tests to your project:
1. Create test files in your Backend directory
2. Add test scripts to package.json:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch"
     }
   }
   ```
3. The workflow will automatically run your tests
