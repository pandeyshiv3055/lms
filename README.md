# AEGIS Defense & Security — Professional Interactive E-Learning LMS

> **Enterprise-grade, frontend-only interactive Learning Management System (LMS)** designed for security personnel, corporate facility guards, and compliance officers. Built with React 18, TypeScript, Vite, and Lucide icons using the original **Industrial Evergreen** design identity.

Inspired by modern interactive training standards (such as the Defencify reference learning experience), this application features a **slide-based instructional engine**, **timed progression**, **strict anti-skip rules**, an **interactive building and multi-room inspection simulation**, **knowledge checks**, **assessments with configurable passing scores**, and a **comprehensive administration suite**.

---

## 1. Quick Start & Evaluation Credentials

### Installation & Launch

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle & typecheck
npm run build
```

The application will launch on `http://localhost:5173` (or the configured Vite port).

### Demo Credentials

| Role | Email | Password | Quick Action |
| :--- | :--- | :--- | :--- |
| **Learner** | `learner@demo.test` | `Learner123!` | Click **"Demo Learner"** on login screen |
| **Administrator** | `admin@demo.test` | `Admin123!` | Click **"Demo Admin"** on login screen |

*Both roles can be entered in 1 click using the prominent evaluation buttons on `/login`.*

---

## 2. Visual Identity: Industrial Evergreen

The application uses an original, custom-engineered design system tailored for high-reliability command and security environments:

- **Deep Evergreen (`#173B3A`)**: Conveys physical security, stability, institutional authority, and trust.
- **Dark Graphite (`#242C2D`)**: High-contrast control room surfaces, player shell, and hardware rack aesthetic.
- **Warm Ivory (`#F5F2EA`)**: Comfortable presentation learning canvas reducing ocular fatigue during long study cycles.
- **Muted Copper (`#B87955`)**: Restrained tactical accent for active states, indicators, and important calls to action.
- **Pale Sage (`#DDE5D7`)**: Soft indicator for verified compliance, progress, and completed units.
- **Status Semantics**: Success (`#387A5A`), Error (`#B44D45`), Alert (`#C9882B`), Focus (`#D49B65`).
- **Typography**: Clean, presentation-scale sans-serif (`Inter` & `Manrope`) with distinct hierarchy.

---

## 3. Key Learning & Instructional Features

### 3.1 Interactive Course Player (`/learner/player/:courseId/:lessonId`)
- **Slide-Based Instructional Engine**: Timed progression, audio narration with transcripts, visual waveform indicators, and persistent state.
- **Strict Anti-Skip Enforcement**:
  - The **Next** control is disabled until the current slide's interaction (or duration) requirement is fully satisfied.
  - Future locked lessons cannot be accessed via the sidebar or by direct URL tampering.
  - Non-seekable progress tracks for locked content.
- **Pause & Resume Engine**:
  - Automatically captures elapsed time, active slide index, panel scroll position, and interaction state.
  - Listens to browser tab visibility changes (`visibilitychange`) to pause timers when the user leaves the tab.
  - Resumes seamlessly when the user returns.

### 3.2 Slide Types & Interactive Learning Components
1. **Presenter Carousel Board**: An officer in uniform pointing to a digital operations board. Left and right arrows change the content without page reload. Requires exploring all 4 operational phases to advance.
2. **Scrollable Legal Directives Panel**: An architectural seal on the left and an independently scrollable legal directives panel on the right. Enforces reading through the entire directive to satisfy the prerequisite.
3. **Four Core Duties Learn More Cards**: 4 operational duty cards (*Access Control, Responding to Hazards, Foot Patrols, Other Duties*). Clicking "Learn More" opens in-depth operational protocols and tracks full exploration.
4. **Knowledge Checks**: Single-choice, multiple-select, and true/false questions with immediate evaluative feedback, explanatory notes, and retry mechanics.
5. **Interactive Facility 04 Inspection Simulation**:
   - Building facade with 6 clickable zone targets (*Reception, Server Vault, Conf Room, SOC, Storage, Fire Exit*).
   - Interior vector room scenes with percentage-based coordinate hotspots.
   - Initial question: *"Are there any irregularities in this room?"*
   - Interactive clickable irregularity hotspots (*Unattended duffel bag, open server rack with dangling cables, unattended VIP laptop/badge, unmarked chemical spill, obstructed fire exit, and dangling broken light fixture*).
   - Instant reporting feedback detailing why the observation matters.
   - Comprehensive certification screen unlocking the subsequent lesson.

