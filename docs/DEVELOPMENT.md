# QueueFlow — Development Workflow

## 1. Development Philosophy

Build incrementally.

Prefer small, testable changes over large rewrites.

Every feature should have:

1. Clear purpose
2. Defined user flow
3. UI states
4. Data requirements
5. Security considerations
6. Tests
7. Verification

---

## 2. Before Coding

An agent should first understand:

* The relevant product requirement
* Existing architecture
* Existing components
* Existing database schema
* Existing security policies
* Existing design system

Do not immediately start coding.

---

## 3. Feature Workflow

Use:

```text
Requirement
    ↓
User Flow
    ↓
Data Model
    ↓
Security
    ↓
UI Design
    ↓
Implementation
    ↓
Tests
    ↓
Browser Verification
    ↓
Review
```

---

## 4. UI Development

Before implementing a significant screen, determine:

* User role
* Primary goal
* Primary action
* Information hierarchy
* Loading state
* Empty state
* Error state
* Offline state
* Permission state
* Mobile behavior

Do not build only the successful state.

---

## 5. Database Changes

For schema changes:

1. Define the purpose.
2. Define relationships.
3. Add constraints.
4. Consider indexes.
5. Consider RLS.
6. Consider migration safety.
7. Test realistic queries.

Never casually modify production-oriented schemas.

---

## 6. Testing

Use:

### Unit tests

For:

* Queue calculations
* State transitions
* Wait-time calculations
* Validation
* Utility functions

### Integration tests

For:

* Database operations
* Authorization
* Queue operations
* Notifications

### End-to-end tests

For critical user journeys:

Customer:

```text
Open service
→ Join queue
→ Receive ticket
→ Track position
→ Get called
```

Staff:

```text
Login
→ Open queue
→ Call next
→ Start service
→ Complete
```

Admin:

```text
Login
→ Configure facility
→ Create service
→ Assign staff
→ View analytics
```

---

## 7. Concurrency Testing

Explicitly test simultaneous operations.

Examples:

Two staff click "Call Next" at exactly the same time.

Expected:

Only one ticket is claimed by each staff member.

Two requests attempt to join the same queue simultaneously.

Expected:

Both may receive valid tickets, but no duplicate ticket identity should occur.

One customer submits the same join request twice.

Expected:

The system should prevent unintended duplicate tickets where appropriate.

---

## 8. Performance Testing

Do not guess about performance.

Measure:

* Response time
* Database query time
* Realtime behavior
* Concurrent queue operations
* Large queue behavior
* Dashboard performance

Optimize based on evidence.

---

## 9. Browser Verification

Critical UI changes should be tested in a real browser.

Verify:

* Page loads
* No console errors
* Buttons work
* Forms work
* Responsive layout
* Loading states
* Error states
* Navigation
* Authentication behavior

---

## 10. Git Workflow

Use small commits.

Prefer:

```text
feat: add customer queue joining
fix: prevent duplicate ticket creation
feat: add staff call-next operation
test: add concurrent queue tests
style: refine ticket status component
```

Avoid giant commits such as:

```text
update everything
```

---

## 11. Dependencies

Before adding a dependency, ask:

1. Do we actually need it?
2. Does the framework already provide this?
3. Is the dependency maintained?
4. Does it increase bundle size?
5. Does it introduce security concerns?
6. Does it make deployment more complicated?

Prefer fewer dependencies.

---

## 12. AI Agent Workflow

AI agents are expected to assist with development, but every generated change must be reviewed.

Agents should:

* Read project documentation first.
* Inspect existing code before modifying it.
* Reuse existing components.
* Explain architectural changes.
* Run tests.
* Run lint/type checks.
* Verify UI changes.
* Avoid unnecessary rewrites.

Agents must not assume that generated code is correct simply because it compiles.

---

## 13. When an Agent Gets Stuck

The agent should:

1. Identify the failure.
2. Reproduce it.
3. Inspect logs/errors.
4. Identify the root cause.
5. Make the smallest appropriate fix.
6. Re-run verification.

Do not hide errors or bypass failing checks simply to make the task appear complete.

---

## 14. Definition of Done

A task is complete only when:

* Requirement is satisfied.
* UI follows the design system.
* Security is preserved.
* Data integrity is preserved.
* Tests pass.
* TypeScript passes.
* Lint passes.
* Relevant browser flows work.
* Error states are handled.
* No unnecessary architectural complexity was introduced.

---

## 15. Golden Rule

> **Do not make the code merely work. Make it understandable, secure, testable, and maintainable.**
