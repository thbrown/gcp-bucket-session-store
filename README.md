# GCB cloud storage bucket base session store for express-session

## Drawbacks

- It's much slower than alternatives

## Advantages

- Bucket storage is highly scalable
- Gradually cost scalable

## Setup

You'll want to make sure the files in your bucket aren't cached. This is a setting on the bucket.

You'll want to make sure your server has permission to access Storage. If you are running from a gcp compute instance, the appropriate "Access Scope" is read/write if the modifyCustomTime param is set to false (default) or full if modifyCustomTime is set to true.

## TTL

Set a lifecycle event on your bucket. Constructor accepts a boolean option modifyCustomTime, which will modify metadata on the on the file to indicate the last modification time. Then you can create a lifecycle event for your bucket using DaysSinceCustomTime (https://cloud.google.com/storage/docs/lifecycle)
