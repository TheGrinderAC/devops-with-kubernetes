# 4.1. Readines probe

> Create a ReadinessProbe for the Ping-pong application. It should be ready when it has a connection to the database.

```yaml
readinessProbe:
  initialDelaySeconds: 30
  periodSeconds: 7
  httpGet:
    path: /healthz
    port: 3000
```

-

```yaml
spec:
  initContainers:
    - name: check-db
      image: postgres:9.6
      command: [
          "sh",
          "-c",
          "until pg_isready -h postgres-service -p 5432;
          do echo waiting for database; sleep 2; done;",
        ]
```

#### Note: I've added an initContainer to the pong-application deployment. This will ensure that the pong-application only starts after the postgres-service is available, which should resolve the "ENOTFOUND" error.

> And another ReadinessProbe for Log output application. It should be ready when it can receive data from the Ping-pong application.for 3.4. Rewritten routing of this app
