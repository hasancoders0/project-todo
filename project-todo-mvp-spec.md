# Project Todo --- MVP Specification

**Purpose:** Build a small internal team task-management app so the team
can track project deadlines and todos without losing time.\
**Delivery target:** Approximately 2 hours for a usable MVP. Keep the
scope strict.\
**Version:** 1.0\
**Primary roles:** Admin, Member

------------------------------------------------------------------------

## 1. Product Goal

Project Todo is an internal workspace where:

-   Admins create projects, choose project members, set project
    deadlines, create team todos, and assign todos to members.
-   Members see projects they are assigned to and can create their own
    todos inside those projects.
-   Every todo belongs to a project and has its own priority, status,
    and deadline.
-   Members can only see their own todos and todos assigned to them by
    an admin. Admins can see all team projects and todos.
-   Completing a todo records who completed it, when it was completed,
    and a short completion commit/message.

The UI uses a clean card-grid layout, not a Kanban board.

## 2. MVP Scope

### Include

1.  Sign in / sign out.
2.  Two roles: `ADMIN` and `MEMBER`.
3.  Dashboard with simple counts and deadline summaries.
4.  Projects list and project details.
5.  Admin project creation and management.
6.  Project member assignment.
7.  Todo creation inside a project.
8.  Todo priority, status, and individual due date/time.
9.  Admin assignment of todos to any project member.
10. Member-created todos automatically assigned to the creator.
11. Server-enforced authorization and visibility.
12. Complete todo with a completion message/commit.
13. Completed task history.

### Do not include in the 2-hour MVP

-   Kanban board or drag-and-drop.
-   Chat, comments, file uploads, or activity feed.
-   Email, push, or scheduled reminders.
-   Recurring todos.
-   Time tracking.
-   Complex reports or analytics.
-   Client accounts or public registration.
-   Git provider integration; the completion commit is a text record
    only.
-   Multiple organizations/workspaces.
-   Advanced notification settings.

**Time-box rule:** Prefer a working end-to-end flow over polished
extras. If authentication or database setup takes longer than expected,
use the simplest supported setup and keep the permission checks intact.

## 3. Technology Stack

-   **Framework:** Next.js App Router
-   **Language:** JavaScript with React JSX; do not use TypeScript
-   **Styling:** Tailwind CSS only
-   **UI components:** shadcn/ui where already installed; otherwise use
    simple accessible Tailwind components
-   **Icons:** Lucide React
-   **Database:** PostgreSQL
-   **ORM:** Prisma
-   **Authentication:** Use the authentication solution already
    configured in the project. If starting from scratch, choose one
    supported option and avoid implementing password security manually.
-   **Deployment:** Existing hosting setup; Vercel + managed PostgreSQL
    is a straightforward option

Avoid adding animation libraries or extra dependencies for this MVP
unless already installed.

## 4. Roles and Permissions

### Admin

Admin can:

-   View all projects, all team todos, and all completion records.
-   Create, edit, and delete projects.
-   Assign one or more members to a project.
-   Set project name, description, start date/time, and delivery
    deadline.
-   Create todos in any project.
-   Assign an admin-created todo to any member who is assigned to that
    project.
-   Set or change todo title, description, priority, status, and
    deadline.
-   View and manage team member accounts/roles using the supported
    authentication setup.
-   Mark todos complete and add a completion message when appropriate.

For a safe MVP, do not allow deleting the final admin account. If
account creation is not already implemented, create users through the
authentication provider/dashboard and provide an admin-only user list
rather than building a full invitation system.

### Member

Member can:

-   View only projects to which they are assigned.
-   View todos they created and todos assigned to them by an admin,
    within accessible projects.
-   Create a todo only inside a project to which they are assigned.
-   Set the new todo's title, description, priority, and deadline.
-   Have their own newly created todo automatically assigned to
    themselves.
-   Update permitted fields and status for their own todos and
    admin-assigned todos.
-   Complete a permitted todo and add a completion message.
-   View completion records for tasks they are allowed to access.
-   Update their own profile/password through the authentication
    provider.

Member cannot:

-   Create or edit projects.
-   Assign a todo to another user.
-   View another member's private todo.
-   Change their own role or project membership.
-   access admin-only routes or APIs by entering a URL directly.

