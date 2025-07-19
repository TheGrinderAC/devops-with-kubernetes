# 4.2. The project, step 21(livenessProb+readinessProbe)

#### Note: I've added an initContainer to the pong-application deployment. This will ensure that the pong-application only starts after the postgres-service is available, which should resolve the "ENOTFOUND" error.

```yaml
initContainers:
  - name: check-db
    image: busybox:1.28
    command:
      [
        "sh",
        "-c",
        "until nc -z postgres-service 5432; do echo waiting for postgres; sleep 2; done;",
      ]
```

```yaml
livenessProbe:
  httpGet:
    path: /livez
    port: 3001
  initialDelaySeconds: 15
  periodSeconds: 20
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: /readyz
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```
