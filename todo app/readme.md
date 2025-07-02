# 1.2 Kubernetes Deployment Console Logs

### Docker Build

```bash
$ docker build -t bidhe1/todo_app .
```

### Docker Push

```bash
PS E:\kubernaties_sub\Kubernet\log_output> docker push bidhe1/todo_app
```

## Kubernetes Configuration

### Cluster Setup

```bash
# k3d setup
$ k3d cluster create -a 2
```

```bash
$ kubectl cluster-info

Kubernetes control plane is running at https://host.docker.internal:59674
CoreDNS is running at https://host.docker.internal:59674/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://host.docker.internal:59674/api/v1/namespaces/kube-system/services/https:metrics-server:https/proxy
```

```bash
# Set cluster server endpoint
$ kubectl config set-cluster k3d-k3s-default --server=https://localhost:59674
```

### Deployment Creation

```bash
$ kubectl create deployment todoapp --image bidhe1/todo_app
```

```yaml
deployment.apps/todoapp created
```

## Application Logs

### Real-time Log Output

```bash
$ kubectl logs -f todoapp-7bb79bfdf4-dskhc
```

```javascript
> todo-app@1.0.0 start
> node index.js

Server started in port 3000
```

### Cleanup

```bash
PS E:\kubernaties_sub\Kubernet\log_output> kubectl delete deployment todoapp
```

```yaml
deployment.apps "logoutput" deleted
```

```bash
$  k3d cluster delete k3s-default
```
