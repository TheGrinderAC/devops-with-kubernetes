# 1.11. Persisting data

> Let's share data between "Ping-pong" and "Log output" applications using persistent volumes. Create both a PersistentVolume and PersistentVolumeClaim and alter the Deployment to utilize it. As PersistentVolumes are often maintained by cluster administrators rather than developers and those are not application specific you should keep the definition for those separated, perhaps in own folder. Save the number of requests to the "Ping-pong" application into a file in the volume and output it with the timestamp and the random string when sending a request to our "Log output" application. In the end, the two pods should share a persistent volume between the two applications. So the browser should display the following when accessing the "Log output" application:

#

```bash
$ k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
```

```bash
$ kubectl config set-cluster k3d-k3s-default --server=https://localhost:54342

> Cluster "k3d-k3s-default" set.
```

#

create the local Persisting data volume inside the the agent 0 node:
(as long as cluster not deleted data will persist when pods deleted/created)

```bash
$ docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/data
```

```bash
$ kubectl apply -f shared_vol
```

> look at [persist_volume](./shared_vol/persistent-volume.yaml) and the volume [claim](./shared_vol/persistent-volume-claim.yaml)

Now lets apply the new deployments of [log-output](./manifests/deployment.yaml) & [pong-application](../pong-application/manifests/deployment.yaml)

```bash
$ kubectl apply -f log_output/manifests
$ kubectl apply -f pong-application/manifests
```
