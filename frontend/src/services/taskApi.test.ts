import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReplaceTaskInput } from "../types/task";

const input: ReplaceTaskInput = {
  title: "Test task", description: "Test description", status: "todo", priority: "medium",
  createdAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("API base URL", () => {
  it.each(["https://example.com", "https://example.com/", "  https://example.com///  "])(
    "uses the same normalized URLs for all methods with %s", async (baseUrl) => {
      vi.stubEnv("VITE_API_BASE_URL", baseUrl);
      vi.resetModules();
      const api = await import("./taskApi");
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 1, ...input }) });
      vi.stubGlobal("fetch", fetchMock);

      await api.getTasks();
      await api.createTask({ title: input.title, description: input.description, status: input.status, priority: input.priority });
      await api.updateTask(1, input);
      await api.updateTaskStatus(1, { status: "done" });
      await api.deleteTask(1);

      expect(fetchMock.mock.calls.map(([url, options]) => [url, options?.method ?? "GET"])).toEqual([
        ["https://example.com/api/tasks", "GET"],
        ["https://example.com/api/tasks", "POST"],
        ["https://example.com/api/tasks/1", "PUT"],
        ["https://example.com/api/tasks/1", "PATCH"],
        ["https://example.com/api/tasks/1", "DELETE"],
      ]);
      for (const [url] of fetchMock.mock.calls) expect(url).not.toContain("//api/tasks");
    },
  );

  it.each([undefined, "", "   ", "///"])("rejects missing/empty configuration (%s) before fetch", async (baseUrl) => {
    vi.stubEnv("VITE_API_BASE_URL", baseUrl);
    vi.resetModules();
    // Import itself remains safe, so the app can display its existing error state.
    const api = await import("./taskApi");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const actions = [
      () => api.getTasks(),
      () => api.createTask({ title: input.title, description: input.description, status: input.status, priority: input.priority }),
      () => api.updateTask(1, input),
      () => api.updateTaskStatus(1, { status: "done" }),
      () => api.deleteTask(1),
    ];
    for (const action of actions) await expect(action()).rejects.toThrow("VITE_API_BASE_URL");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
