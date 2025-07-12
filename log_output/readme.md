# 3.4. Rewritten routing

> 1. chnge this route to root path / in the [pong-application](../pong-application/), cause we were not forced to reflect the cluster-level URL structures in the applications, and instead the app itself could provide the behavior in the root path /. Thanks to the flexibility of the Gateway API, this can be easily done by route rewriting.

```js
-- app.get("/pingpong", async (req, res) => {

++ app.get("/", async (req, res) => {
  const result = await client.query(
    "INSERT INTO pongs (count) VALUES (1) RETURNING count"
  );
  const currentCount = await client.query("SELECT COUNT(*) FROM pongs");
  res.send(`pong ${currentCount.rows[0].count}`);
});
```

Chnaged in the routes.yaml for http rewrites:

```yaml
---
spec:
  parentRefs:
    - name: log-gateway
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: log-output-svc
          port: 80
    - matches:
        - path:
            type: PathPrefix
            value: /pingpong
      filters:
        - type: URLRewrite
          urlRewrite:
            path:
              type: ReplacePrefixMatch
              replacePrefixMatch: /
      backendRefs:
        - name: pong-application-svc
          port: 2345
    - matches:
        - path:
            type: PathPrefix
            value: /pong-count # no rewrite just go to pong-application-svc's /pong-count that exits already!
      backendRefs:
        - name: pong-application-svc
          port: 2345
```
