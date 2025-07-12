# 3.3. To the Gateway

> Replaced the Ingress with Gateway API in this log_output application.

[gateway](./manifests/gateway.yaml), [routes](./manifests/routes.yaml), [service](./manifests/service.yaml)

- The gateway just defines where and how the load balancers listen for traffic,
  The routing rules can be defined with HTTPRoute resources & also Service port type has to be ClusterIP.

```sh
 $ kubectl apply -k  manifests
```

```js
$ kubectl get gateway log-gateway  -n  exercises

NAME          CLASS                            ADDRESS        PROGRAMMED   AGE
log-gateway   gke-l7-global-external-managed   34.8.122.249   True         26m

```

- EnteryPonit-> http://34.8.122.249/
  ![img](./image.png)
