# 1.5. The project, step3

### Deployment Creation

```bash
$  kubectl apply -f manifests/deployment.yaml
```

```yaml
deployment.apps/todo-app created
```

## Application Logs

```javascript
NAME                        READY   STATUS              RESTARTS   AGE
todo-app-6c577f78d8-mrztp   0/1     ContainerCreating   0          9s
```

```bash
$ kubectl port-forward todo-app-6c577f78d8-mrztp 3003:3000
```

```javascript
Forwarding from 127.0.0.1:3003 -> 3000
Forwarding from [::1]:3003 -> 3000
Handling connection for 3003
```

![Application Screenshot](./image.png)
