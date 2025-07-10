# 2.9 The project, step 12

> Created a CronJob that generates a new todo every hour to reminds to do 'Read <URL>', here <URL> is a Wikipedia article that was decided by the job randomly.

> Pulled a curl container and that adds todo via todo-backend service(http://todo-backend-svc.project:3001/todos )

```yaml
..
spec:
  schedule: "0 * * * *" # Hourly schedule
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: wikipedia-todo-creator
              image: curlimages/curl:latest
              command: ["/bin/sh", "-c"]
              args:
                - |
                  URL=$(curl -sLI -o /dev/null -w '%{url_effective}' https://en.wikipedia.org/wiki/Special:Random)
                  echo "Adding todo: Read $URL"
                  curl http://todo-backend-svc.project:3001/todos -X POST -H "Content-Type: application/json" -d "{\"todo\": \"Read $URL\"}"
          restartPolicy: OnFailure
```
