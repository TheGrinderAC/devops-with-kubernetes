# 2.1. Connecting pods

> The Log output application and the Ping pong application with HTTP. So, instead of sharing data via files, used an HTTP GET endpoint in the Ping pong app to respond with the number of pongs for the Log output app. Removed the volume between the two applications for the time being.

#

This is the endpoint the Log_ouput application is fetching:

```js
const PONG_APP_URL = "http://pong-application-svc:2345/pong-count";
```
