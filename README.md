# QueueFlow

> **Join the queue without standing in it.**

QueueFlow is a configurable virtual queue management platform that allows customers to join service queues without spending unnecessary time physically standing in line. It connects customers, service staff, and public lobby displays through a unified real-time queue engine.

## Overview

QueueFlow is designed for any high-traffic service environment:
- **Higher Education**: Bursaries, Admissions, Registrar, Student ID Centers
- **Healthcare & Clinics**: Outpatient Triage, Consultations, Pharmacy
- **Telecommunications & Banking**: SIM Replacements, Account Desks, Cashiers
- **Civic & Government**: Passport Services, Civil Registry, Licensing

## Key Features

- **Frictionless Customer Joining**: No account creation or mobile app download required. Join via QR code or web, and receive an instant digital ticket with real-time position countdown and estimated wait times.
- **Audible Turn Notifications**: Web Audio turn chimes alert customers when their ticket is called.
- **High-Velocity Staff Console**: Single-touch desk controls (`Call Next`, `Start Service`, `Complete`, `Skip / No-Show`) and live waitlist management.
- **Airport-Style Public Display**: High-contrast, large-format lobby board mapping tickets to service desks with automated chimes and fullscreen mode.
- **Multi-Tenant Configurable Architecture**: Generic hierarchical model (`Organization` → `Facility` → `Service` → `Queue` → `Desk` → `Staff`) without hardcoded business logic.

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Styling**: React 19, TypeScript, Tailwind CSS v4
- **Design Philosophy**: Swiss Editorial Design & Restrained Neobrutalism
- **Data & Realtime**: PostgreSQL / Supabase, Real-time state synchronization

## Getting Started

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the application.

## Documentation

Full architectural and product specifications can be found in the [`docs/`](./docs) directory:
- [Product Specification](./docs/PRODUCT.md)
- [Architecture Blueprint](./docs/ARCHITECTURE.md)
- [Design System & UX Direction](./docs/DESIGN.md)
- [Security & Multi-Tenancy](./docs/SECURITY.md)
- [Development Workflow](./docs/DEVELOPMENT.md)
- [Agent Guidelines](./docs/AGENTS.md)
