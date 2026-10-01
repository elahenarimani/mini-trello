// Explicit live test only: creates one temporary task, deletes it, then reruns seed.
// Run from backend: node --env-file=.env tests/postgres-smoke.cjs
// Never included in npm test. Requires a database containing exactly 14 source tasks.
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { readFile } = require("node:fs/promises");
const { once } = require("node:events");
const path = require("node:path");
const { getDatabase } = require("../dist/config/database.js");
const { seedTasks } = require("../dist/scripts/seed.js");
const { parseSeedTasks } = require("../dist/scripts/seed-data.js");
const { mapTaskRow } = require("../dist/services/task.mapper.js");
const app = require("../dist/app.js").default;

let phase = "initial connection and baseline";
async function main() {
  const sql = getDatabase();
  const readTasks = async () => (await sql`
    SELECT id, title, description, status, priority, created_at FROM tasks ORDER BY id ASC
  `).map(mapTaskRow);
  const readSequence = async () => {
    const [row] = await sql`
      SELECT pg_sequence_last_value(pg_get_serial_sequence('tasks', 'id')::regclass)::text AS value,
             seqincrement::text AS increment
      FROM pg_sequence WHERE seqrelid = pg_get_serial_sequence('tasks', 'id')::regclass
    `;
    return { value: BigInt(row.value), increment: BigInt(row.increment) };
  };
  const original = await readTasks();
  assert.equal(original.length, 14);
  const seedBytes = await readFile(path.resolve(__dirname, "../src/data/tasks.json"));
  const source = parseSeedTasks(JSON.parse(seedBytes.toString("utf8")))
    .map(task => ({ ...task, createdAt: new Date(task.createdAt).toISOString() }))
    .sort((a, b) => a.id - b.id);
  assert.deepEqual(original, source);
  const beforeSequence = await readSequence();
  assert.equal(beforeSequence.increment, 1n);
  console.log("PASS baseline: exactly 14 PostgreSQL tasks; all fields match preserved source.");

  // Use the real app and real Neon driver on a private local test port.
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const marker = `Mini Trello verification ${randomUUID()}`;
  let temporaryId;
  let creationAttempted = false;
  const request = async (method, route, status, body) => {
    const response = await fetch(base + route, {
      method, headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30000),
    });
    assert.equal(response.status, status);
    const text = await response.text();
    if (status === 204) assert.equal(text, "");
    console.log(`PASS ${method} ${route}: ${status}`);
    return text ? JSON.parse(text) : undefined;
  };

  try {
    phase = "GET and validation";
    assert.deepEqual(await request("GET", "/api/tasks", 200), original);
    assert.deepEqual(await request("GET", "/api/tasks/", 200), original);
    assert.deepEqual(await request("GET", `/api/tasks/${original[0].id}/`, 200), original[0]);
    for (const method of ["GET", "PUT", "PATCH", "DELETE"]) {
      const body = method === "PUT"
        ? { title: marker, description: "temporary", status: "todo", priority: "low", createdAt: "2020-01-01T00:00:00Z" }
        : method === "PATCH" ? { status: "done" } : undefined;
      await request(method, "/api/tasks/invalid/", 400, body);
      // IDs are positive; this safe integer cannot be among the verified baseline.
      const missingId = Number.MAX_SAFE_INTEGER;
      assert.ok(!original.some(task => task.id === missingId));
      await request(method, `/api/tasks/${missingId}/`, 404, body);
    }
    await request("POST", "/api/tasks", 400, { title: " " });
    await request("POST", "/api/tasks", 400, { title: marker, status: "invalid" });
    phase = "create one temporary task";
    creationAttempted = true;
    const task = await request("POST", "/api/tasks", 201, {
      title: marker, description: "temporary verification", status: "todo", priority: "low",
    });
    temporaryId = task.id;
    assert.ok(Number.isSafeInteger(temporaryId));
    assert.ok(!original.some(item => item.id === temporaryId));
    assert.equal(BigInt(temporaryId), beforeSequence.value + beforeSequence.increment);
    assert.equal(task.title, marker);
    assert.equal((await readTasks()).length, 15);
    assert.deepEqual(await request("GET", `/api/tasks/${temporaryId}/`, 200), task);
    phase = "PUT and PATCH on temporary task";
    const replacement = { title: marker, description: "replaced", status: "in_progress", priority: "high", createdAt: "2000-01-01T00:00:00Z" };
    const replaced = await request("PUT", `/api/tasks/${temporaryId}/`, 200, replacement);
    assert.deepEqual(replaced, { ...replacement, id: temporaryId, createdAt: task.createdAt });
    const patched = await request("PATCH", `/api/tasks/${temporaryId}/`, 200, { status: "done" });
    assert.deepEqual(patched, { ...replaced, status: "done" });
    assert.deepEqual(await request("GET", `/api/tasks/${temporaryId}/`, 200), patched);
    await request("PUT", `/api/tasks/${temporaryId}/`, 400, { ...replacement, createdAt: "invalid" });
    await request("PATCH", `/api/tasks/${temporaryId}/`, 400, {});
    await request("PATCH", `/api/tasks/${temporaryId}/`, 400, { description: null });
    assert.deepEqual(await request("GET", `/api/tasks/${temporaryId}/`, 200), patched);
    phase = "delete temporary task";
    await request("DELETE", `/api/tasks/${temporaryId}/`, 204);
    await request("GET", `/api/tasks/${temporaryId}/`, 404);
    await request("DELETE", `/api/tasks/${temporaryId}/`, 404);
    temporaryId = undefined;
    creationAttempted = false;
    assert.deepEqual(await readTasks(), original);

    phase = "repeat seed and verify sequence";
    const sequenceAfterDelete = await readSequence();
    const inserted = await seedTasks(sql, source);
    assert.equal(inserted, 0);
    assert.deepEqual(await readTasks(), original);
    const sequenceAfterSeed = await readSequence();
    assert.deepEqual(sequenceAfterSeed, sequenceAfterDelete);
    assert.ok(sequenceAfterSeed.value >= BigInt(Math.max(...original.map(task => task.id))));
    assert.deepEqual(await request("GET", "/api/tasks", 200), original);
    assert.deepEqual(await readFile(path.resolve(__dirname, "../src/data/tasks.json")), seedBytes);
    console.log("PASS repeated seed: 0 inserted; all 14 original tasks unchanged; local JSON unchanged.");
    console.log(`PASS sequence: last value ${sequenceAfterSeed.value}; increment ${sequenceAfterSeed.increment}; next id ${sequenceAfterSeed.value + sequenceAfterSeed.increment}. No extra task or nextval was used.`);
  } finally {
    try {
      if (creationAttempted) {
        // Resolve an interrupted POST by its unique marker; never delete original rows.
        const remaining = await sql`SELECT id FROM tasks WHERE title = ${marker}`;
        for (const row of remaining) {
          const id = Number(row.id);
          assert.ok(!original.some(task => task.id === id));
          await request("DELETE", `/api/tasks/${id}`, 204);
        }
      }
      assert.deepEqual(await readTasks(), original);
      console.log("PASS final cleanup: exactly 14 original tasks, all fields unchanged.");
    } finally {
      await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    }
  }
}

main().catch(() => {
  // Do not print assertion payloads, driver errors, SQL, URLs, or credentials.
  console.error(`FAIL phase: ${phase}. Error details suppressed to protect database information.`);
  process.exitCode = 1;
});
