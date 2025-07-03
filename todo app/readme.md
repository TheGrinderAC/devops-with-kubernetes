# 1.4. The project, step2

### Deployment Creation

```bash
$  kubectl apply -f deployment.yaml
```

```yaml
deployment.apps/todo-app created
```

## Application Logs

```javascript
NAME                          READY   STATUS    RESTARTS   AGE
log-output-65545d5d8f-7wxpt   1/1     Running   0          15m
todo-app-7fdc7cb987-2v6wf     1/1     Running   0          12s
```

```bash
$  kubectl logs -f todo-app-7fdc7cb987-2v6wf
```

```javascript
> todo-app@1.0.0 start
> node index.js

Server started in port 3000
```
