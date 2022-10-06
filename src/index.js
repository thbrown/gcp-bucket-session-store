const { Store, SessionData } = require("express-session");
const { Storage } = require("@google-cloud/storage");
const e = require("express");

const noop = () => {};

class GCPBucketStore extends Store {
  constructor(options) {
    super();
    if (options.bucketName === undefined) {
      throw new Error("bucketName is a required option");
    }
    this.bucketName = options.bucketName;
    this.modifyCustomTime = options.modifyCustomTime || false;
    this.storage = new Storage();
  }

  // DaysSinceCustomTime (https://cloud.google.com/storage/docs/lifecycle)

  set(sid, sess, cb = noop) {
    // Write the session to the bucket
    const myBucket = this.storage.bucket(this.bucketName);
    const file = myBucket.file(sid);
    const content = JSON.stringify(sess);

    file.save(
      content,
      {
        metadata: {
          cacheControl: "no-cache",
        },
      },
      function (e) {
        if (e) {
          return cb(e);
        }

        // Set timestamp to enable TTL via lifecycle event DaysSinceCustomTime
        if (this.modifyCustomTime) {
          const date = new Date();
          const formatted = date.toISOString(); // RFC 3339
          file.setMetadata(
            {
              "Custom-Time": formatted,
            },
            function (e2, apiResponse) {
              if (e2) {
                return cb(e2);
              } else {
                return cb(null, "OK");
              }
            }
          );
        } else {
          return cb(null, "OK");
        }
      }
    );

    /*
    let args = [this.prefix + sid];

    let value;
    try {
      value = this.serializer.stringify(sess);
    } catch (er) {
      return cb(er);
    }
    args.push(value);

    let ttl = 1;
    if (!this.disableTTL) {
      ttl = this._getTTL(sess);
      args.push("EX", ttl);
    }

    if (ttl > 0) {
      this.client.set(args, cb);
    } else {
      // If the resulting TTL is negative we can delete / destroy the key
      this.destroy(sid, cb);
    }
    */
  }

  get(sid, cb = noop) {
    try {
      const myBucket = this.storage.bucket(this.bucketName);
      const file = myBucket.file(sid);
      file
        .get()
        .then(function (data) {
          const file = data[0];
          return cb(null, file);
        })
        .catch((e) => {
          return cb(e);
        });
    } catch (e) {
      return cb(e);
    }

    // Reference Impl
    /*
    let key = this.prefix + sid;
    this.client.get(key, (err, data) => {
      if (err) return cb(err);
      if (!data) return cb();

      let result;
      try {
        result = this.serializer.parse(data);
      } catch (err) {
        return cb(err);
      }
      return cb(null, result);
    });
    */
  }

  touch(sid, sess, cb = noop) {
    try {
      // Set timestamp to enable TTL via lifecycle event DaysSinceCustomTime
      if (this.modifyCustomTime) {
        const date = new Date();
        const formatted = date.toISOString(); // RFC 3339
        const myBucket = this.storage.bucket(this.bucketName);
        const file = myBucket.file(sid);
        file.setMetadata(
          {
            "Custom-Time": formatted,
          },
          function (e, apiResponse) {
            if (e) {
              return cb(e);
            } else {
              return cb(null, "OK");
            }
          }
        );
      }
    } catch (e) {
      return cb(e);
    }

    /*
    if (this.disableTouch || this.disableTTL) return cb();
    let key = this.prefix + sid;
    this.client.expire(key, this._getTTL(sess), (err, ret) => {
      if (err) return cb(err);
      if (ret !== 1) return cb(null, "EXPIRED");
      cb(null, "OK");
    });
    */
  }

  destroy(sid, cb = noop) {
    try {
      const myBucket = storage.bucket(this.bucketName);
      const file = myBucket.file(sid);
      file.delete(function (e, apiResponse) {
        if (e) {
          return cb(e);
        } else {
          return cb(null, "OK");
        }
      });
    } catch (e) {
      return cb(e);
    }
    /*
    let key = this.prefix + sid;
    this.client.del(key, cb);
    */
  }
}

module.exports = GCPBucketStore;
