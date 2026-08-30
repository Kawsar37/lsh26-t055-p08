# ResultFlow — School Result Processing & GPA Engine

```text
Project: ResultFlow
Team ID: LSH26-T055
Problem ID: P08 — School Result Processing and GPA Engine
Repository: https://github.com/Kawsar37/lsh26-t055-p08.git
Live URL: https://lsh26-t055-p08.vercel.app
Deployment Provider: Local Node.js / Express + Next.js
```

---

## 1. Solution Summary

**ResultFlow** is a comprehensive school result processing, audit verification, and GPA calculation engine designed for secondary education institutions. The system deterministically computes individual subject grade points, evaluates practical pass thresholds ($25/75$ theory, $8/25$ practical), calculates optional 4th subject bonuses with a strictly fixed divisor of $6$, handles absences (`AB`), enforces compulsory failure overrides while preserving mathematically uncancelled GPAs, compiles three automated exception checking lists, and renders official printable marksheets.

---

## 2. Requirements Compliance Matrix

| Requirement | Status | Where to Verify | Evidence & Details |
| :--- | :---: | :--- | :--- |
| **R1 — Student Dataset & Subject Setup** | **Complete** | `/students`<br>`/` (Dataset Dropdown) | Supports 1,765 total students across all 25 official public fixture cases (`PUB-01` to `PUB-25`). Each student is enrolled in 6 compulsory subjects and 1 optional 4th subject with full support for practical subjects (`PHY`, `CHE`, `BIO`, `HMT`, `AGR`) and non-practical subjects (`BAN`, `ENG`, `MAT`, `REL`). |
| **R2 — Deterministic Result Calculation** | **Complete** | `/results`<br>`backend/src/services/resultEngine/` | Implements exact scale ($80+\rightarrow 5.0$, $70\text{--}79\rightarrow 4.0$, $60\text{--}69\rightarrow 3.5$, $50\text{--}59\rightarrow 3.0$, $40\text{--}49\rightarrow 2.0$, $33\text{--}39\rightarrow 1.0$, $<33\rightarrow 0.0/\text{F}$). Enforces practical rules (Theory $\ge 25$, Practical $\ge 8$). Calculates optional bonus $\max(0, \text{GP}-2)$ over fixed divisor $6$. Enforces compulsory failure override to $0.00/\text{F}$ while preserving uncancelled GPA. Verified by 13 unit tests. |
| **R3 — Per-Student Calculation Trace** | **Complete** | `/students/[id]` | Comprehensive audit modal and calculation trace view displaying exact component marks (theory, practical, total), letter grades, rule citations (R-11, R-12, R-13), failure causes, raw/uncancelled GPA, and an interactive **Edit Marks Modal** with real-time recalculation. |
| **R4 — Checking Lists** | **Complete** | `/checking-lists` | Three automated independent checking lists: **Optional Review** ($\text{GP}\le 2.0$ or `AB`), **Practical Fail** ($\text{Practical}< 8/25$), and **Absent Review** (`AB` in any subject). Full multi-list membership support with direct links to individual student audit traces. |

---

## 3. Official Sample Data & Dataset Architecture

ResultFlow natively ingests and evaluates the authoritative public fixture dataset:

```text
P08_school_results_public.json (Schema version: 2.1, Problem ID: P08)
```

* **Multi-Case Ingestion**: The database supports all 25 public fixture cases (`PUB-01` through `PUB-25`) containing 1,765 students using compound unique indexes (`{ caseId: 1, studentId: 1 }`).
* **Dataset Switcher**: The UI includes a global Dataset dropdown in the navigation header allowing instant switching between cases (`PUB-01`, `PUB-02` ... `PUB-25`, or `All Cases`).
* **Generic Schema Support**: The importer and engine are designed generically to parse any future case following the P08 fixture schema.

### Sample Data Ingestion & Reset Commands

To seed or reset the database from the official fixture file:

```bash
# Ingest all 25 public cases and calculate results
cd backend
npm run seed:fixture

# Reset existing data and perform a clean re-import
npm run seed:reset
```

---

## 4. Judge-Friendly Test Procedure

To verify all features in under 3 minutes:

1. **Dashboard (`/`)**:
   * Review 5 KPI metric cards for the active dataset (e.g. `PUB-01`).
   * Switch the dataset dropdown in the top header to `PUB-02` or `PUB-07` and observe real-time chart updates.
2. **Student Roster (`/students`)**:
   * Filter by status (e.g. *Needs Review* or *Failed Only*).
   * Search for a student by ID (e.g., `S004`) or Name.
3. **Student Calculation Trace (`/students/[id]`)**:
   * Click **"Audit Trace"** on student `S004` (in `PUB-07`).
   * Expand the **Auditable Calculation Trace** to inspect rule citations, theory/practical breakdown, and compulsory override alerts.
   * Click **"Edit Marks"**, modify a score (e.g., set Theory to `50` and Practical to `20`), and click **"Save & Recalculate Result"** to observe instant live database update and recalculated GPA.
