# QueueFlow — AI Agent Instructions

## 1. Project Identity

QueueFlow is a configurable virtual queue management platform designed to reduce unnecessary physical waiting time in high-traffic service centers.

The system may be used by universities, hospitals, banks, telecommunications offices, government institutions, and other organizations that operate physical service queues.

The core principle is:

> **Show what matters. Make the next action obvious.**

The application must be reliable, secure, fast, accessible, and visually coherent.

---

## 2. Read Before Working

Before making any code changes, agents MUST read:

1. `AGENTS.md`
2. `docs/PRODUCT.md`
3. `docs/DESIGN.md`
4. `docs/ARCHITECTURE.md`
5. `docs/SECURITY.md`
6. `docs/DEVELOPMENT.md`

If the requested change conflicts with these documents, do not silently override them.

Explain the conflict and choose the safest approach.

---

## 3. Technology Baseline

The initial stack is:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase
* PostgreSQL
* Supabase Realtime
* Vercel
* Git/GitHub
* Vitest
* Playwright

Potential future technologies such as Redis, separate FastAPI services, background workers, message queues, or microservices must NOT be introduced without a demonstrated technical reason.

Do not add infrastructure merely because it is popular.

Prefer the simplest architecture that can correctly solve the problem.

---

## 4. General Engineering Rules

### Correctness before speed

Never sacrifice queue correctness for performance.

A queue system that is fast but gives two customers the same turn is unacceptable.

### Server is authoritative

The client must never be trusted as the source of truth for:

* Queue position
* Ticket status
* Staff permissions
* Priority
* Service assignment
* Ticket ownership
* Completion state

Important operations must be validated server-side.

### Database integrity matters

Use:

* PostgreSQL constraints
* Unique constraints
* Foreign keys
* Transactions
* Atomic operations
* Appropriate indexes

Do not rely exclusively on frontend validation.

### Design for failure

Assume:

* The user may lose internet.
* A request may be duplicated.
* A request may arrive late.
* A staff member may close their browser.
* A notification provider may fail.
* Two staff members may act simultaneously.
* A device may crash.
* A realtime connection may disconnect.

The application must recover gracefully.

---

## 5. Queue Operations

Queue state transitions must be explicit.

Typical lifecycle:

WAITING
→ CALLED
→ IN_SERVICE
→ COMPLETED

Alternative states may include:

WAITING
→ CANCELLED

CALLED
→ NO_SHOW

IN_SERVICE
→ TRANSFERRED

Do not create arbitrary status transitions.

Every important queue mutation must be validated against the current server state.

---

## 6. Concurrency

Race conditions are a critical concern.

Examples include:

* Two staff members calling the same ticket.
* Two customers receiving the same ticket number.
* A customer joining twice because of a network retry.
* Two requests trying to complete the same ticket.
* Two staff members modifying the same queue simultaneously.

Critical operations must be atomic and transactional.

Never solve concurrency problems using frontend state alone.

---

## 7. Multi-Tenant Security

QueueFlow supports multiple organizations.

Every organization owns its own:

* Facilities
* Services
* Queues
* Desks
* Staff
* Customers/tickets
* Analytics

One organization must NEVER be able to access another organization's private data.

All tenant-scoped database access must be carefully authorized.

Never trust an `organization_id` supplied by the client without verifying that the authenticated user has access to it.

---

## 8. UI/UX Rules

The design philosophy is:

> **Swiss precision × modern digital design systems × restrained neobrutalism × editorial data visualization**

The interface must prioritize:

* Hierarchy
* Clarity
* Legibility
* Whitespace
* Consistency
* Accessibility
* Functional motion
* Fast comprehension

Avoid:

* Random gradients
* Excessive glassmorphism
* Excessive rounded cards
* Decorative animations
* Excessive shadows
* Generic AI-generated SaaS aesthetics
* Unnecessary icons
* Visual clutter

Every visual element should have a purpose.

---

## 9. User Roles

The system has distinct experiences for:

### Customer

Needs to:

* Find a service
* Join a queue
* Receive a ticket
* Track position
* Understand estimated waiting time
* Receive notifications
* Know when to act

### Staff

Needs to:

* See current ticket
* Call next customer
* Start service
* Complete service
* Skip/no-show
* Transfer customer
* See queue state

### Organization Administrator

Needs to:

* Configure facilities
* Configure services
* Manage staff
* Manage desks
* Configure queues
* Monitor operations
* View analytics

### Platform Administrator

Manages the QueueFlow platform and organizations.

Do not give users unnecessary controls.

---

## 10. Performance

Avoid:

* Fetching unnecessary columns
* Fetching entire tables
* Polling aggressively
* Repeated identical queries
* Unbounded lists
* Client-side filtering of huge datasets
* Realtime subscriptions to irrelevant data

Use:

* Scoped queries
* Pagination
* Proper indexes
* Server-side filtering
* Realtime only where useful
* Debouncing where appropriate
* Caching where justified
* Lazy loading where appropriate

Do not prematurely introduce Redis or microservices.

Measure before optimizing.

---

## 11. Realtime

Realtime updates should be scoped to the user's relevant context.

A customer should not subscribe to every queue in an organization.

A staff member should primarily receive updates relevant to their assigned facility/service/desk.

Realtime events must not blindly overwrite newer client state.

Use authoritative server state and, where appropriate, event/version information to prevent stale updates from being applied.

---

## 12. Notifications

Notifications must not block critical queue operations.

The queue operation should succeed independently of whether an SMS/email notification succeeds.

Notification processing should be retryable.

A failed notification must not corrupt queue state.

---

## 13. Accessibility

Interfaces should support:

* Keyboard navigation
* Strong contrast
* Readable typography
* Clear focus states
* Large touch targets
* Semantic HTML
* Screen-reader-friendly labels
* Color-independent status communication

Never communicate important information through color alone.

---

## 14. Coding Standards

Use TypeScript strictly.

Avoid:

* `any` unless genuinely necessary
* Giant components
* Duplicate logic
* Business logic inside presentation components
* Hardcoded organization data
* Hardcoded queue rules
* Magic numbers
* Secrets in source code

Prefer:

* Small focused components
* Reusable components
* Typed functions
* Explicit domain logic
* Server-side validation
* Clear naming
* Consistent error handling

---

## 15. Before Completing Any Task

An agent should verify:

1. TypeScript passes.
2. Lint passes.
3. Relevant tests pass.
4. No security regression was introduced.
5. No authorization boundary was weakened.
6. UI works on mobile where applicable.
7. Loading, empty, error, and offline states are handled where applicable.
8. The implementation follows `docs/DESIGN.md`.
9. Database changes have appropriate constraints/indexes.
10. The change does not unnecessarily increase architectural complexity.

---

## 16. Agent Behavior

Agents must NOT:

* Rewrite working architecture without reason.
* Introduce dependencies without justification.
* Remove security checks to make something work.
* Disable TypeScript errors instead of fixing the cause.
* Ignore failing tests.
* Replace a proper database constraint with frontend validation.
* Create fake data as a substitute for unfinished backend functionality.
* Claim a feature is complete without verification.

When uncertain, prefer a small, reversible change.

When a task affects architecture, security, database schema, or queue concurrency, explain the reasoning before making broad changes.

---

## 17. Definition of Done

A feature is not complete merely because it renders.

A feature is complete when:

* The UX is clear.
* The implementation is secure.
* The server validates important operations.
* Database integrity is protected.
* Errors are handled.
* Relevant tests exist.
* The feature has been verified.
* The implementation follows the established design system.
