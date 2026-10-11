# QueueFlow — Design System & UX Direction

## 1. Design Philosophy

QueueFlow combines four design influences:

### Swiss / International Editorial Design

Principles:

* Strong typography
* Grid systems
* Alignment
* Whitespace
* Clear hierarchy
* Precision
* Information-first layouts

### Modern Digital Design Systems

Principles:

* Consistent components
* Design tokens
* Responsive behavior
* Accessibility
* Semantic states
* Reusable patterns
* Predictable interaction

### Restrained Neobrutalism

Used selectively for:

* Important metrics
* Ticket numbers
* Primary actions
* Strong borders
* High-impact states
* Confident typography

Do not turn the entire interface into an exaggerated brutalist design.

### Editorial Data Visualization

Analytics should feel like a clear report, not a collection of random dashboard cards.

---

# 2. Core Design Principle

> **Show what matters. Make the next action obvious.**

Every screen should answer:

1. Where am I?
2. What is happening?
3. What matters now?
4. What should I do next?

---

# 3. Visual Character

QueueFlow should feel:

* Precise
* Calm
* Modern
* Trustworthy
* Fast
* Human
* Professional
* Information-rich without feeling crowded

Avoid:

* Excessive gradients
* Glassmorphism
* Excessive shadows
* Decorative blobs
* Excessive rounded cards
* Random colors
* Unnecessary animation
* Generic AI SaaS aesthetics

---

# 4. Layout

Use a consistent spacing system based around multiples of 4/8.

Layouts should use clear grids and alignment.

Prefer whitespace over unnecessary borders.

Use cards only when they establish a meaningful grouping.

Not every piece of information needs its own card.

---

# 5. Typography

Primary typeface should be a highly readable modern sans-serif such as:

* Geist Sans
* Inter

Typography hierarchy should be strong.

Large numbers may be used for:

* Ticket numbers
* Queue positions
* Key metrics
* Important states

Typography should communicate importance before the user reads every word.

---

# 6. Color

Use a restrained semantic color system.

Primary color:

* Brand action
* Active states
* Navigation emphasis

Success:

* Completed
* Available
* Healthy

Warning:

* Approaching turn
* Attention required

Error:

* Failed
* Cancelled
* Unavailable

Neutral:

* Supporting information
* Backgrounds
* Secondary text

Important information must not depend on color alone.

---

# 7. Status Language

Use consistent states:

* Waiting
* Called
* In Service
* Completed
* No Show
* Transferred
* Cancelled

Each status should have:

* Text
* Visual indicator
* Appropriate semantic color
* Optional icon

---

# 8. Customer Interface

The customer experience should be mobile-first.

Primary information:

Ticket number
→ Position
→ Estimated wait
→ Current status
→ Required action

Example:

B284

17 people ahead

~28 minutes

"We'll notify you when your turn is approaching."

Do not overload customers with administrative information.

---

# 9. Staff Interface

The staff interface should optimize for speed and accuracy.

Primary action hierarchy:

1. Current ticket
2. Main action
3. Next queue
4. Secondary actions

The most common action should be visually dominant.

Avoid unnecessary navigation during active service.

---

# 10. Admin Interface

The admin interface can be denser.

Priority hierarchy:

1. Problems requiring attention
2. Current operational state
3. Key performance metrics
4. Trends
5. Detailed reports

Analytics should help administrators identify bottlenecks rather than merely display numbers.

---

# 11. Public Display

A public queue display should be readable from a distance.

Primary information:

NOW SERVING

B284

DESK 4

NEXT:

B285
B286
B287

Use large typography and minimal secondary information.

---

# 12. Motion

Motion must communicate state.

Good uses:

* Ticket position updates
* Queue transitions
* Notification arrival
* Turn-called state
* Loading
* Success confirmation

Avoid animation simply because it looks impressive.

Animations should be fast, subtle, and respect reduced-motion preferences.

---

# 13. Communication Model

QueueFlow communicates through multiple channels:

### Personal digital communication

Customer phone:

* Ticket
* Position
* Notifications
* Turn announcement

### Staff communication

Staff dashboard:

* Current ticket
* Next ticket
* Queue status

### Public communication

Display:

* Now serving
* Desk
* Next tickets

All channels should represent the same authoritative queue state.

---

# 14. Error Communication

Never expose technical errors unnecessarily.

Bad:

"HTTP 409 Conflict"

Better:

"Someone else just called the next customer. Refreshing the queue."

The interface should explain:

* What happened
* Whether the user's data is safe
* What will happen next
* What the user can do

---

# 15. Loading, Empty and Offline States

Every important interface must consider:

* Loading
* Empty
* Error
* Offline
* Permission denied
* Expired session
* Closed queue

Example offline message:

> Connection lost. We're trying to reconnect. Your ticket is safe.

---

# 16. Accessibility

Follow accessible design practices:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Sufficient contrast
* Large touch targets
* Clear labels
* Screen-reader support
* Reduced-motion support
* Color-independent status communication

---

# 17. Responsive Design

Customer:

* Mobile-first

Staff:

* Desktop/tablet optimized

Admin:

* Desktop optimized with responsive fallback

Public display:

* Large-screen optimized

Do not simply shrink desktop interfaces onto mobile.

---

# 18. Component Philosophy

Use reusable components for:

* Buttons
* Inputs
* Selects
* Dialogs
* Status badges
* Ticket displays
* Queue lists
* Metric displays
* Tables
* Charts
* Notifications
* Empty states
* Error states
* Navigation

Components should have predictable variants and states.

---

# 19. Design Quality Rule

Before approving a screen, ask:

> Can a first-time user understand what is happening within three seconds?

If not, simplify the interface.
