## 4.7. GitOps

> Moved the Log output application to use GitOps so that when you commit to the repository, the application is automatically updated using ArgoCD and github action to handle the image, did the same for [pong_application](<../.github/workflows/logOutputMS(pong)_argocd.yaml>) that is one of ms of this.

Let us start by installing ArgoCD by following the Getting of the docs:

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Now ArgoCD is up and running in our cluster. We still need to open access to it. There are several options(opens in a new tab). We shall use the LoadBalancer. So we'll give the command

`kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'`

After a short wait, the cluster has provided us with an external IP:

```
$ kubectl get svc -n argocd
NAME               TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)                      AGE
...
argocd-server      LoadBalancer   10.7.5.82     34.88.152.2   80:32029/TCP,443:30574/TCP   17min
```

The initial password for the admin account is auto-generated and stored as clear text in the field password in a secret named argocd-initial-admin-secret in your Argo CD installation namespace. So we get it by base64 decoding the value that we get with the command

```
kubectl get -n argocd secrets argocd-initial-admin-secret -o yaml
```

#### manage the image for argocd

```yaml
---
jobs:
  build-publish:
    name: Log_output Build, Push, Release
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # Tag image with the GitHub SHA to get a unique tag
      - name: Build and publish backend
        run: |
          docker build --file log_output/dockerfile.reader --tag "bidhe1/log_output:${GITHUB_SHA}" log_output
          docker push "bidhe1/log_output:${GITHUB_SHA}"
      - name: Set up Kustomize
        uses: imranismail/setup-kustomize@v2

      - name: Update kustomization.yaml with new image
        run: |
          cd log_output/manifests
          kustomize edit set image log_output=bidhe1/log_output:${GITHUB_SHA}

      - name: Commit and push changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "New version released ${{ github.sha }}"
          file_pattern: "log_output/manifests/kustomization.yaml"
          commit_user_name: "github-actions[bot]"
          commit_user_email: "github-actions[bot]@users.noreply.github.com"
```

### Some Important Checks

- Make sure Argo Rollouts is installed for canary updates via:

  ```
  kubectl create namespace argo-rollouts
  kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
  ```

- Gateway API cluster update is required:

  `gcloud container clusters update dwk-cluster2 --location=us-central1-a --gateway-api=standard`

- For Prometheus functionalities (e.g., CPU monitoring for rollouts), check if Prometheus is installed and the endpoint address in the YAML is properly configured.

  ```
  # Example Prometheus address:
  # http://prometheus-kube-prometheus-prometheus.prometheus.svc.prometheus.cluster.local:9090

  # To create the prometheus namespace and install Prometheus using Helm:
  kubectl create namespace prometheus

  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update

  helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace prometheus
  ```

- Don't forhet to check the github workflow and namespace
