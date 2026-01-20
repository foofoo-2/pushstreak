## PRD — “Day-of-Year Push-Up Challenge” Tracker (Points + Variations) — Web App (Responsive)

### 1) Product goal

Build a responsive web application (mobile + desktop) to track a daily challenge where the daily target increases with the day of the year (**D = day-of-year**). The app uses a **points system** to account for push-up variations (incline, knees, floor) and supports quick daily logging and clear progress visualization.

**MVP success criteria**

* Daily logging takes **< 30 seconds**
* Automatic calculation of: **today’s target**, **points completed**, **status** (Met / Behind / Exceeded)
* Clear views: **Today dashboard**, **Calendar**, **Progress charts**
* **Export + import** (CSV/JSON) for backup

---

### 2) Target users

* Primary: a single user (you) initially
* Beginner-friendly: supports very small sets and easier variations
* Works **offline-capable** or at least “local-first” preferred (see NFRs)

---

### 3) Problem statement

Users need to:

* Track a daily target that changes every day (day-of-year)
* Log multiple sets with different variations
* Convert reps to points instantly and know if today’s goal is reached
* See progress over time and avoid overuse issues

---

### 4) Value proposition

A fast, reliable way to answer:

* “What’s my target today?”
* “How many points have I done?”
* “Am I consistent and improving (volume + difficulty)?”
* “Do I need to scale down today (soreness/pain) without breaking the streak logic?”

---

## 5) Scope

### 5.1 MVP (Must-have)

#### A) Day-of-year target calculation

* Determine **day-of-year D** from local date (1–365/366).
* Default **daily goal = D points**.
* Display: “Today’s goal: D points”.

#### B) Variations + scoring (points per rep)

* Default variations (editable):

  * Wall push-up: 0.25
  * High incline: 0.5
  * Low incline: 0.75
  * Knees: 1.0
  * Strict floor: 1.5
  * (Optional preset) Feet elevated: 2.0
* User can:

  * Edit point values
  * Add custom variations (name + points/rep)
  * Set a default variation

#### C) Daily logging (entries)

For a given date, user can add 1..N entries. Each entry includes:

* Variation (dropdown)
* Sets (integer)
* Reps:

  * “Uniform reps” mode (e.g., 4 sets × 4 reps)
  * “Per-set reps” mode (e.g., 4/4/3/4)
* Optional: notes (text), **RPE** (1–10), and **pain score** (0–3)

Auto-compute:

* Total reps per entry
* Total points per entry
* Total points for the day
* Remaining points to target

#### D) Daily status

For each day:

* **Met** (points ≥ goal)
* **Behind** (points < goal)
* **No data** (no entries, not marked rest)
* **Rest** (manually set)

Rules:

* No “auto catch-up” and no forced doubling the next day.
* Allow “Mark as rest” with optional reason.

#### E) Views

1. **Today dashboard**

* Today’s goal (D points)
* Completed points and remaining points
* List of today’s entries
* Quick-add entry

2. **Calendar view**

* Monthly grid
* Color-coded status
* Tap/click a day to see details + edit

3. **Stats view**

* Line chart: points per day
* Cumulative points year-to-date
* Adherence: % of days met
* Streaks (current streak, best streak)
* Optional: distribution of variations used

#### F) Export / import (backup)

* Export all data:

  * **CSV** (daily summary + entry details)
  * **JSON** (full fidelity, for import)
* Import JSON to restore

---

### 5.2 Out of scope for MVP (V2)

* Accounts + cloud sync
* Multi-user support
* Push notifications
* Health platform integrations (Garmin/Health Connect/Google Fit)
* Automatic coaching plan generation (suggestions), aside from basic warnings
* Sharing/social features

---

## 6) User flows

### 6.1 Onboarding (1 minute)

1. Choose year (default current year)
2. Confirm/edit default variations scoring
3. Pick default variation (e.g., “Bed incline 0.5”)
4. Arrive on Today dashboard with today’s goal

