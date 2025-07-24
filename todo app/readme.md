# 4.6. The project, step 23

The backend should send a message to NATS on saving or updating todos
The broadcaster should subscribe to NATS messages
The broadcaster should send the message forward to Discord

1. Setup NATS in kubernaties cluster with helm

```
helm install --set auth.enabled=false my-nats oci://registry-1.docker.io/bitnamicharts/nats
```

2. Created a brodcaster app to handle the NATS connections.
3. Made changes in todo-backend for the intregration

> Skipped setting up prometheus with grafana for monitoring the NATS
