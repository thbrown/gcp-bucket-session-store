# GCB cloud storage bucket base session store for express-session

## Drawbacks

- It's much slower than alternatives

## Advantages

- Bucket storage is highly scalable
- Gradually cost scalable

## Important setup

You'll want to make sure the files in your bucket aren't cached, you can do this by

## TTL

Set a lifecycle event on your bucket. Constructor accepts a boolean option modifyCustomTime, which will modoify the timestamp opn teh bucke each time the session in written. Then you can create a lifecycle event for your bucket using DaysSinceCustomTime (https://cloud.google.com/storage/docs/lifecycle)
