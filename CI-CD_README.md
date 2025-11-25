This repository includes two GitHub Actions workflows for CI and CD.

Workflows
- .github/workflows/ci.yml: Runs backend tests and builds Frontend/Admin on push and PR to `main`.
- .github/workflows/docker-publish.yml: Builds and pushes Docker images for Backend, Frontend, and Admin to Docker Hub on push to `main`.

Required Secrets (set in GitHub repository Settings > Secrets > Actions):
- DOCKERHUB_USERNAME: Your Docker Hub username.
- DOCKERHUB_TOKEN: A Docker Hub access token or password.

Default image tags
- Images are pushed as `${{ secrets.DOCKERHUB_USERNAME }}/backend:latest`, `${{ secrets.DOCKERHUB_USERNAME }}/frontend:latest`, `${{ secrets.DOCKERHUB_USERNAME }}/admin:latest`.

Customizing
- To change the image names or tags, edit `.github/workflows/docker-publish.yml` and update the `tags` value in the `Build and push image` step.
- If your Dockerfiles live in different paths or use different filenames, update the `working-directory` or `file` fields accordingly.

Notes
- The Docker workflow uses multi-platform buildx for linux/amd64 and linux/arm64.
- CI uses Node 18 by default; adjust `node-version` in `.github/workflows/ci.yml` if needed.
