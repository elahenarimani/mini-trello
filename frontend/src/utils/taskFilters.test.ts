import { describe, expect, it } from "vitest";
import { cloneTaskFixtures } from "../tests/fixtures/tasks";
import { filterAndSortTasks } from "./taskFilters";

describe("filterAndSortTasks", () => {
  it("filters tasks by status", () => {
    const result = filterAndSortTasks(cloneTaskFixtures(), "todo", "all", "desc");
    expect(result.map((task) => task.id)).toEqual([1, 4]);
  });

  it("filters tasks by priority", () => {
    const result = filterAndSortTasks(cloneTaskFixtures(), "all", "high", "desc");
    expect(result.map((task) => task.id)).toEqual([3, 1]);
  });

  it("combines status and priority filters", () => {
    const result = filterAndSortTasks(cloneTaskFixtures(), "todo", "high", "desc");
    expect(result.map((task) => task.id)).toEqual([1]);
  });

  it("sorts valid dates from oldest to newest", () => {
    const result = filterAndSortTasks(cloneTaskFixtures(), "all", "all", "asc");
    expect(result.map((task) => task.id)).toEqual([1, 3, 2, 4]);
  });

  it("sorts valid dates from newest to oldest", () => {
    const result = filterAndSortTasks(cloneTaskFixtures(), "all", "all", "desc");
    expect(result.map((task) => task.id)).toEqual([2, 3, 1, 4]);
  });

  it("keeps tasks with invalid dates at the end", () => {
    const result = filterAndSortTasks(cloneTaskFixtures(), "all", "all", "asc");
    expect(result.at(-1)?.id).toBe(4);
  });

  it("does not mutate the original array", () => {
    const tasks = cloneTaskFixtures();
    const originalIds = tasks.map((task) => task.id);
    const result = filterAndSortTasks(tasks, "all", "all", "desc");
    expect(tasks.map((task) => task.id)).toEqual(originalIds);
    expect(result).not.toBe(tasks);
  });
});