### 6.2 Daily quick log (≤ 30 seconds)

1. Open app → Today dashboard
2. Add entry: variation + sets + reps
3. Save → status updates instantly

### 6.3 Weekly review

1. Open Stats view
2. Inspect adherence, streak, chart trends
3. Check notes/pain to correlate with missed days

---

## 7) Functional requirements (detailed)

### 7.1 Points calculation

* Entry points = total reps × pointsPerRep(variation)
* Day total = sum(entry points)
* Store with sufficient precision (float), display rounded to 1 decimal.

### 7.2 Day-of-year calculation

* D computed using local date and selected year
* Supports leap years: D up to 366

### 7.3 Goal configuration

* Default goal = D points
* Per-day override allowed (optional, but acceptable in MVP if simple)
* Optional “soft cap” warning:

  * After D ≥ 30, warn if daily points > goal × 1.1

### 7.4 Editing

* User can edit/delete entries for a date
* Recompute totals immediately

---

## 8) Data model

### 8.1 Entities

**Variation**

* id (uuid)
* name (string)
* pointsPerRep (number)
* isDefault (boolean)
* createdAt, updatedAt

**DailyLog**

* date (YYYY-MM-DD, unique)
* goalPoints (number) default = D
* notes (string, optional)
* painScore (0–3, optional)
* rpe (1–10, optional)
* isRestDay (boolean)
* createdAt, updatedAt

**Entry**

* id (uuid)
* date (YYYY-MM-DD, FK to DailyLog)
* variationId (FK)
* sets (int)
* repsMode (“uniform” | “perSet”)
* repsUniform (int, nullable)
* repsPerSet (int[], nullable)
* repsTotal (int, computed)
* pointsTotal (number, computed)
* note (string, optional)

### 8.2 Storage

Web app options:

* MVP local-first:

  * IndexedDB (via a wrapper like Dexie) for offline capability
* Or server-backed:

  * PostgreSQL/SQLite with a minimal API
* Export/import always supported regardless

---

## 9) Non-functional requirements (NFRs)

* Responsive UI: good on small screens and desktop
* Fast load: first interactive < 2 seconds on typical connection
* Logging interaction minimal: max 3 taps/clicks to add a basic entry
* Privacy: data stays local by default (if local-first); if server-backed, provide clear storage statement
* Accessibility basics: readable contrast, large tap targets, keyboard navigation on desktop

---

## 10) UI (MVP screens)

1. **Today**

* Goal, completed, remaining
* “Add entry” CTA
* Entries list with edit/delete
* Optional small “pain score” and “notes” widgets

2. **Add/Edit entry**

* Variation selector
* Sets
* Reps (toggle uniform vs per-set)
* Save

3. **Calendar**

* Month grid + color statuses
* Day details drawer/modal

4. **Stats**

* Points/day chart
* Cumulative chart
* Adherence + streaks
* Variation breakdown (simple)

5. **Settings**

* Manage variations and points/rep
* Choose year
* Export CSV/JSON, Import JSON

---

## 11) Acceptance criteria (examples)

* Given date day-of-year D=5, goal=5 points:

  * User logs 3×4 reps of “High incline” (0.5):
  * App computes reps=12, points=6.0, status=Met
* If no entry exists and not marked rest: status=No data
* Export JSON can be imported into a fresh instance to recreate identical totals and entries

---

## 12) Recommended implementation approach (web)

* **Frontend**: Next.js or React + Vite
* **UI**: Tailwind or simple component library
* **Charts**: Recharts or Chart.js
* **Local-first storage** (recommended): IndexedDB (Dexie)
* **PWA** (recommended): installable on mobile, works offline

---

## 13) MVP delivery backlog (ordered)

1. Day-of-year calculation + Today dashboard (no persistence)
2. Variations CRUD + scoring
3. Daily logging + persistence
4. Calendar view
5. Stats view (points/day + adherence)
6. Export/Import
7. UX polish (editing, validation, performance)