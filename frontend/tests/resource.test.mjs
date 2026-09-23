import assert from "node:assert/strict";
import test from "node:test";
import { createResource } from "../src/api/resource.ts";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("concurrent consumers and fresh revisits share one request", async () => {
  let requests = 0;
  const response = deferred();
  const resource = createResource(() => {
    requests++;
    return response.promise;
  });
  const first = resource.load();
  const second = resource.load();
  assert.equal(first, second);
  response.resolve(["topic"]);
  await first;
  await resource.load();
  assert.equal(requests, 1);
  assert.deepEqual(resource.getSnapshot().data, ["topic"]);
});

test("stale data remains visible while a new request refreshes it", async () => {
  const next = deferred();
  let requests = 0;
  const resource = createResource(
    () => (++requests === 1 ? Promise.resolve("old") : next.promise),
    0,
  );
  await resource.load();
  const refresh = resource.load();
  assert.equal(resource.getSnapshot().data, "old");
  assert.equal(resource.getSnapshot().fetching, true);
  next.resolve("new");
  await refresh;
  assert.equal(resource.getSnapshot().data, "new");
});

test("invalidation refreshes subscribers and ignores older responses", async () => {
  const old = deferred();
  const current = deferred();
  let requests = 0;
  const resource = createResource(() =>
    ++requests === 1 ? old.promise : current.promise,
  );
  const unsubscribe = resource.subscribe(() => {});
  const first = resource.load();
  await Promise.resolve();
  resource.invalidate();
  const second = resource.load();
  current.resolve("after mutation");
  await second;
  old.resolve("before mutation");
  await first;
  assert.equal(resource.getSnapshot().data, "after mutation");
  unsubscribe();
});

test("a failed request can be retried without discarding cached data", async () => {
  let fail = false;
  const resource = createResource(async () => {
    if (fail) throw new Error("offline");
    return "topic";
  }, 0);
  await resource.load();
  fail = true;
  await resource.load();
  assert.equal(resource.getSnapshot().error.message, "offline");
  assert.equal(resource.getSnapshot().data, "topic");
  fail = false;
  await resource.load();
  assert.equal(resource.getSnapshot().error, null);
});

test("invalidating an unmounted resource waits until it is visited", async () => {
  let requests = 0;
  const resource = createResource(async () => ++requests);
  await resource.load();
  resource.invalidate();
  assert.equal(requests, 1);
  await resource.load();
  assert.equal(resource.getSnapshot().data, 2);
});
