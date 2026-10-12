# Deployment Guide — Vercel & Supabase

This guide outlines how to deploy QueueFlow to [Vercel](https://vercel.com) with the production PostgreSQL / Supabase backend.

---

## 1. Prerequisites

1. **GitHub Repository**: [https://github.com/Wisdom614/Queueflow](https://github.com/Wisdom614/Queueflow)
2. **Supabase Project**: Live instance initialized with `db/schema.sql` and seeded with `scripts/seed-db.mjs`.

---

## 2. Deploying to Vercel (Step-by-Step)

### Option A: Import via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select the **`Queueflow`** repository.
3. In the **Configure Project** screen:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)

### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 3. Environment Variables

In your Vercel Project Settings under **Settings → Environment Variables**, add the following three variables:

| Variable Name | Description | Example / Location |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | `https://maromawwackmwsvqzltd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Client Key | In Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated Server Key | In Supabase Dashboard → Settings → API |

> **Important**: Apply these environment variables to **Production**, **Preview**, and **Development** environments in Vercel.

---

## 4. Post-Deployment Verification Checklist

Once deployed to your Vercel domain (e.g. `https://queueflow-xxxx.vercel.app`):

1. **Landing Page (`/`)**: Verify that the homepage loads with Swiss editorial styling and navigation links.
2. **Customer Join Flow (`/join`)**: Submit a test ticket for *Tuition & Fee Payment* and verify that you are redirected to `/ticket/[id]` with live wait times.
3. **Staff Console (`/staff`)**: Sign in with Station PIN `1234` as *Etonde Marie (Desk 1)* and call the next ticket. Confirm sound chime plays on the customer pass.
4. **Public Lobby Board (`/display`)**: Open the lobby board in a separate window or device to ensure real-time change data capture (CDC) updates are displayed.
5. **Admin Console (`/admin`)**: Sign in with Supervisor PIN `8888` to inspect the throughput metrics matrix and active desk controls.
