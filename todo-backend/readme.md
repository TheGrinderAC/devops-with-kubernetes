# 3.10. The project, step 18(DB Backup & Secrets)

> [Created CronJob makes a backup of the todo database every 24 hours and saves it to Google Cloud Storage.](./manifests/pg_backup.yaml)

## 1. Created the GCS service account key file

```bash
$ kubectl create secret generic gcs-secret --from-file=key.json=key.json -n project  --dry-run=client -o yaml | kubectl apply -f -

secret/gcs-secret created

# This step creates a Kubernetes secret containing my Google Cloud Storage (GCS) service account credentials. The backup CronJob uses this secret to authenticate and upload database backups to your GCS bucket.
```

> NOTE: I have to create a new service account, give permission and then generate key!

```
 $ gcloud iam service-accounts create postgres-backup-sa --display-name="PostgreSQL Backup Service Account"

 $ gcloud projects add-iam-policy-binding master-coder-465618-q6 --member="serviceAccount:276596420322-compute@developer.gserviceaccount.com" --role="roles/storage.admin"

  $ gcloud iam service-accounts keys create key.json \
    --iam-account=postgres-backup-sa@master-coder-465618-q6.iam.gserviceaccount.com
```

#

## Backup Storage

- **Location**: `gs://postgress_backup_sql/` (#bucket_name = postgress_backup_sql )
- **Format**: `backup-YYYY-MM-DD-HH-MM-SS.sql.gz`
- **Retention**: 30 days
- **Compression**: gzip (typically 70-80% size reduction)

# Test

```sh
$ kubectl create job --from=cronjob/pg-backup-cron pg-backup-manual-$(Get-Date -UFormat %s)

job.batch/pg-backup-manual-1752705709 created
```

This triggers a one-time backup without waiting for the scheduled time!!

```sh
kubectl get pods -n project --watch
NAME                                           READY   STATUS      RESTARTS   AGE
pg-backup-test-tkskc                           0/1     Completed   0          3m17s
postgres-0                                     1/1     Running     0          160m
random-wikipedia-todo-cronjob-29211960-gkzrl   0/1     Completed   0          154m
random-wikipedia-todo-cronjob-29212020-mg22r   0/1     Completed   0          94m
random-wikipedia-todo-cronjob-29212080-wmxfx   0/1     Completed   0          34m
todo-app-687754fb6b-qvlln                      1/1     Running     0          3h27m
todo-backend-dep-665858d95b-mhm5c              1/1     Running     0          3m44s
```
