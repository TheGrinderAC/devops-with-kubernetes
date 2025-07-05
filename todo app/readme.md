# 1.12. The Project with Image Caching

> **Image Caching**: Smart caching of random images from Picsum Photos in kubernaties cluster with emptydir{}, persist accross Crash/Update of container except restart

## Caching Logic

1. **First Request**: Fetches image from Picsum Photos → Caches locally
2. **Subsequent Requests**: Serves from cache (10-minute TTL)
3. **Cache Expiry**: Automatically fetches new image
4. **Error Handling**: Falls back to stale cache if external API fails

## Deployment

Uses Kubernetes with `emptyDir` volume for optimal caching:

- Fast local storage
- Persists across container restarts
- Auto-cleanup when pods terminate
- No storage quota concerns

```bash
# build dockerfile and push into dockerhub
# Have the kubernaties cluster running then Deploy to Kubernetes
kubectl apply -f deployment.yaml
```

```
emptyDir: {} volume mounted at /app/storage

10-minute image caching logic

Images fetched from picsum.photos/1200
```

Scenario Breakdown

```
1. Fresh Pod Start (First Time)
Pod starts → Container starts → /app/storage is empty
↓
First /image request → No cached file exists
↓
Fetches new image from picsum.photos → Saves to /app/storage/image.jpg
↓
Serves image to client
```

```
2. Subsequent Requests (Within 10 Minutes)
/image request → Checks /app/storage/image.jpg
↓
File exists + less than 10 minutes old
↓
Serves cached image (fast response, no external API call)
```

```
3. Cache Expiry (After 10 Minutes)
/image request → Checks /app/storage/image.jpg
↓
File exists but older than 10 minutes
↓
Fetches new image from picsum.photos → Overwrites old image
↓
Serves new image

```

```yaml
4. Container Restart (App Crash/Update)
Container crashes/restarts → Pod stays alive → emptyDir persists
↓
New container starts → /app/storage still contains cached image
↓
Cache continues working normally ✅
```

```python
5. Pod Restart/Rescheduling
Pod gets deleted/rescheduled → emptyDir is destroyed
↓
New pod starts on same/different node → /app/storage is empty again
↓
Back to scenario #1 (fresh start)
```
