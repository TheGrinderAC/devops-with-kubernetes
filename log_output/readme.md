# 1.1 Kubernetes Deployment Console Logs

### Docker Build

```bash
PS E:\kubernaties_sub\Kubernet\log_output> docker build -t bidhi1/log_output .
```

```dockerfile
[+] Building 292.6s (8/9)                                                                 docker:desktop-linux
 => [internal] load .dockerignore                                                                         0.0s
 => => transferring context: 2B
 => [internal] load build definition from Dockerfile                                                      0.0s
 => => transferring dockerfile: 32B
 => [internal] load metadata for docker.io/library/node:16-alpine                                        0.0s
 => [1/5] FROM docker.io/library/node:16-alpine                                                          0.0s
 => [internal] load build context                                                                         0.0s
 => => transferring context: 68B
 => CACHED [2/5] WORKDIR /app                                                                             0.0s
 => CACHED [3/5] COPY package*.json ./                                                                    0.0s
 => CACHED [4/5] RUN npm install                                                                          0.0s
 => [5/5] COPY . .                                                                                      292.5s
 => exporting to image                                                                                    0.0s
 => => exporting layers                                                                                   0.0s
 => => writing image sha256:4b8878931f297e2062378c01d88700901ac5cb388db03067f40e8faca6eb7e8e             0.0s
 => => naming to docker.io/bidhi1/log_output                                                              0.0s
```

### Docker Push

```bash
PS E:\kubernaties_sub\Kubernet\log_output> docker push bidhe1/log_output
```

```yaml
Using default tag: latest
The push refers to repository [docker.io/bidhe1/log_output]
98c4889b578e: Pushed
fe07684b16b8: Mounted from bidhe1/youtube-dl
36759bba68ee: Pushed
2506673f5536: Pushed
37b7c8f2de55: Pushed
d4aa345548c0: Pushed
5432aa916e08: Pushed
latest: digest: sha256:4b8878931f297e2062378c01d88700901ac5cb388db03067f40e8faca6eb7e8e size: 856
```

## Kubernetes Configuration

### Cluster Setup

```bash
# k3d setup
PS E:\kubernaties_sub\Kubernet\log_output> k3d cluster create -a 2

# Set cluster server endpoint (cuz Kubernetes control plane was running at https://host.docker.internal:56124)
PS E:\kubernaties_sub\Kubernet\log_output> kubectl config set-cluster k3d-k3s-default --server=https://localhost:56124
```

### Deployment Creation

```bash
PS E:\kubernaties_sub\Kubernet\log_output> kubectl create deployment logoutput --image=bidhe1/log_output
```

```yaml
deployment.apps/logoutput created
```

## Application Logs

### Real-time Log Output

```bash
PS E:\kubernaties_sub\Kubernet\log_output> kubectl logs -f logoutput-8cb7cb89f-plr9l
```

```javascript
2025-07-02T15:23:42.250Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:23:47.256Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:23:52.259Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:23:57.265Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:24:02.269Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:24:07.301Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:24:12.307Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:24:17.310Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:24:22.313Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:24:27.318Z: 4a15691e-2546-462e-83ae-804624682d4f
2025-07-02T15:24:32.320Z: 4a15691e-2546-462e-83ae-804624682d4f
```

### Cleanup

```bash
PS E:\kubernaties_sub\Kubernet\log_output> kubectl delete deployment logoutput
```

```yaml
deployment.apps "logoutput" deleted
```