### 3.3 Assessment Engine & Gamification
- **10-Question Certification Exam**: Rigorous questions evaluating statutory boundaries, evidence preservation, hazard clearance, and de-escalation.
- **Configurable Passing Score**: Default 80% passing threshold configured in course rules.
- **Automated Score Calculation**: Deterministic points and percentage tracking.
- **Answer Review**: Comprehensive review mode explaining standard operating procedures.
- **Badge Awarding System**:
  - *Junior Security Officer* (Bronze)
  - *Patrol Specialist* (Silver)
  - *Certified Safety Observer* (Gold)
  - *Incident Reporter* (Silver)
  - *AEGIS Certified Professional* (Platinum)
- Anti-duplicate award prevention with celebratory confetti animations.

---

## 4. Administration Portal (`/admin/*`)

Administrators have access to a full management suite:

1. **Dashboard (`/admin/dashboard`)**: Computed KPIs (registered officers, published courses, average exam scores, completion rate, progression distribution charts).
2. **Course Catalog (`/admin/courses`)**: Filter by status (*Published, Draft, Archived*), create courses, duplicate courses, archive, publish/unpublish.
3. **Visual Slide Builder (`/admin/lessons`)**: Edit slide navigation titles, change layout types (*Intro, Instructor, Carousel, Scrollable Panel, Card Grid, Knowledge Check, Simulation*), edit completion rules, update text and audio narration scripts with **live side-by-side preview**.
4. **Room Scenario Editor (`/admin/scenarios`)**: Modify room prompt questions, rename zones, inspect irregularity coordinates, and preview the building facade.
5. **Assessment Manager (`/admin/quizzes`)**: Configure global passing score thresholds (default 80%), attempt limits, and manage question prompts and explanations.
6. **Media Library (`/admin/content-library`)**: Asset grid for building schematics, vector scenes, instructor portraits, and badge icons with demo device upload (using browser Object URLs).
7. **Officer Roster (`/admin/learners`)**: View individual learner progress, inspect dossiers, and reset demo data per officer.
8. **Settings (`/admin/settings`)**: Centralized system configuration and "Reset All Demo Data" factory restore.

---

## 5. Architecture & File Structure

```
src/
├── app/
│   └── App.tsx                      # Primary router & protected route guards
├── assets/
│   └── illustrations/               # High-contrast vector SVG assets
│       ├── building-facade.tsx      # Exterior architectural blueprint facade
│       ├── room-scenes.tsx          # 6 interactive interior room vector scenes
│       ├── presenter-board.tsx      # Presenter pointing to carousel board
│       ├── badges.tsx               # 5 official security credential emblems
│       └── course-covers.tsx        # 5 course cover cards
├── components/
│   ├── common/
│   │   ├── AudioNarrationPlayer.tsx # Audio narration with transcript drawer
│   │   └── Modal.tsx                # Accessible backdrop dialog
│   └── layout/
│       ├── Navbar.tsx               # Top learner header with brand wordmark
│       ├── LearnerShell.tsx         # Learner portal wrapper with compliance banner
│       └── AdminShell.tsx           # Admin portal wrapper with persistent sidebar
├── data/
│   └── seed/                        # Typed seed data
│       ├── courses.ts               # 5 accredited security courses
│       ├── scenario.ts              # Facility 04 6-room building scenario
│       ├── assessments.ts           # 10-question final exam
│       ├── badges.ts                # Qualification badge records
│       ├── users.ts                 # Demo officers and administrators
│       ├── media.ts                 # Content library assets
│       └── settings.ts              # Default system settings
├── features/
│   ├── auth/Login.tsx               # Demo login with 1-click evaluation access
│   ├── learner/
│   │   ├── Dashboard.tsx            # Learner dashboard with Continue Learning card
│   │   ├── CourseCatalogue.tsx      # Filterable & searchable curriculum catalogue
│   │   ├── CourseDetails.tsx        # Syllabus outline with lock indicators
│   │   └── Profile.tsx              # Officer profile & factory reset
│   ├── player/
│   │   ├── CoursePlayer.tsx         # Central player progression controller
│   │   ├── components/
│   │   │   ├── PlayerSidebar.tsx    # Fixed outline sidebar with locks
│   │   │   └── PlayerControls.tsx   # Controls, slide timer, and Next lock
│   │   ├── room-inspection/
│   │   │   └── BuildingInspectionActivity.tsx # Building & room inspection simulation
│   │   └── slide-renderers/         # Modular slide renderers
│   │       ├── IntroSlideRenderer.tsx
│   │       ├── CarouselSlideRenderer.tsx
│   │       ├── ScrollablePanelSlideRenderer.tsx
│   │       ├── CardGridSlideRenderer.tsx
│   │       ├── KnowledgeCheckSlideRenderer.tsx
│   │       └── QuizSlideRenderer.tsx
│   ├── progress/ProgressPage.tsx    # Course parts progress & badge showcase
│   └── admin/                       # Administration views
│       ├── Dashboard.tsx
│       ├── course-editor/
│       ├── lesson-builder/
│       ├── room-editor/
│       ├── quiz-builder/
│       ├── media-library/
│       ├── learners/
│       ├── analytics/
│       └── settings/
├── services/                        # Typed mock services & persistence layer
│   ├── storage.service.ts           # Safe versioned localStorage wrapper
│   ├── auth.service.ts              # Demo session & role guards
│   ├── course.service.ts            # Course CRUD & syllabus management
│   ├── progress.service.ts          # Central anti-skip & lesson access rules
│   ├── assessment.service.ts        # Quiz submission & scoring policy
│   ├── badge.service.ts             # Badge rule evaluation & confetti
│   ├── scenario.service.ts          # Room inspection configuration
│   ├── media.service.ts             # Media asset management
│   └── settings.service.ts          # System settings persistence
├── types/index.ts                   # Comprehensive TypeScript definitions
└── index.css                        # Industrial Evergreen design tokens & CSS system
```

