# 2.6. The project, step 10

> [project](.) has no hard coded ports, URL or other configurations in the source code.!

- [configmap](./manifests/configmap.yaml)

```yaml
..
data:
  PORT: "3000"
  IMAGE_DIR: "/app/storage"
  IMAGE_NAME: "image.jpg"
  CACHE_TIMEOUT: "600000"
  IMAGE_API_URL: "https://picsum.photos/1200"
  TODO_BACKEND_URL: "http://todo-backend-svc:3001/todos"

```

- [Deployment](./manifests/deployment.yaml)

```yaml
..
    spec:
      containers:
        - name: todoapp
          image: bidhe1/todo_app:latest
          envFrom:
            - configMapRef:
                name: app-config
          volumeMounts:
            - name: image-cache
              mountPath: /app/storage
            - name: config-volume
              mountPath: /app/config
      volumes:
        - name: image-cache
          emptyDir: {}
        - name: config-volume
          configMap:
            name: app-config
```
