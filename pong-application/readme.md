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

> Without the initContainer, I was facing a race condition:
>
> 1. Simultaneous Startup: Kubernetes tried to start pong-application pod and the postgres pod at the same time.
> 2. Application Dependency: Your pong-application needs the database to be running to initialize itself correctly.
> 3. Application Crash: The pong-application would start, immediately try to connect to the database, fail because the database wasn't ready yet, and then likely crash or enter an error state.
> 4. Readiness Probe Fails: The readinessProbe would wait for initialDelaySeconds (30 seconds) and then start checking the /healthz endpoint. By this time, the application was already in a crashed/unhealthy state from its failed attempt to connect to the database. Therefore, the probe would fail, and Kubernetes would never mark the pod as "Ready."
>
> The readinessProbe was correctly reporting that the application was not ready, but it couldn't solve the underlying reason why it wasn't ready—the database dependency was not met at startup.
>
> **The Solution: The initContainer**
>
> The initContainer solves this by enforcing a strict startup order.
>
> 1. Block and Wait: When the pong-application pod is scheduled, Kubernetes runs the initContainer (check-db) first.
> 2. Database Check: This container runs a simple loop: until pg_isready -h postgres-service .... This command does nothing but check if the PostgreSQL database is accepting connections. It will not exit until the check is successful.
> 3. Guaranteed Dependency: The main pong-application container is not started until the `initContainer` completes successfully.
> 4. Healthy Startup: By the time the pong-application container finally starts, the initContainer has guaranteed that the database is ready and waiting. The application can now connect to the database without any issues, start up correctly, and be prepared to respond to the readinessProbe.

#

-

> - And added another ReadinessProbe for Log output application. It should be ready when it can receive data from the Ping-pong application.for 3.4. Rewritten routing of this app
