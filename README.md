# GCB cloud storage bucket session store for express-session

## Drawbacks

- It's much slower than alternatives

## Advantages

- Bucket storage is highly scalable
- Gradually cost scalable, pay for only what you use
- Storage is cheap

## Setup

You'll want to make sure the files in your bucket aren't cached. I _think_ this is controlled my metadata setting on the file/bucket.

You'll want to make sure your server has permission to access GCP Storage API.

Some examples:

If you are running from a gcp compute instance, the appropriate "Access Scope" is read/write if the modifyCustomTime param is set to false (default) or full if modifyCustomTime is set to true.

If you are running on a local developer instance, you can auth with your Google credentials using the following command:

```
gcloud auth application-default login
```

For details and other ways to authenticate, see https://cloud.google.com/docs/authentication/provide-credentials-adc

## TTL

Set a lifecycle event on your bucket. Constructor accepts a boolean option modifyCustomTime, which will modify metadata on the on the file to indicate the last modification time. Then you can create a lifecycle event for your bucket using DaysSinceCustomTime (https://cloud.google.com/storage/docs/lifecycle)
