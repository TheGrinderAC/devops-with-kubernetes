# 3.11 Resource limit and scaling

```sh
...
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

### 📘 Summary: Kubernetes Autoscaling & Resource Management

This lesson focuses on the **autoscaling capabilities** in Kubernetes and how to manage **resources** effectively to ensure applications are performant and cost-efficient.

---

#### 🚀 Horizontal Pod Autoscaler (HPA)

- HorizontalPodAutoscaler

```
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cpushredder-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cpushredder-dep
  minReplicas: 1
  maxReplicas: 6
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 30
```

- **Purpose**: Automatically scales the number of pods based on observed CPU/memory usage or custom metrics.
- **Default Scale Down Delay**: 300 seconds.
- **Customization**:

  ```yaml
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 30
  ```

- **Use Case**: Great for workloads that spike and drop over time (e.g., APIs, services with fluctuating traffic).

---

#### ⚙️ Cluster Autoscaler (GKE Specific)

- **Scales nodes** in your cluster up/down automatically.

- **Command Example**:

  ```bash
  gcloud container clusters update dwk-cluster \
    --zone=europe-north1-b \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=5
  ```

- **Note**: Pods may be **disrupted** during scaling (moved to different nodes).

---

#### 🛡️ Pod Disruption Budget (PDB)

- Ensures **availability during node/pod disruption**.
- **Example**: No more than 50% of pods can be unavailable.

  ```yaml
  apiVersion: policy/v1beta1
  kind: PodDisruptionBudget
  metadata:
    name: example-app-pdb
  spec:
    maxUnavailable: 50%
    selector:
      matchLabels:
        app: example-app
  ```

---

#### 📈 Vertical Pod Autoscaler (VPA)

- Automatically adjusts the **CPU and memory requests/limits** of a pod.
- Use it when app resource requirements are **not well known or change over time**.
- Helps ensure **efficient resource utilization** on nodes.

---

#### 🧠 Key Takeaways from the Video

- **Requests** = Minimum amount of resource guaranteed to a container.
- **Limits** = Maximum amount the container can use.
- **Namespace Quotas**:

  - You can restrict total resources used within a namespace.
  - Helps isolate environments (e.g., dev/stage/prod).

- Avoid setting **limits too low** (causes OOMKilled).
- Avoid **no limits** (a noisy neighbor can starve others).

---

### ✅ Best Practices

1. **Set realistic resource requests/limits** based on benchmarking.
2. Use **HPA** for dynamic scaling of workloads.
3. Use **Cluster Autoscaler** for infrastructure efficiency.
4. Apply **PDBs** to minimize downtime during voluntary disruptions.
5. Consider **VPA** if you want Kubernetes to manage pod sizes for you.
6. Use **namespace quotas** to avoid overconsumption in shared clusters.

---

## Cluster Autoscaler (GKE)

- Auto-adjusts node count (e.g., 1–5 nodes).
- Example:

  ```bash
  gcloud container clusters update dwk-cluster \
    --zone=europe-north1-b \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=5
  ```

## Pod Disruption Budget (PDB)

- Prevents too many pods from being evicted.
- Example:

  ```yaml
  apiVersion: policy/v1beta1
  kind: PodDisruptionBudget
  metadata:
    name: example-app-pdb
  spec:
    maxUnavailable: 50%
    selector:
      matchLabels:
        app: example-app
  ```

## Vertical Pod Autoscaler (VPA)

- Adjusts CPU/memory requests automatically.
- Useful for unknown or changing workloads.

## Resource Requests & Limits (from video)

- `requests` = guaranteed baseline
- `limits` = upper boundary
- Don't set limits too low → `OOMKilled`
- Use namespace quotas to control usage

## Best Practices

- Benchmark to set resource values.
- Use HPA for reactive pod scaling.
- Use Cluster Autoscaler to scale infra.
- PDBs reduce disruption during scale.
- VPA ensures optimal resource use.
- Namespace quotas prevent noisy neighbors.
