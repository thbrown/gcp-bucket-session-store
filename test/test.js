const assert = require("assert");
const GCPStore = require("../src/index.js");
const util = require("util");

const TEST_BUCKET_NAME = "test-session-bucket";

describe("Test Session Store", function () {
  describe("Test Constructor", function () {
    it("bucketName is required", function () {
      let testFunction = function () {
        new GCPStore({});
      };
      assert.throws(testFunction, Error, "bucketName is a required option");
    });
  });

  describe("Test set", function () {
    it("Setting a value should work", async function () {
      await new Promise((resolve, reject) => {
        let store = new GCPStore({ bucketName: TEST_BUCKET_NAME });
        store.set("1234", { name: "Luke Skywalker" }, (e) => {
          if (e) {
            reject(e);
          }
          resolve();
        });
      });
    });
  });

  describe("Test get", function () {
    it("Setting a value and getting it back should work", async function () {
      let store = new GCPStore({ bucketName: TEST_BUCKET_NAME });
      const SESS = { name: "Luke Skywalker" };
      const SID = "12345";

      // Store the value
      await new Promise((resolve, reject) => {
        store.set(SID, SESS, (e) => {
          if (e) {
            reject(e);
          }
          resolve();
        });
      });

      // Retrieve it
      let retVal = undefined;
      await new Promise((resolve, reject) => {
        store.get(SID, SESS, (e, val) => {
          if (e) {
            reject(e);
          }
          retVal = val;
          resolve();
        });
      });

      // Validate
      assert.equal(JSON.stringify(SESS), JSON.stringify(retVal));
    });
  });

  describe("Test Destroy", function () {
    it("Destroying a value we previously set should work", async function () {
      let store = new GCPStore({ bucketName: TEST_BUCKET_NAME });
      const SESS = { name: "Luke Skywalker" };
      const SID = "123456";

      // Store the value
      await new Promise((resolve, reject) => {
        store.set(SID, SESS, (e) => {
          if (e) {
            reject(e);
          }
          resolve();
        });
      });

      // Destroy the value
      await new Promise((resolve, reject) => {
        store.destroy(SID, (e) => {
          if (e) {
            reject(e);
          }
          resolve();
        });
      });

      // Retrieve it
      let retVal = undefined;
      await new Promise((resolve, reject) => {
        store.get(SID, SESS, (e, val) => {
          if (e) {
            reject(e);
          }
          retVal = val;
          resolve();
        });
      });

      // Validate
      assert.equal(retVal, undefined);
    });
  });
});
