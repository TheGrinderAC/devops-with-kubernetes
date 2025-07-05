# 1.10. Even more services

The application is now split into two containers within a single pod:

- One container generates a random string on startup and writes a line with the random string and timestamp every 5 seconds into the file `/app/logs/output.log`.
- The other container reads that file and provides its content via an HTTP GET endpoint, accessible at [http://localhost:8081/](http://localhost:8081/).

#

using this cluster

```javascript
 k3d cluster create  -p 8081:80@loadbalancer --agents 2
```
