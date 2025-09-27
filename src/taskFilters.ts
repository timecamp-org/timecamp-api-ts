import { TimeCampTask, TimeCampTasksResponse } from './types';

interface PrepareTasksOptions {
  includeFullBreadcrumb: boolean;
  isCurrentUser: boolean;
  targetUserId?: string;
}

interface FilterContext {
  includeFullBreadcrumb: boolean;
  isCurrentUser: boolean;
  targetUserId?: string;
  taskMap: TimeCampTasksResponse;
  childrenMap?: Record<string, TimeCampTask[]>;
  memo: Map<number, boolean>;
}

interface DetermineOptions {
  isCurrentUser: boolean;
  targetUserId?: string;
}

export function prepareTasksArray(
  taskMap: TimeCampTasksResponse,
  options: PrepareTasksOptions
): TimeCampTask[] {
  const { includeFullBreadcrumb, isCurrentUser, targetUserId } = options;

  const childrenMap = !isCurrentUser && includeFullBreadcrumb
    ? buildTaskChildrenMap(taskMap)
    : undefined;

  const memo = new Map<number, boolean>();

  return Object.values(taskMap)
    .map((task: any) => {
      const { tags, ...taskWithoutTags } = task;
      return taskWithoutTags as TimeCampTask;
    })
    .filter((task) => shouldIncludeTask(task, {
      includeFullBreadcrumb,
      isCurrentUser,
      targetUserId,
      taskMap,
      childrenMap,
      memo
    }));
}

function shouldIncludeTask(task: TimeCampTask, context: FilterContext): boolean {
  const { includeFullBreadcrumb, isCurrentUser, targetUserId, taskMap, childrenMap, memo } = context;

  if (task.archived !== 0) {
    return false;
  }

  if (isCurrentUser && !includeFullBreadcrumb && (task.user_access_type !== 2 && task.user_access_type !== 3)) {
    return false;
  }

  const canTrack = determineCanTrackTime(task, taskMap, {
    isCurrentUser,
    targetUserId
  });

  if (!includeFullBreadcrumb && !canTrack) {
    return false;
  }

  if (!isCurrentUser && includeFullBreadcrumb && childrenMap && targetUserId) {
    const subtreeAccess = userHasAccessInSubtree(task, taskMap, childrenMap, targetUserId, memo);
    const hasAccess = canTrack || subtreeAccess;

    if (!hasAccess) {
      return false;
    }
  }

  if (includeFullBreadcrumb) {
    task.canTrackTime = canTrack;
  } else if (canTrack) {
    task.canTrackTime = true;
  } else {
    delete task.canTrackTime;
  }

  return true;
}

function determineCanTrackTime(
  task: TimeCampTask,
  taskMap: TimeCampTasksResponse,
  options: DetermineOptions
): boolean {
  const { isCurrentUser, targetUserId } = options;

  if (isCurrentUser) {
    return task.user_access_type === 2 || task.user_access_type === 3;
  }

  if (!targetUserId) {
    return false;
  }

  return userHasAccessInTaskHierarchy(task, taskMap, targetUserId);
}

function userHasAccessInTaskHierarchy(
  task: TimeCampTask | undefined,
  taskMap: TimeCampTasksResponse,
  userId: string,
  visited: Set<number> = new Set()
): boolean {
  if (!task) {
    return false;
  }

  if (visited.has(task.task_id)) {
    return false;
  }

  visited.add(task.task_id);

  if (task.users && task.users[userId]) {
    return true;
  }

  const parentId = task.parent_id;

  if (!parentId || parentId === 0) {
    return false;
  }

  const parentTask = taskMap[String(parentId)];

  if (!parentTask) {
    return false;
  }

  return userHasAccessInTaskHierarchy(parentTask, taskMap, userId, visited);
}

function buildTaskChildrenMap(taskMap: TimeCampTasksResponse): Record<string, TimeCampTask[]> {
  const childrenMap: Record<string, TimeCampTask[]> = {};

  for (const task of Object.values(taskMap)) {
    const parentKey = String(task.parent_id);

    if (!childrenMap[parentKey]) {
      childrenMap[parentKey] = [];
    }

    childrenMap[parentKey].push(task);
  }

  return childrenMap;
}

function userHasAccessInSubtree(
  task: TimeCampTask,
  taskMap: TimeCampTasksResponse,
  childrenMap: Record<string, TimeCampTask[]>,
  userId: string,
  memo: Map<number, boolean>
): boolean {
  if (memo.has(task.task_id)) {
    return memo.get(task.task_id) as boolean;
  }

  if (task.users && task.users[userId]) {
    memo.set(task.task_id, true);
    return true;
  }

  const children = childrenMap[String(task.task_id)] || [];

  for (const child of children) {
    if (userHasAccessInSubtree(child, taskMap, childrenMap, userId, memo)) {
      memo.set(task.task_id, true);
      return true;
    }
  }

  memo.set(task.task_id, false);
  return false;
}

