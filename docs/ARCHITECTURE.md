# QueueFlow — Architecture

## 1. Architectural Goal

QueueFlow should initially use a simple, reliable architecture that can support the academic prototype and scale through measured optimization.

Do not introduce distributed infrastructure prematurely.

---

## 2. Initial Architecture

```text
Customer
   │
   ├── QR
   ├── Web/PWA
   └── Future USSD
   │
   ▼
Next.js Application
   │
   ├── Customer Interface
   ├── Staff Interface
   ├── Admin Interface
   └── Queue API / Server Logic
   │
   ▼
Supabase
   │
   ├── PostgreSQL
   ├── Auth
   ├── Realtime
   └── Storage
   │
   ▼
Vercel
```

---

## 3. Core Architectural Principle

> PostgreSQL is the source of truth.

The browser must not be the authoritative source for queue state.

Supabase Realtime is a communication mechanism, not the source of truth.

---

## 4. Suggested Domain Structure

```text
organizations
facilities
services
queues
desks
staff
staff_services
customers
tickets
queue_events
notifications
appointments
operating_hours
```

Additional tables may be introduced when justified.

---

## 5. Queue Engine

The queue engine is the core domain logic.

Important operations include:

```text
JOIN_QUEUE
CALL_NEXT
START_SERVICE
COMPLETE_SERVICE
SKIP_TICKET
TRANSFER_TICKET
CANCEL_TICKET
RECALL_TICKET
```

These operations must be implemented as controlled state transitions.

---

## 6. Concurrency

Critical queue operations must be atomic.

Example:

```text
CALL_NEXT(queue_id, staff_id)
```

must ensure that two simultaneous requests cannot claim the same ticket.

Use database transactions, appropriate row-level locking, constraints, or other PostgreSQL mechanisms as appropriate.

Do not depend on:

```text
client checks → request → client update
```

for concurrency correctness.

---

## 7. Ticket Generation

Ticket numbers must be generated safely.

Prevent:

* Duplicate ticket numbers
* Collisions
* Duplicate tickets caused by retries

Database constraints should enforce uniqueness where appropriate.

---

## 8. Realtime

Realtime should be scoped.

Customer:

* Their ticket
* Their queue

Staff:

* Assigned service/queue

Admin:

* Relevant facility/organization

Avoid global subscriptions where unnecessary.

---

## 9. Query Strategy

Never fetch more data than required.

Prefer:

```text
SELECT only required columns
WHERE relevant scope
LIMIT appropriate amount
```

Use pagination for large collections.

Create indexes based on real query patterns.

---

## 10. Estimated Wait Time

The system may initially use:

```text
estimated_wait =
people_ahead × average_service_time
÷ active_desks
```

A more advanced model can later consider:

* Service-specific averages
* Staff capacity
* Historical service duration
* Current queue composition
* Priority customers

Do not introduce machine learning without evidence that it provides value.

---

## 11. Analytics

Operational data should be stored in a form that supports analysis.

Important timestamps include:

* joined_at
* called_at
* started_at
* completed_at
* cancelled_at
* skipped_at
* transferred_at

These enable calculation of:

Waiting time:

```text
called_at - joined_at
```

Service time:

```text
completed_at - started_at
```

Total customer time:

```text
completed_at - joined_at
```

---

## 12. Notifications

Queue operations should not depend synchronously on notification delivery.

Preferred architecture:

```text
Queue Event
    │
    ▼
Persist event
    │
    ▼
Create notification job
    │
    ▼
Notification provider
    │
    ├── Success
    └── Retry
```

---

## 13. Future Scaling

Only introduce additional infrastructure when measurements justify it.

Potential future components:

* Redis
* Background job workers
* Message queues
* Dedicated analytics database
* Separate services

The initial architecture should remain modular enough to introduce these later.