4. **Checking Lists (`/checking-lists`)**:
   * Click through the 3 tabs: **Optional Checking**, **Practical Fail**, and **Absent Verification**.
   * Note the specific exception reasons and click **"Open Trace"** to jump to the affected student.
5. **Class Summary (`/class-summary`)**:
   * View pass vs. fail donut charts and the dynamically ranked **Most Failed Subjects** bottleneck list.
6. **CSV Import (`/import`)**:
   * Download the sample CSV template, test the drag-and-drop uploader, and review real-time validation feedback.
7. **Printable Marksheet (`/print/[id]`)**:
   * Click **"Print Marksheet"** to preview the official transcript layout with institutional headers, grading tables, and signature blocks.

---

## 5. Technology Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Material Symbols.
* **Backend**: Express.js, Node.js (v20+), TypeScript, Mongoose.
* **Database**: MongoDB with compound unique indexes.
* **Testing**: Vitest (pure unit test execution).
* **Package Manager**: npm.

---

## 6. Local Setup & Installation

### Prerequisites
* Node.js `v20.x` or higher
* MongoDB instance running locally or via connection URI

### 1. Clone & Configure Environment

```bash
git clone https://github.com/Kawsar37/lsh26-t055-p08.git
cd lsh26-t055-p08

# Create environment configuration
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

### 2. Backend Setup & Data Seeding

```bash
cd backend
npm install
npm run seed:fixture   # Ingests all 25 official cases and calculates results
npm run dev            # Starts API on http://localhost:5000
```

### 3. Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev            # Starts Next.js app on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Problem-Solving Methodology & GPA Rules

1. **Grade Point Scale**:
   * Standard discrete scale: $80\text{--}100 \rightarrow 5.0$, $70\text{--}79 \rightarrow 4.0$, $60\text{--}69 \rightarrow 3.5$, $50\text{--}59 \rightarrow 3.0$, $40\text{--}49 \rightarrow 2.0$, $33\text{--}39 \rightarrow 1.0$, $<33 \rightarrow 0.0$ (`FAIL`).
2. **Practical Subjects (Rule R-11)**:
   * Theory out of $75$ (Pass $\ge 25$), Practical out of $25$ (Pass $\ge 8$).
   * A subject passes **only if both components meet their respective minimum thresholds**. If either fails, $\text{GP} = 0.0$ and status is `FAIL`.
   * When both pass, $\text{Total} = \text{Theory} + \text{Practical}$, mapped to standard letter grade.
3. **Absences (Rule R-12)**:
   * Marked as `AB`. Compulsory `AB` forces overall result to `FAIL` (`F`). Optional `AB` yields $0.0$ bonus without failing the student overall.
4. **Optional 4th Subject Bonus (Rule R-13)**:
   * $\text{Bonus} = \max(0, \text{optionalGP} - 2.0)$.
   * The GPA divisor is **always strictly 6**.
5. **Compulsory Failure Override**:
   * Any compulsory subject failure overrides Final GPA to $0.00$ (`F`), while the uncancelled GPA remains preserved for transparent auditing.

---

## 8. Team Contributions

| Member | GitHub Username | Role | Major Contributions | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Kawsar** | `Kawsar37` | Full-Stack Engineer | Pure deterministic GPA engine, MongoDB multi-case schemas, REST controllers, Next.js Stitch UI implementation, Vitest suites | Repository commits & git history |

---

## 9. AI Usage Disclosure

| Tool | Used For | How Output Was Verified |
| :--- | :--- | :--- |
| **Stitch** | Initial visual design layout and design token generation | Manual CSS/Tailwind alignment against Stitch specifications |
| **Antigravity AI** | Implementation pair-programming for result engine, REST APIs, and Next.js frontend | 13 automated unit tests (`npm test`), Next.js production builds (`npm run build`), and live browser testing |

---

## 10. Major Design Decisions

1. **Decoupled Pure Domain Engine**: GPA calculation logic is isolated in pure TypeScript functions (`backend/src/services/resultEngine/`) with no database dependencies, allowing sub-millisecond execution and 100% testability.
2. **Compound Index Isolation**: Used `{ caseId: 1, studentId: 1 }` across all models to natively support all 25 public fixture datasets simultaneously without cross-case collision.
3. **Audit Transparency**: Uncancelled GPA is preserved alongside compulsory failure overrides so educators and auditors have full visibility into raw vs. final academic standing.
4. **Reactive CaseContext**: Client-side context provider allows switching between official fixture cases across all views without hard page refreshes.

---

## 11. Known Limitations

* **Print Marksheet**: Uses browser-native print layout (`@media print`) rather than server-side headless Chromium PDF generation.
* **Authentication**: Authentication and role-based access control (RBAC) are excluded per hackathon specification.
