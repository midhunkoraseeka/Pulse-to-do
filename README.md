# PULSE — Living Personal Operating System

> **"Make every day count."**

Pulse is a production-grade, AI-powered personal productivity operating system designed for high-performing engineering students and software developers. It replaces static percentage dials and generic SaaS cards with a **Living Progress Field**—a generative Canvas 2D orbital particle field that dynamically mirrors real momentum.

---

## ⚡ Core Features

- **Living Progress Field**: Generative Canvas 2D particle simulation with organic elliptical reticles, dynamic velocity dampening, and structured orbital convergence across 5 discrete momentum tiers (0–25%, 26–50%, 51–75%, 76–99%, and 100%).
- **Deterministic Progress Architecture**: Calculated strictly from eligible, unarchived, non-cancelled task instances:
  $$\text{Progress \%} = \frac{\text{Completed Eligible Tasks}}{\text{Total Eligible Tasks}} \times 100$$
  Displays explicit `NO TASKS PLANNED` when empty without fabricating progress.
- **Unique Custom Cursor**: Fine-pointer desktop cursor with an acid-lime central dot, smooth trailing outer ring, magnetic hover attraction, and an expanding completion ripple triggered on task completion (`pulse_task_completed`). Respects `prefers-reduced-motion` and touch devices.
- **Domain-Tailored Task Management**: Pre-configured categories for CS students: **Java**, **DSA**, **MERN Stack**, **College**, **Projects**, **Personal**, **Health & Fitness**, and **Other**. Supports priorities (*Urgent*, *High*, *Medium*, *Low*), due dates/times, duration sliders, tags, bulk completion, and bulk deletion.
- **Idempotent Recurrence Engine**: Supports daily, weekly, weekdays, and custom day frequencies with database-backed unique constraints (`uq_rule_scheduled_date`) preserving historical completion.
- **Integrated Focus Timer**: Pomodoro immersion timer (25m Focus / 5m Short Break / 15m Long Break). Calculated from absolute timestamps (`Date.now() + duration`) so browser tab throttling and background tabs never skew elapsed time. Uses Web Audio API synthesizer for clean completion chimes.
- **Google Gemini Gen AI Integration**:
  - `/api/ai/plan`: Sequenced daily deep work schedule validated via Zod (`AIDayPlanResponseSchema`).
  - `/api/ai/insights`: Productivity analysis, momentum score (1-100), and fatigue mitigation.
  - `/api/ai/breakdown`: Decomposes high-level ambitions into concrete daily milestone steps.
  - `/api/ai/reschedule`: Paced redistribution of overdue tasks across future slots.
  - `/api/ai/chat`: Interactive study mentor for algorithms, Java concurrency, and architecture.
- **Visual Analytics**: 7-day completion trend bars, 4-week consistency matrix heatmap with 5 discrete intensity tiers, and category performance breakdown.
- **Reminders & Alerts**: Client-side deduplication cache preventing repeat notifications, in-app floating banner alerts, and Web Notification API integration.
- **PWA Ready**: Web App Manifest (`manifest.json`), responsive layout, and custom vector icons (`icon-192.svg`, `icon-512.svg`).

---

## 🎨 Signature Design System

| Token | Hex / Value | Usage |
|---|---|---|
| **Primary Background** | `#090B09` | Deep near-black canvas |
| **Secondary Background** | `#111410` | Panels, task streams, cards |
| **Surface Elevated** | `#171C16` | Badges, inputs, control chips |
| **Primary Accent** | `#C6FF5E` | Acid-lime indicator of activity & focus |
| **Accent Glow** | `rgba(198, 255, 94, 0.25)` | Laser focus highlight & ripples |
| **Primary Text** | `#F1F3EC` | High-contrast editorial headings |
| **Secondary Text** | `#92988D` | Monospace timestamps & metrics |
| **Subtle Border** | `#232A21` | Crisp low-contrast charcoal separators |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons, clsx, tailwind-merge
- **Visualizations**: Canvas 2D particle simulation, SVG editorial reticles, Recharts
- **Validation**: Zod (strict client and server schemas)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies
- **AI Intelligence**: Google Gemini API via official `@google/genai` SDK
- **Date & Time Utilities**: `date-fns` with strict timezone handling
- **Testing**: Vitest (16 unit tests for progress calculator, recurrence, analytics, and Zod schemas)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 2. Installation
```bash
git clone <your-repo-url>
cd pulse_todolist
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Populate your credentials:
```env
# Supabase Configuration (Optional for local store mode, required for cloud sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google Gemini API Key (Obtain from Google AI Studio: https://aistudio.google.com/)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash

# Base App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Pulse features an intelligent local persistent store fallback. The application runs immediately out of the box with realistic seed tasks even before you configure external API keys.

### 4. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port displayed in terminal) in your browser.

### 5. Running Automated Tests
```bash
npm test
```

### 6. Production Build
```bash
npm run build
```

---

## 🗄️ Database Migrations (Supabase)

The complete SQL schema with Row Level Security (RLS) is located at:
`supabase/migrations/20261019000001_initial_schema.sql`

To apply the migration in Supabase:
1. Open your Supabase Project Dashboard.
2. Navigate to the **SQL Editor**.
3. Paste the contents of `supabase/migrations/20261019000001_initial_schema.sql` and click **Run**.
4. The migration will create:
   - `profiles` with automatic user creation trigger
   - `tasks` with user isolation RLS
   - `recurrence_rules` and `task_occurrences`
   - `goals` and `focus_sessions`
   - `notification_preferences`

---

## 🌐 Production Deployment (Vercel)

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Pulse production application"
   git remote add origin https://github.com/<your-username>/pulse.git
   git push -u origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (e.g. `gemini-2.5-flash`)
4. Click **Deploy**. Vercel will build and deploy the production bundle.
5. In Supabase Dashboard -> Authentication -> URL Configuration, add your production Vercel URL to **Redirect URLs**.

---

## 📄 License
MIT License. Built for high-velocity software engineering.
