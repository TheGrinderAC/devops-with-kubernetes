# 1.3. Declarative approach

### Deployment Creation

```bash
$ kubectl apply -f deployment.yaml
```

```yaml
deployment.apps/log-output created
```

## Application Logs

```javascript
NAME                          READY   STATUS    RESTARTS   AGE
log-output-65545d5d8f-7wxpt   1/1     Running   0          6s
```

```bash
$ kubectl logs -f log-output-65545d5d8f-7wxpt
```

```javascript
2025-07-03T13:12:08.529Z: ee3656a3-c61a-4803-84db-9eded653efd6
2025-07-03T13:12:13.534Z: ee3656a3-c61a-4803-84db-9eded653efd6
2025-07-03T13:12:18.539Z: ee3656a3-c61a-4803-84db-9eded653efd6
```
