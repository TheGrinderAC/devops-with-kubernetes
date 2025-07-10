# 2.8. The project, step 11

> Created a database and save the todos there. Again, the database is be defined as a stateful set with one replica.

> Used Secrets with SOPS to have the backend access the database.

- Stateful Postgres

1.  > created [postgres-statefulset.yaml](./manifests/postgres-statefulset.yaml) for standalone statful postgres pod with 1 replication

2.  > encrpted secret.yaml with age-gen public key creation X SOPS to encrpt it into secret.enc.yaml

3.  > changed index.js to use the postgress config

#

- SOPS encryption/decryption with a public key present in key.txt

```bash
$ age-keygen -o key.txt

$ cat key.txt
# created: 2025-07-10T01:02:38Z
# public key: XXX
$ sops --encrypt  --age MyPublicKey(that stats with age) --encrypted-regex '^(data)$'  secret.yaml > secret.enc.yaml
$ export SOPS_AGE_KEY_FILE=$(pwd)/key.txt # importent need for decryption
# should be deployed like this
$ sops --decrypt secret.enc.yaml | kubectl apply -f -

# other stuff
$ sops --decrypt secret.enc.yaml # to decrypt and see inside the shell
$ sops --decrypt secret.enc.yaml > secret.yaml # decrypt and saved inside secret.yaml
```
