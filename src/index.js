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
    this.modifyCustomTime = options.modifyCustomTime || false; // DaysSinceCustomTime (https://cloud.google.com/storage/docs/lifecycle)
    this.storage = new Storage();
  }

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
              customTime: formatted,
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
      }.bind(this)
    );
  }

  get(sid, cb = noop) {
    try {
      const myBucket = this.storage.bucket(this.bucketName);
      const file = myBucket.file(sid);
      file
        .get()
        .then(function (data) {
          const file = data[0];
          let dl = async function () {
            try {
              let content = JSON.parse(await file.download());
              return cb(null, content);
            } catch (e) {
              cb(e);
            }
          };
          dl();
        })
        .catch((e) => {
          // Return undefined if the file was not found
          if (e.code == 404) {
            return cb(null, undefined);
          }
          return cb(e);
        });
    } catch (e) {
      return cb(e);
    }
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
              if (e.code == 404) {
                return cb(null, "OK"); // No-op to delete file that doesn't exist
              }
              return cb(e);
            } else {
              return cb(null, "OK");
            }
          }
        );
      } else {
        cb(null, "OK");
      }
    } catch (e) {
      return cb(e);
    }
  }

  destroy(sid, cb = noop) {
    try {
      const myBucket = this.storage.bucket(this.bucketName);
      const file = myBucket.file(sid);
      file.delete(function (e, apiResponse) {
        if (e) {
          if (e.code == 404) {
            return cb(null, "OK"); // No-op to delete file that doesn't exist
          }
          return cb(e);
        } else {
          return cb(null, "OK");
        }
      });
    } catch (e) {
      return cb(e);
    }
  }
}

module.exports = GCPBucketStore;
