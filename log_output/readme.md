## 4.7. Baby steps to GitOps

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

- GatewayAPI cluster update require

#### manage the image for argocd(to have record of using right image and pushing into a artifact like dockerhub)

```yaml
---
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Login to Docker Hub
    uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKERHUB_USERNAME }}
      password: ${{ secrets.DOCKERHUB_TOKEN }}

  # Tag image with the GitHub SHA to get a unique tag
  - name: Build and publish backend
    run: |
      docker build --tag "bidhe1/log_output:${GITHUB_SHA}" log_output
      docker push "bidhe1/log_output:${GITHUB_SHA}"

  - name: Set up Kustomize
    uses: imranismail/setup-kustomize@v2

  - name: Update kustomization.yaml with new image
    run: |
      cd log_output
      kustomize edit set image log_output=bidhe1/log_output:${GITHUB_SHA}

  - name: Commit kustomization.yaml to GitHub
    uses: EndBug/add-and-commit@v9
    with:
      add: "log_output/kustomization.yaml"
      message: "New version released ${{ github.sha }}"
```
