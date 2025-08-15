# 5.6. Trying serverless

**Create a New, Compatible Cluster:** A new k3d cluster was created with a compatible Kubernetes version (`v1.32.0-k3s1`) using the following command:

    ```
    k3d cluster create --image rancher/k3s:v1.32.0-k3s1 --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2 --k3s-arg "--disable=traefik@server:0"
    ```

**installed Knative and Istio:** Knative and Istio were re-installed using the following commands in the correct order:

    ```
    kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.19.0/serving-crds.yaml
    kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.19.0/serving-core.yaml
    kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.19.0/istio.yaml
    kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.19.0/net-istio.yaml
    ```

## Usages

applied `kubectl apply -f hello.yaml`

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hello
spec:
  template:
    spec:
      containers:
        - name: hello
          image: bidhe1/hello:2 #
          securityContext:
            allowPrivilegeEscalation: false
            seccompProfile:
              type: RuntimeDefault
            capabilities:
              drop: ["ALL"]
```

```sh
$kubectl get ksvc
NAME    URL                                        LATESTCREATED   LATESTREADY   READY   REASON
hello   http://hello.default.172.18.0.3.sslip.io   hello-00001     hello-00001   True
$ curl -H "Host: hello.default.172.18.0.3.sslip.io" http://localhost:8081
Hello, Old World!
```

### Traffic Splliting:

applied
kubectl apply -f [hello.yaml](hello.yaml)

```yaml
...
          image: bidhe1/hello:1
          securityContext:
            allowPrivilegeEscalation: false
            seccompProfile:
              type: RuntimeDefault
            capabilities:
              drop: ["ALL"]
  traffic:
    - latestRevision: true
      percent: 50
    - latestRevision: false
      percent: 50
      revisionName: hello-00001
```

```
$ kubectl get revisions
NAME          CONFIG NAME   GENERATION   READY   REASON   ACTUAL REPLICAS   DESIRED REPLICAS
hello-00001   hello         1            True             0                 0
hello-00002   hello         2            True             1                 1

$ curl -H "Host: hello.default.172.18.0.3.sslip.io" http://localhost:8081
Hello, Old World!
$ curl -H "Host: hello.default.172.18.0.3.sslip.io" http://localhost:8081
Hello, New World!
```
