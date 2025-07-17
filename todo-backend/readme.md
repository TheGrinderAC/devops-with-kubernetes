# 3.10. The project, step 18(DB Backup & Secrets)

> [Created CronJob makes a backup of the todo database every 24 hours and saves it to Google Cloud Storage.](./manifests/pg_backup.yaml)

## 1. Created the GCS service account key file

```bash
$ kubectl create secret generic gcs-secret --from-file=key.json

secret/gcs-secret created

# This step creates a Kubernetes secret containing my Google Cloud Storage (GCS) service account credentials. The backup CronJob uses this secret to authenticate and upload database backups to your GCS bucket.
```

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
