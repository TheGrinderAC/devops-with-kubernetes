# 1.9. More services

added :

```yaml
    - path: /pingpong
    pathType: Prefix
    backend:
        service:
        name: pong-application-svc
        port:
            number: 2345

```