### Visibility rules

  Created by   Assigned to              Visible to
  ------------ ------------------------ --------------------
  Admin        Member A                 Admin and Member A
  Admin        Member B                 Admin and Member B
  Member A     Automatically Member A   Admin and Member A
  Member B     Automatically Member B   Admin and Member B

Other members must not see a todo just because they belong to the same
project. Admins can see all todos. Enforce this rule in every server
query and mutation.

## 5. Navigation

### Admin sidebar

1.  Dashboard
2.  Projects
3.  All Todos
4.  Team Members
5.  Completed Tasks
6.  Settings (only if basic settings are implemented)

### Member sidebar

1.  Dashboard
2.  Projects
3.  Todos
4.  Completed Tasks
5.  My Profile

There is no separate "My Todo" module. The member's **Todos** page is a
filtered list showing only todos the member is allowed to access.

## 6. Pages and UI Requirements

### Dashboard

Use compact statistic cards:

-   Active projects
-   Open/pending todos
-   In-progress todos
-   Overdue todos
-   Completed todos

Below the cards, show:

-   Tasks due soon
-   Recently completed tasks

Admin statistics are team-wide. Member statistics are based only on
projects and todos the member can access.

### Projects

Display projects as responsive cards, not a board. Each card shows:

-   Project name
-   Short description
-   Project status
-   Delivery deadline
-   Assigned member count (or member names where useful)
-   Open todo count and completion count

Project detail page shows project information and the permitted todo
card grid.

### Todo cards

Each card should show:

-   Todo title
-   Project name
-   Priority: Low, Medium, High
-   Status: Pending, In Progress, Completed
-   Deadline date and time
-   Assignee name where appropriate
-   Completion message indicator when completed

Use clear visual treatment for overdue deadlines, but do not rely on
color alone.

### Create/edit project form (Admin only)

Fields:

-   Project name (required)
-   Description (optional)
-   Assigned members (one or more)
-   Start date/time (optional)
-   Delivery deadline (required)
-   Status (default `ACTIVE`)

Validate that the deadline is after the start date when both are
provided.

### Create/edit todo form

Fields:

-   Project (required; choose from accessible projects)
-   Title (required)
-   Description (optional)
-   Priority (`LOW`, `MEDIUM`, `HIGH`; default `MEDIUM`)
-   Deadline date/time (required)
-   Assignee (Admin only; select an assigned project member)

For Member-created todos, do not display the assignee control. Set
`assigneeId` on the server to the authenticated member ID; never trust a
client-provided assignee ID.

### Completing a todo

When a user marks a todo completed:

1.  Confirm the user is authorized to update that todo.
2.  Require a short completion message/commit (recommended for the MVP).
3.  Set status to `COMPLETED`.
4.  Store `completedAt` and `completedById`.
5.  Save the completion message as a record.
6.  Show the task under Completed Tasks.

The "commit" is a plain-text work summary, not a Git commit. If a
completed task is reopened, preserve the existing completion record
rather than silently deleting it.

## 7. Status, Priority, and Deadline Rules

### Todo status

-   `PENDING`
-   `IN_PROGRESS`
-   `COMPLETED`

### Project status

-   `ACTIVE`
-   `COMPLETED`
-   `ARCHIVED` (optional; skip if time is tight)

### Priority

-   `LOW`
-   `MEDIUM`
-   `HIGH`

### Deadlines

-   Each project has its own delivery deadline.
-   Each todo has its own due date/time.
-   The project deadline does not automatically replace a todo deadline.
-   Show an overdue label when the due date/time is in the past and the
    item is not completed.
-   Optionally warn when a todo deadline is later than its project's
    deadline; do not block saving unless explicitly desired.
-   Store timestamps consistently in PostgreSQL and display them in the
    user's local timezone.

## 8. Suggested Prisma Data Model

Adapt names and authentication fields to the chosen auth provider. This
is a conceptual starting point, not a requirement to duplicate
provider-owned user tables.

### User

-   `id`
-   `name`
-   `email` (unique)
-   `role` (`ADMIN` or `MEMBER`)
-   `createdAt`
-   `updatedAt`

