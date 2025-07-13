# 3.5. The project, step 14

- & [3.5(ii) todo_backend](../todo-backend/)

> Configured both projects to use Kustomize, and deployed it to Google Kubernetes Engine.

```js
$ kubectl kustomize .

apiVersion: v1
data:
  CACHE_TIMEOUT: "600000"
  IMAGE_API_URL: https://picsum.photos/1200
  IMAGE_DIR: /app/storage
  IMAGE_NAME: image.jpg
  PORT: "3000"
  TODO_BACKEND_URL: http://todo-backend-svc:3001/todos
kind: ConfigMap
metadata:
  name: app-config
  namespace: project
---
apiVersion: v1
kind: Service
metadata:
  name: todo-app-svc
  namespace: project
spec:
  ports:
  - port: 1235
    protocol: TCP
    targetPort: 3000
  selector:
    app: todoapp
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-app
  namespace: project
spec:
  replicas: 1
  selector:

  ....more
```

```bash
kubectl get ing -n project
NAME               CLASS    HOSTS   ADDRESS         PORTS   AGE
todo-app-ingress   <none>   *       34.144.209.36   80      33m
```

Enterypoint: http://34.144.209.36
