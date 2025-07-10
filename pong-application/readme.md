# 2.7. Stateful applications

> Postgres database as a stateful set (with oen replica) and save the Ping-pong application counter into the database.

[stand-alone pod that runs a Postgres image](./manifests/postgres-statefulset.yaml)

```yaml
# this will craete a standalon pod
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: exercises
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  clusterIP: None
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: exercises
spec:
  serviceName: "postgres-service"
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres
          ports:
            - containerPort: 5432
          envFrom:
            - secretRef:
                name: postgres-secret
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 1Gi
```

```
  $kubectl run -it --rm --restart=Never --image=postgres --namespace=exercises psql-for-debugging -- sh
If you don't see a command prompt, try pressing enter.


#
# psql postgresql://postgres:postgres@postgres-service:5432/postgres
psql (17.5 (Debian 17.5-1.pgdg120+1))
Type "help" for help.

postgres=# /d
postgres-# \d
              List of relations
 Schema |     Name     |   Type   |  Owner
--------+--------------+----------+----------
 public | pongs        | table    | postgres
 public | pongs_id_seq | sequence | postgres
(2 rows)

postgres-#

```

#

Also used adminer to view the pg ui with this path using [pgui.ymal](./manifests/pgui.yaml) and added this to logout's [ingress](../log_output/manifests/ingress.yaml)

```yaml
..
          - path: /adminer
            pathType: Prefix
            backend:
              service:
                name: adminer-service
                port:
                  number: 3456
```

```yaml
System:PostgreSQL
Server:postgres-service
Username:postgres
Password:postgres
Database:postgres
```

![img](./image.png)
