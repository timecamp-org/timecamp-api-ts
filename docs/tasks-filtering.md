## Task fetching, request building and filtering logic

This document explains how to build the API request and how the client filters the tasks tree for the current user ("me") and for other users. It includes pseudocode so another LLM can recreate the logic without reading the code.

### Inputs

- apiKey: string
- options:
  - user?: string — either 'me' (default) or a numeric TimeCamp user id as string
  - includeFullBreadcrumb?: boolean — default true

### Step 1: Resolve user parameter

Goal: normalize the input `user` to learn whether we act as the current user and what the target user id is.

Pseudocode:

```
function resolveUserParam(inputUser):
  if inputUser is undefined or inputUser == 'me':
    return { isCurrentUser: true, targetUserId: undefined }

  if inputUser is not numeric:
    # treat as other user id string anyway
    return { isCurrentUser: false, targetUserId: inputUser }

  current = GET /me
  if current.user_id == inputUser:
    return { isCurrentUser: true, targetUserId: current.user_id }

  return { isCurrentUser: false, targetUserId: inputUser }
```

Notes:
- We never pass `user` to TimeCamp `/tasks`; we only use it for client‑side filtering.

### Step 2: Build the /tasks request

Rules:
- Always call `GET https://app.timecamp.com/third_party/api/tasks` with the Authorization bearer token.
- If acting as current user (`isCurrentUser == true`), include `ignoreAdminRights=1` in query params.
- Do NOT include `user` or `includeFullBreadcrumb` in query params (the API does not support them).

Pseudocode:

```
function buildTasksRequestParams(isCurrentUser):
  params = {}
  if isCurrentUser:
    params.ignoreAdminRights = '1'
  return params
```

Sample requests (curl):

```
# Current user ('me')
curl -H "Authorization: Bearer $API_KEY" \
     'https://app.timecamp.com/third_party/api/tasks?ignoreAdminRights=1'

# Other user (e.g., '1920470')
curl -H "Authorization: Bearer $API_KEY" \
     'https://app.timecamp.com/third_party/api/tasks'
```

### Step 3: Filter the tasks

Definitions:
- Each task has: `task_id`, `parent_id`, `archived` (0/1), `user_access_type` (number), optional `users` map where keys are user ids and values include roles.
- The client computes and attaches `canTrackTime: boolean` depending on scenario.

High‑level rules by scenario:

1) Current user ('me'), includeFullBreadcrumb = true
- Include all non‑archived tasks.
- Set `canTrackTime = (user_access_type == 2 or 3)`.

2) Current user ('me'), includeFullBreadcrumb = false
- Include only non‑archived tasks where `user_access_type == 2 or 3`.
- Set `canTrackTime = true` on included tasks.

3) Other user, includeFullBreadcrumb = true
- Include only tasks that are connected to the target user by any of:
  - The task itself contains the user in `users` (direct assignment), or
  - Any ancestor contains the user (assignment inherited downward), or
  - Any descendant contains the user (keep the breadcrumb subtree around user assignment).
- Set `canTrackTime = true` if the user is assigned at the task or any of its ancestors; otherwise `false`.

4) Other user, includeFullBreadcrumb = false
- Include only tasks where the user is assigned at the task or any of its ancestors.
- Set `canTrackTime = true` on included tasks.

Pseudocode (end‑to‑end):

```
function getTasks(apiKey, options):
  { isCurrentUser, targetUserId } = resolveUserParam(options.user)
  includeFullBreadcrumb = options.includeFullBreadcrumb ?? true

  params = buildTasksRequestParams(isCurrentUser)
  rawTasks = GET /tasks with params and Authorization

  return prepareTasksArray(rawTasks, {
    includeFullBreadcrumb,
    isCurrentUser,
    targetUserId
  })
```

`prepareTasksArray` uses helpers:

```
function prepareTasksArray(taskMap, { includeFullBreadcrumb, isCurrentUser, targetUserId }):
  childrenMap = (!isCurrentUser and includeFullBreadcrumb) ? buildChildrenMap(taskMap) : undefined
  memo = new Map()

  tasks = []
  for each task in taskMap.values():
    if task.archived != 0: continue

    if isCurrentUser and !includeFullBreadcrumb and !(task.user_access_type in {2,3}): continue

    canTrack = determineCanTrackTime(task, taskMap, isCurrentUser, targetUserId)

    if !includeFullBreadcrumb and !canTrack: continue

    if !isCurrentUser and includeFullBreadcrumb and childrenMap and targetUserId:
      subtreeAccess = userHasAccessInSubtree(task, taskMap, childrenMap, targetUserId, memo)
      hasAccess = canTrack or subtreeAccess
      if !hasAccess: continue

    if includeFullBreadcrumb:
      task.canTrackTime = canTrack
    else if canTrack:
      task.canTrackTime = true
    else:
      delete task.canTrackTime

    tasks.push(task)

  return tasks
```

`determineCanTrackTime` (what does canTrackTime mean?):

```
function determineCanTrackTime(task, taskMap, isCurrentUser, targetUserId):
  if isCurrentUser:
    return (task.user_access_type == 2 or task.user_access_type == 3)

  if targetUserId is empty: return false

  # for other users, allow tracking when the user is assigned at the task or any ancestor
  return userAssignedInSelfOrAncestors(task, taskMap, targetUserId)
```

Ancestor check:

```
function userAssignedInSelfOrAncestors(task, taskMap, userId, visited = set()):
  if task is null: return false
  if task.task_id in visited: return false
  visited.add(task.task_id)

  if userId in task.users: return true
  if task.parent_id is null or task.parent_id == 0: return false

  parent = taskMap[String(task.parent_id)]
  return userAssignedInSelfOrAncestors(parent, taskMap, userId, visited)
```

Children map and subtree check (used only for other user + full breadcrumb):

```
function buildChildrenMap(taskMap):
  children = {}
  for each t in taskMap.values():
    key = String(t.parent_id)
    if children[key] does not exist: children[key] = []
    children[key].push(t)
  return children

function userHasAccessInSubtree(task, taskMap, childrenMap, userId, memo):
  if memo.has(task.task_id): return memo.get(task.task_id)

  if userId in task.users:
    memo.set(task.task_id, true)
    return true

  for child in childrenMap[String(task.task_id)] or []:
    if userHasAccessInSubtree(child, taskMap, childrenMap, userId, memo):
      memo.set(task.task_id, true)
      return true

  memo.set(task.task_id, false)
  return false
```

### Worked examples

Assume target user is `1920470`.

- Full breadcrumb = true (other user):
  - Keep any task that either contains user 1920470, has an ancestor with 1920470, or a descendant with 1920470.
  - Set `canTrackTime = true` if user 1920470 is in the task or in its ancestors, otherwise `false`.

- Full breadcrumb = false (other user):
  - Keep tasks where user 1920470 is in the task or its ancestors.
  - Set `canTrackTime = true` on kept tasks.

- For 'me':
  - With full breadcrumb: keep all non‑archived tasks; `canTrackTime = (user_access_type in {2,3})`.
  - Without full breadcrumb: keep only tasks where `user_access_type in {2,3}`; `canTrackTime = true`.

### Minimal request snippets to copy

```
# Resolve current user
GET /me
Authorization: Bearer <API_KEY>

# Fetch tasks (current user)
GET /tasks?ignoreAdminRights=1
Authorization: Bearer <API_KEY>

# Fetch tasks (other user)
GET /tasks
Authorization: Bearer <API_KEY>

# Filtering is performed client‑side per algorithms above.
```


