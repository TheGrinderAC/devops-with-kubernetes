# 4.9: Rogh

This project uses a CI/CD pipeline to automatically deploy the application to the **staging environment** whenever a commit is pushed to the `main` branch. The process works as follows:

### Prod:

1. **Push to main branch:** When you push a commit to the `main` branch, it triggers a GitHub Actions workflow.
2. **GitHub Actions:** The workflow builds a new Docker image of the application.
3. **Push to Google Artifact Registry (GAR):** The newly built image is pushed to the container registry.
4. **Update kustomization.yaml:** The workflow updates the image reference in `apps/[app]/overlays/staging/kustomization.yaml` to use the new image.
5. **ArgoCD deployment:** ArgoCD detects the change in the kustomization file and automatically deploys the updated application to the staging namespace in the Kubernetes cluster.

### staging:

Push to main → GitHub Actions → Build image → Push to GAR →
Update apps/[app]/overlays/staging/kustomization.yaml →
ArgoCD detects change → Deploys to staging namespace
