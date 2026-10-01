const assert = require("node:assert/strict");
const { test } = require("node:test");
const { once } = require("node:events");
const database = require("../dist/config/database.js");
const { mapTaskRow } = require("../dist/services/task.mapper.js");
const { parseSeedTasks } = require("../dist/scripts/seed-data.js");
const { seedTasks } = require("../dist/scripts/seed.js");
const app = require("../dist/app.js").default;

const row = {
  id: "16", title: "Example", description: "", status: "todo", priority: "medium",
  created_at: "2026-09-22T12:00:00+03:30",
};

test("missing/invalid DATABASE_URL errors are clear and do not expose supplied values", () => {
  const saved = process.env.DATABASE_URL;
  try {
    delete process.env.DATABASE_URL;
    assert.throws(database.getDatabase, /DATABASE_URL is required/);
    process.env.DATABASE_URL = "invalid-secret-value";
    assert.throws(database.getDatabase, (error) => {
      assert.match(error.message, /DATABASE_URL is invalid/);
      assert.ok(!error.message.includes("invalid-secret-value"));
      return true;
    });
  } finally {
    if (saved === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = saved;
  }
});

test("mapper returns numeric ids, UTC createdAt, and no database-only field", () => {
  const task = mapTaskRow(row);
  assert.equal(task.id, 16);
  assert.equal(task.createdAt, "2026-09-22T08:30:00.000Z");
  assert.ok(!("created_at" in task));
  assert.deepEqual(mapTaskRow({ ...row, created_at: new Date(row.created_at) }), task);
  assert.throws(() => mapTaskRow({ ...row, id: "9007199254740993" }), /safely/);
});

test("seed validates ids, timestamps and enums without changing preserved task fields", () => {
  const task = mapTaskRow(row);
  assert.deepEqual(parseSeedTasks([task]), [task]);
  assert.throws(() => parseSeedTasks([task, task]), /duplicate ids/);
  assert.throws(() => parseSeedTasks([{ ...task, createdAt: "invalid" }]), /invalid fields/);
  assert.throws(() => parseSeedTasks([{ ...task, status: "invalid" }]), /invalid fields/);
});

test("seed submits parameterized data, a write lock and forward-only sequence alignment in one transaction", async () => {
  const task = { ...mapTaskRow(row), title: "'); DROP TABLE tasks; --" };
  const sql = (strings, ...values) => ({ statement: strings.join("?"), values });
  let transaction;
  sql.transaction = async (queries) => {
    transaction = queries;
    return [[], [{ id: "16" }], [{ setval: "16" }]];
  };
  assert.equal(await seedTasks(sql, [task]), 1);
  assert.match(transaction[0].statement, /LOCK TABLE tasks/);
  assert.match(transaction[1].statement, /ON CONFLICT \(id\) DO NOTHING/);
  assert.ok(!transaction[1].statement.includes(task.title));
  assert.deepEqual(JSON.parse(transaction[1].values[0]), [task]);
  assert.match(transaction[2].statement, /GREATEST/);
  assert.match(transaction[2].statement, /pg_sequence_last_value/);
  assert.equal(await seedTasks(sql, []), 0);
});

test("HTTP API contract with a stubbed database (no real PostgreSQL connection)", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const originalQuery = database.query;
  t.after(() => { database.query = originalQuery; });
  let calls = [];
  let rows = [row];
  database.query = async (statement, parameters = []) => {
    calls.push({ statement, parameters });
    return rows;
  };
  const request = async (method, route, body) => {
    const response = await fetch(base + route, {
      method, headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null, text };
  };

  await t.test("GET list and id preserve response shape", async () => {
    let result = await request("GET", "/api/tasks?sort=title&status=done");
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, [mapTaskRow(row)]);
    assert.match(calls.at(-1).statement, /ORDER BY id ASC/);
    assert.deepEqual(calls.at(-1).parameters, []);
    result = await request("GET", "/api/tasks/16");
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, mapTaskRow(row));
    assert.deepEqual(calls.at(-1).parameters, [16]);
  });

  await t.test("POST binds user text, retains defaults, and returns 201", async () => {
    const title = "'); DROP TABLE tasks; --";
    const result = await request("POST", "/api/tasks", { title: ` ${title} ` });
    assert.equal(result.status, 201);
    assert.deepEqual(result.body, mapTaskRow(row));
    assert.deepEqual(calls.at(-1).parameters, [title, "", "todo", "medium"]);
    assert.ok(!calls.at(-1).statement.includes(title));
    assert.match(calls.at(-1).statement, /RETURNING/);
    assert.equal((await request("POST", "/api/tasks", { title: "x", description: "" })).status, 201);
  });

  await t.test("PUT validates incoming createdAt but does not write it", async () => {
    const result = await request("PUT", "/api/tasks/16", {
      title: " Changed ", description: " Description ", status: "done", priority: "high",
      createdAt: "2030-01-01T00:00:00Z",
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.createdAt, mapTaskRow(row).createdAt);
    assert.deepEqual(calls.at(-1).parameters, ["Changed", "Description", "done", "high", 16]);
    assert.ok(!calls.at(-1).statement.split("RETURNING")[0].includes("created_at"));
  });

  await t.test("PATCH distinguishes an omitted field from an empty string", async () => {
    assert.equal((await request("PATCH", "/api/tasks/16", { status: "done" })).status, 200);
    assert.deepEqual(calls.at(-1).parameters, [null, null, "done", null, 16]);
    assert.equal((await request("PATCH", "/api/tasks/16", { description: "" })).status, 200);
    assert.deepEqual(calls.at(-1).parameters, [null, "", null, null, 16]);
  });

  await t.test("invalid ids and bodies return 400 before querying", async () => {
    const count = calls.length;
    for (const id of ["abc", "0", "-1", "1.5"]) {
      assert.equal((await request("GET", `/api/tasks/${id}`)).status, 400);
    }
    for (const body of [{}, { title: " " }, { title: "valid", id: 99 }, { title: "valid", status: "invalid" }]) {
      assert.equal((await request("POST", "/api/tasks", body)).status, 400);
    }
    for (const body of [{}, { description: null }, { createdAt: "2030-01-01T00:00:00Z" }]) {
      assert.equal((await request("PATCH", "/api/tasks/16", body)).status, 400);
    }
    const replacement = { title: "valid", description: "", status: "done", priority: "low" };
    assert.equal((await request("PUT", "/api/tasks/16", replacement)).status, 400);
    assert.equal((await request("PUT", "/api/tasks/16", { ...replacement, createdAt: "invalid" })).status, 400);
    assert.equal(calls.length, count);
  });

  await t.test("DELETE returns an empty 204; missing tasks and routes return 404", async () => {
    const result = await request("DELETE", "/api/tasks/16");
    assert.equal(result.status, 204);
    assert.equal(result.text, "");
    assert.match(calls.at(-1).statement, /DELETE FROM tasks WHERE id = \$1 RETURNING id/);
    rows = [];
    assert.equal((await request("GET", "/api/tasks/16")).status, 404);
    assert.equal((await request("PATCH", "/api/tasks/16", { status: "done" })).status, 404);
    assert.equal((await request("PUT", "/api/tasks/16", {
      title: "valid", description: "", status: "done", priority: "low", createdAt: row.created_at,
    })).status, 404);
    assert.equal((await request("DELETE", "/api/tasks/16")).status, 404);
    assert.equal((await request("GET", "/missing-route")).status, 404);
  });

  await t.test("database errors return generic 500 and only a safe code is logged", async () => {
    database.query = async () => {
      throw Object.assign(new Error("connection-string-secret SELECT private data"), {
        code: "23514", detail: "secret", query: "SELECT private data",
      });
    };
    const logged = [];
    const originalError = console.error;
    console.error = (...args) => logged.push(args);
    try {
      const result = await request("GET", "/api/tasks");
      assert.equal(result.status, 500);
      assert.deepEqual(result.body, { message: "Internal server error" });
      assert.deepEqual(logged, [["Request failed", { code: "23514" }]]);
    } finally {
      console.error = originalError;
    }
  });
});