### Project

-   `id`
-   `name`
-   `description` (nullable)
-   `startAt` (nullable)
-   `deadlineAt`
-   `status` (`ACTIVE`, `COMPLETED`, optional `ARCHIVED`)
-   `createdById`
-   `createdAt`
-   `updatedAt`

### ProjectMember

Join table for many-to-many project membership:

-   `projectId`
-   `userId`
-   `addedAt`

Use a unique constraint on (`projectId`, `userId`).

### Todo

-   `id`
-   `projectId`
-   `title`
-   `description` (nullable)
-   `priority` (`LOW`, `MEDIUM`, `HIGH`)
-   `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`)
-   `createdById`
-   `assigneeId`
-   `deadlineAt`
-   `completedAt` (nullable)
-   `completedById` (nullable)
-   `createdAt`
-   `updatedAt`

### TodoCompletion

Recommended if a task can be reopened or completion history must be
retained:

-   `id`
-   `todoId`
-   `completedById`
-   `message`
-   `completedAt`

For the strictest 2-hour scope, a single completion message field on
`Todo` is faster. Use `TodoCompletion` if preserving multiple completion
attempts is important.

## 9. Suggested File Structure

project-todo/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.jsx
│   │   ├── (workspace)/
│   │   │   ├── layout.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.jsx
│   │   │   ├── projects/
│   │   │   │   ├── page.jsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.jsx
│   │   │   │       └── edit/
│   │   │   │           └── page.jsx
│   │   │   ├── todos/
│   │   │   │   ├── page.jsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── [todoId]/
│   │   │   │       ├── page.jsx
│   │   │   │       └── edit/
│   │   │   │           └── page.jsx
│   │   │   ├── completed/
│   │   │   │   └── page.jsx
│   │   │   ├── team/
│   │   │   │   └── page.jsx
│   │   │   └── profile/
│   │   │       └── page.jsx
│   │   ├── api/
│   │   │   └── (only if needed)/
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-sidebar.jsx
│   │   │   ├── app-header.jsx
│   │   │   └── workspace-shell.jsx
│   │   ├── projects/
│   │   │   ├── project-card.jsx
│   │   │   └── project-form.jsx
│   │   ├── todos/
│   │   │   ├── todo-card.jsx
│   │   │   ├── todo-form.jsx
│   │   │   ├── todo-filters.jsx
│   │   │   └── complete-todo-dialog.jsx
│   │   └── ui/
│   ├── lib/
│   │   ├── auth.js
│   │   ├── prisma.js
│   │   ├── permissions.js
│   │   ├── validations.js
│   │   └── utils.js
│   └── actions/
│       ├── project-actions.js
│       ├── todo-actions.js
│       └── team-actions.js
├── .env
├── .env.example
├── .gitignore
├── jsconfig.json
├── next.config.mjs
├── package.json
└── README.md


This is a suggested structure. Do not create empty files for every item
up front. Add files only when they are needed. If the project uses a
root-level `app/` directory instead of `src/app/`, keep the existing
convention.

## 10. Server Actions and Authorization

Use Server Actions for form mutations if that fits the existing app.
Route Handlers are optional; do not implement the same mutation twice.

Suggested operations:

### Project actions

-   `createProject(formData)` --- Admin only; create project and
    membership rows.
-   `updateProject(projectId, formData)` --- Admin only.
-   `deleteProject(projectId)` --- Admin only; optional for MVP.
-   `getProjectsForCurrentUser()` --- Admin gets all projects; Member
    gets assigned projects only.

### Todo actions

-   `createTodo(formData)`:
    -   Require an authenticated user.
    -   Verify the selected project exists.
    -   Verify a Member belongs to the project.
    -   For Admin, verify the selected assignee belongs to the project.
    -   For Member, ignore any submitted `assigneeId` and force it to
        the current user.
-   `updateTodo(todoId, formData)`:
    -   Admin can manage any todo.
    -   Member can update only a todo they created or that is assigned
        to them, and only within a project they can access.
    -   Member cannot change the assignee or project membership.
-   `completeTodo(todoId, message)`:
    -   Enforce the same visibility/edit permissions.
    -   Save completion message, completion timestamp, and completing
        user.
