# QueueFlow — Security Requirements

## 1. Security Principle

Security must be designed into QueueFlow from the beginning.

Never treat security as a final-stage feature.

---

## 2. Authentication

Authenticated users include:

* Staff
* Facility managers
* Organization administrators
* Platform administrators

Customers should not be forced to create accounts simply to join a queue.

Authentication must use secure session handling.

---

## 3. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

Every protected operation must perform authorization checks.

Examples:

A staff member assigned to Service A should not automatically be able to manage Service B.

An organization administrator should not access another organization's data.

---

## 4. Multi-Tenant Isolation

All organization-owned data must be isolated.

Every query involving tenant data must be carefully scoped.

Use Supabase Row Level Security where appropriate.

Never rely only on:

```text
organization_id from request body
```

as proof of authorization.

The server must establish the user's organization context from authenticated identity and permissions.

---

## 5. Row Level Security

Supabase Row Level Security should protect sensitive tables where applicable.

Policies should be designed around:

* Authenticated identity
* Organization membership
* Facility membership
* Staff role
* Service assignment

Test policies explicitly.

---

## 6. Sensitive Data

Minimize personal information.

Only collect information necessary for the queue experience.

Avoid exposing:

* Full customer phone numbers
* Unnecessary personal details
* Internal staff information
* Organization secrets

Public displays should reveal only information necessary to identify a ticket and service point.

---

## 7. Client Trust

Never trust the client for:

* Ticket status
* Queue position
* Organization ownership
* Staff role
* Priority
* Service assignment
* Completion
* Authorization

Client-side checks are for UX.

Server-side checks are for security.

---

## 8. Input Validation

Validate all external input.

This includes:

* Forms
* API requests
* Query parameters
* IDs
* File uploads
* Search terms
* Configuration values

Use typed schemas where appropriate.

---

## 9. Rate Limiting

Consider rate limiting for:

* Authentication
* Ticket creation
* Public queue endpoints
* Notification-triggering operations
* Administrative operations

Prevent abuse without making legitimate usage difficult.

---

## 10. Secrets

Never commit:

* API keys
* Database passwords
* Service-role keys
* Authentication secrets
* Notification provider credentials

Use environment variables.

Never expose server-only secrets to the browser.

---

## 11. Service Role Keys

Supabase service-role credentials must remain server-side.

Never expose service-role keys in client-side code.

---

## 12. Audit Logs

Important administrative and queue actions should be auditable.

Examples:

* Priority granted
* Ticket transferred
* Ticket skipped
* Ticket recalled
* Staff permissions changed
* Queue configuration changed

Audit records should identify:

* Actor
* Action
* Target
* Timestamp
* Relevant reason/context

---

## 13. Concurrency Security

Security and concurrency overlap.

A malicious or buggy client must not be able to:

* Call arbitrary tickets
* Move itself forward
* Change queue position
* Assign itself priority
* Complete another customer's ticket

All such operations must be validated server-side.

---

## 14. Dependency Security

Keep dependencies minimal.

Regularly inspect dependencies for known vulnerabilities.

Do not add a package when a small internal utility or existing framework capability is sufficient.

---

## 15. Security Testing

Security-sensitive functionality should have tests.

At minimum, test:

* Unauthorized access
* Cross-organization access
* Role restrictions
* Ticket manipulation
* Duplicate ticket creation
* Concurrent queue operations
* Invalid state transitions

---

## 16. Security Rule

> If an operation could change who gets served next, it must be treated as a critical server-side operation.
