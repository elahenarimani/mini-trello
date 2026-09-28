import type { PriorityFilter, SortOrder, StatusFilter, Task } from "../types/task";

export function filterAndSortTasks(
  tasks: readonly Task[],
  statusFilter: StatusFilter,
  priorityFilter: PriorityFilter,
  sortOrder: SortOrder,
): Task[] {
  const statusFiltered = statusFilter === "all"
    ? tasks
    : tasks.filter((task) => task.status === statusFilter);
  const priorityFiltered = priorityFilter === "all"
    ? statusFiltered
    : statusFiltered.filter((task) => task.priority === priorityFilter);

  return [...priorityFiltered].sort((first, second) => {
    const firstTime = new Date(first.createdAt).getTime();
    const secondTime = new Date(second.createdAt).getTime();
    const firstInvalid = Number.isNaN(firstTime);
    const secondInvalid = Number.isNaN(secondTime);
    if (firstInvalid && secondInvalid) return 0;
    if (firstInvalid) return 1;
    if (secondInvalid) return -1;
    return sortOrder === "asc" ? firstTime - secondTime : secondTime - firstTime;
  });
}
