# 3.1. Pingpong GKE(GCP Deployment)

![img](./image.png)

```bash
$  kubectl apply -k  manifests
```

> The kustomization includes the LoadBalancer service along with the previous manifest files.

```js
$ kubectl get all -n  exercises

NAME                                    READY   STATUS    RESTARTS        AGE
pod/pong-application-84d877cb8d-kx4w7   1/1     Running   3 (4m23s ago)   4m46s
pod/postgres-0                          1/1     Running   0               4m45s

NAME                           TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)        AGE
service/pong-application-lb    LoadBalancer   34.118.229.193   34.66.241.100   80:32664/TCP   4m51s
service/pong-application-svc   ClusterIP      34.118.225.205   <none>          2345/TCP       4m49s
service/postgres-service       ClusterIP      None             <none>          5432/TCP       4m48s

NAME                               READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/pong-application   1/1     1            1           4m48s

NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/pong-application-84d877cb8d   1         1         1       4m49s
```

##

> - postgres also working fine

```
$  kubectl logs postgres-0 -n exercises

...
2025-07-12 18:34:04.412 UTC [1] LOG:  starting PostgreSQL 17.5 (Debian 17.5-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
2025-07-12 18:34:04.415 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2025-07-12 18:34:04.417 UTC [1] LOG:  listening on IPv6 address "::", port 5432
2025-07-12 18:34:04.466 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2025-07-12 18:34:04.473 UTC [62] LOG:  database system was shut down at 2025-07-12 18:34:04 UTC
2025-07-12 18:34:04.483 UTC [1] LOG:  database system is ready to accept connections
2025-07-12 18:39:04.582 UTC [60] LOG:  checkpoint starting: time
2025-07-12 18:39:13.735 UTC [60] LOG:  checkpoint complete: wrote 93 buffers (0.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=9.077 s, sync=0.007 s, total=9.153 s; sync files=49, longest=0.002 s, average=0.001 s; distance=416 kB, estimate=416 kB; lsn=0/154D2F0, redo lsn=0/154D260
2025-07-12 18:44:04.794 UTC [60] LOG:  checkpoint starting: time
2025-07-12 18:44:05.868 UTC [60] LOG:  checkpoint complete: wrote 11 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.016 s, sync=0.004 s, total=1.077 s; sync files=9, longest=0.003 s, average=0.001 s; distance=9 kB, estimate=375 kB; lsn=0/154F7A0, redo lsn=0/154F71
```