---

## 6. Verification & Acceptance Testing Checklist

All 14 acceptance test suites specified in the master implementation guidelines have been implemented and verified:

- [x] **TEST 1 — Authentication**: Demo login succeeds for Learner and Admin with separate navigation and error validation.
- [x] **TEST 2 — Course Catalogue**: Seeded courses render with active search, category filters, and shared progress state.
- [x] **TEST 3 — Slide Player**: Slide renderers dynamically mount based on type; previous and next controls work within permitted range.
- [x] **TEST 4 — Anti-Skip Rules**: Incomplete slides keep Next disabled; locked lessons cannot be jumped to in sidebar or direct URL.
- [x] **TEST 5 — Pause & Resume**: Visibility changes pause timed progression; returning restores exact slide index, elapsed seconds, and scroll position.
- [x] **TEST 6 — Carousel**: Arrows change presentation board content; all 4 items must be explored to complete slide.
- [x] **TEST 7 — Scrollable Panel**: Independent scroll operates cleanly; reading to bottom satisfies completion condition.
- [x] **TEST 8 — Knowledge Check**: Immediate correct/incorrect feedback with explanations and attempt tracking.
- [x] **TEST 9 — Room Inspection**: Building overview displays 6 clickable zones; room scene accepts Yes/No and validates irregularity hotspots.
- [x] **TEST 10 — Assessment**: 10 questions with deterministic scoring; 80% passing threshold enforced with review mode.
- [x] **TEST 11 — Badges & Progress**: Badges awarded without duplication; course parts update immediately upon 100% completion.
- [x] **TEST 12 — Administration**: Courses can be edited/created; slide builder provides live preview; room editor modifies hotspots.
- [x] **TEST 13 — Persistence**: Refreshing retains progress in localStorage; "Reset Demo Data" restores initial factory state.
- [x] **TEST 14 — Responsive Design**: Clean layouts at desktop, tablet, and mobile breakpoints without clipped controls.

---

## 7. Known Limitations & Production Backend Integration Guide

As a frontend-only MVP, this application demonstrates functional learning flows using client-side mock persistence (`localStorage`):

1. **Authentication**: Authentication is simulated on the client. In a production deployment, replace `auth.service.ts` with OpenID Connect (OIDC) or OAuth 2.0 PKCE tokens validated by a secure authorization server.
2. **Anti-Skip & Progression**: While frontend route guards enforce progression for normal users, tamper-proof compliance requires a backend to validate slide completion timestamps and audio playback before granting certification tokens.
3. **Media Uploads**: Local file uploads are stored in browser memory via `URL.createObjectURL`. For production, connect `media.service.ts` to S3 or Cloud Storage with presigned upload URLs.
4. **Speech Narration**: Uses the standard Web Speech Synthesis API as an accessible demo fallback. Production can bundle high-fidelity MP3/AAC audio files recorded by professional voice actors.