-   `getTodosForCurrentUser(filters)`:
    -   Admin receives team-wide results.
    -   Member receives only todos where `createdById` or `assigneeId`
        is their ID, AND the project is assigned to them.
-   `getTodoById(todoId)`:
    -   Apply authorization before returning the record; do not fetch
        unrestricted data and rely on the UI to hide it.

### Important security checklist

-   Resolve the current user and role on the server.
-   Never trust role, `createdById`, `assigneeId`, or user IDs submitted
    by the browser.
-   Check authorization on every read and mutation.
-   A Member must not promote themselves to Admin.
-   Do not expose other members' private todos in dashboard counts,
    search results, or project detail pages.
-   Validate all submitted data on the server.
-   Return a generic "not found" or "not authorized" response when
    access is denied.
-   Hide admin navigation for Members, but do not treat hidden
    navigation as security.

## 11. Two-Hour Implementation Plan

### 0--15 minutes: Project setup

-   Confirm Node.js and package manager.
-   Create/verify Next.js App Router project.
-   Install Prisma and required UI/auth dependencies only if missing.
-   Configure PostgreSQL environment variables.
-   Initialize Prisma.

### 15--35 minutes: Database and authentication

-   Define User, Project, ProjectMember, and Todo models.
-   Run the initial migration.
-   Configure the existing authentication provider.
-   Ensure the role is available to server-side code.
-   Seed or configure one Admin and a few Members using a safe local
    setup.

### 35--55 minutes: Workspace shell

-   Build the sidebar and header.
-   Add role-aware navigation.
-   Build a clean responsive dashboard with simple counts.
-   Keep styling consistent and minimal.

### 55--80 minutes: Projects

-   Build project list and project cards.
-   Build Admin project form.
-   Save project membership and deadlines.
-   Restrict Member project queries to assigned projects.

### 80--105 minutes: Todos

-   Build todo card grid and create/edit form.
-   Implement project-required todo creation.
-   Implement Admin assignment and Member self-assignment.
-   Add priority, status, and deadline display.
-   Implement strict todo visibility queries.

### 105--120 minutes: Completion and smoke tests

-   Add completion message/commit.
-   Record completion timestamp and user.
-   Test Admin vs Member access.
-   Test overdue labels and invalid project/assignee submissions.
-   Fix the highest-impact issues before adding anything else.

**Realistic expectation:** Two hours is an aggressive target. It is
achievable only for a small MVP if the environment, database, and
authentication can be configured quickly. Avoid adding new features
until the core flow works.

## 12. Acceptance Checklist

### Admin

-   [ ] Can sign in as Admin.
-   [ ] Can create a project with members and a delivery deadline.
-   [ ] Can view and manage all projects and todos.
-   [ ] Can create a todo inside any project.
-   [ ] Can assign the todo to a member assigned to that project.
-   [ ] Can set todo priority and deadline.
-   [ ] Can review completion messages and completion times.

### Member

-   [ ] Can sign in as Member.
-   [ ] Can view only assigned projects.
-   [ ] Can create a todo only in an assigned project.
-   [ ] New todo is assigned to the current member, regardless of any
    forged form value.
-   [ ] Can see their own todos and admin-assigned todos only.
-   [ ] Cannot see another member's todo in project lists, dashboard
    counts, direct URLs, or server requests.
-   [ ] Can update permitted task status and complete a todo with a
    message.
-   [ ] Cannot create projects, assign tasks to others, or change their
    role.

### General

-   [ ] All projects and todos have correct deadline fields.
-   [ ] Todo cards show priority, status, and deadline.
-   [ ] Overdue tasks are clearly marked.
-   [ ] Completion records include who completed the task and when.
-   [ ] Layout works on desktop and mobile.
-   [ ] No Kanban board or out-of-scope features have been added.

## 13. Final MVP Definition

The MVP is done when an Admin can create a project, assign members,
create and assign todos with deadlines, and see team progress; a Member
can open an assigned project, create a private todo for themselves,
update their permitted tasks, and submit a completion message; and
server-side permissions prevent cross-member todo access.

Build this end-to-end flow first. Do not spend the two-hour window on
decorative polish or features outside this specification.
