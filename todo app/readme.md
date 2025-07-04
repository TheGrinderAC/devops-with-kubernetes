# 1.6. The project, step4(NodePort)

### Service Deployment Creation

```bash
$  kubectl apply -f manifests
```

```yaml
deployment.apps/todo-app created
ingress.networking.k8s.io/todo-app-ingress created
service/todo-app-svc created
```

Successfully running on: http://localhost:8081
![Application Screenshot](./image.png)

Using This Cluster:

````javascript
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
```
````
