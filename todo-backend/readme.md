# 3.5. The project, step 14

> Configured both projects to use Kustomize, and deployed it to Google Kubernetes Engine.

```js
$ kubectl kustomize .

...

        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              key: POSTGRES_PASSWORD
              name: postgres-secret
        image: bidhe1/todo-backend:latest
        imagePullPolicy: Always
        name: todo-backend
        ports:
        - containerPort: 3001
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: project
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  serviceName: postgres-service
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - envFrom:
        - secretRef:
            name: postgres-secret
        image: postgres
        name: postgres
        ports:
        - containerPort: 5432
        volumeMounts:
        - mountPath: /var/lib/postgresql/data
          name: postgres-storage
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: random-wikipedia-todo-cronjob
  namespace: project
spec:
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - args:
            - |
              URL=$(curl -sLI -o /dev/null -w '%{url_effective}' https://en.wikipedia.org/wiki/Special:Random)
              echo "Adding todo: Read $URL"
              curl http://todo-backend-svc.project:3001/todos -X POST -H "Content-Type: application/json" -d "{\"todo\": \"Read $URL\"}"
            command:
            - /bin/sh
            - -c
            image: curlimages/curl:latest
            name: wikipedia-todo-creator
          restartPolicy: OnFailure
  schedule: 0 * * * *
```
