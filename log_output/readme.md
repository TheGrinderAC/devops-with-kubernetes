# 2.5. Documentation and ConfigMaps

> Created a ConfigMap for the "Log output" application. The ConfigMap should define one file information.txt and one env variable MESSAGE.

#

[configmap.yaml](./manifests/configmap.yaml)

```Yaml
...
data:
  MESSAGE: "hello world"
  information.txt: |
    this text is from file
```

#

[deployment](./manifests/deployment.yaml) added++

```yaml

---
spec:
  volumes:
    - name: config-volume
      configMap:
        name: log-output-config
  containers:
    - name: log-output
      image: bidhe1/log_output:latest
      ports:
        - containerPort: 3000
      env:
        - name: MESSAGE
          valueFrom:
            configMapKeyRef:
              name: log-output-config
              key: MESSAGE
      volumeMounts:
        - name: config-volume
          mountPath: /app/config
```
