# 5.7. Deploy to serverless

**Compatible Cluster:**

    ```
    k3d cluster create --image rancher/k3s:v1.32.0-k3s1 --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2 --k3s-arg "--disable=traefik@server:0"
    ```

**installed Knative and Istio:** :

    ```
    kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.19.0/serving-crds.yaml
    kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.19.0/serving-core.yaml
    kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.19.0/istio.yaml
    kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.19.0/net-istio.yaml

    ```

```yaml
$ kubectl create namespace exercises
namespace/exercises created

$ kubectl apply -f .

service.serving.knative.dev/pong created
secret/postgres-secret created
service/postgres-service created
statefulset.apps/postgres created
```

```

$ kubectl get ksvc
NAME    URL                                        LATESTCREATED   LATESTREADY   READY   REASON
hello   http://hello.default.172.18.0.3.sslip.io   hello-00002     hello-00002   True

$ kubectl get ksvc -n exercises
NAME   URL                                         LATESTCREATED   LATESTREADY   READY   REASON
pong   http://pong.exercises.172.18.0.3.sslip.io   pong-00001      pong-00001    True

$ curl -H "Host: pong.exercises.172.18.0.3.sslip.io" http://localhost:8081
pong 1
$ curl -H "Host: pong.exercises.172.18.0.3.sslip.io" http://localhost:8081
pong 2
$ curl -H "Host: pong.exercises.172.18.0.3.sslip.io" http://localhost:8081
pong 3

```
