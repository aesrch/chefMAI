# PROJECT_MEMORY.md — Chef MAI

> **Purpose:** Persistent project knowledge base. Never overwrite — only append to Session Log.

---

## Architecture Overview

### Backend
- **Framework:** Ktor (Kotlin) + Exposed ORM
- **Database:** MySQL 9.3 (`cookingdb`)
- **Entry:** `Application.kt` → `configureRouting()` in `Routing.kt`
- **Pattern:** Routes → Services → Repositories → Tables (Exposed)
- **Auth:** BCrypt + Ktor Sessions (cookie: `USER_SESSION`)

### Frontend
- **Framework:** React + Vite + TypeScript + TailwindCSS
- **Entry:** `App.tsx` → `UserPortal.tsx` / `AdminPortal.tsx`
- **API Base:** `http://localhost:8080`

---

## Database Schema

| Table | Rows (at audit) | Purpose |
|-------|----------------|---------|
| `acctable` | 8 | User accounts (PK: accID) |
| `rcptable` | 25 | Recipes (ingredients as CSV, steps with `\|\|` delimiter) |
| `ratetable` | 0 | Ratings (FK to rcptable + acctable) |
| `rcpcoltable` | 0 | User bookmarks/favorites (composite PK) |
| `imgtable` | 33 | Uploaded images |
| `ingredient_substitutions` | 55 | Smart ingredient substitution mappings |
| `nb_model_params` | (auto) | Naive Bayes classifier parameters |
| `user_preferences` | (auto) | User interaction signals for Bayesian learning |
| `recommendation_logs` | (auto) | Per-recommendation scores + feedback |

### Important Data Conventions
- `rcpIngred` → comma-separated: `"beef,garlic,onion"`
- `rcpSteps` → pipe-delimited: `"Step 1||Step 2||Step 3"`
- `rcpAmount` → comma-separated (parallel to ingredients)

---

## Recommendation Engine

### Formula
```
FinalScore = (0.50 × IngredientMatchScore)
           + (0.30 × NaiveBayesSuitability)
           + (0.20 × BayesianPreferenceScore)
```

### Components
| Component | File | Description |
|-----------|------|-------------|
| Match Scoring | `MatchScoringService.kt` | Jaccard-style: matched/required |
| Naive Bayes | `NaiveBayesService.kt` | Multi-class with Laplace smoothing, log-space |
| Bayesian Preference | `BayesianPreferenceService.kt` | Beta distribution prior, interaction-weighted |
| Substitution Engine | `SubstitutionService.kt` | Fuzzy match against 55 seed substitutions |
| Orchestrator | `RecommendationEngine.kt` | Combines all three, logs to recommendation_logs |
| Metrics | `MetricsService.kt` | Precision, Recall, F1, Precision@K |

### API Endpoints Added
| Method | Path | Description |
|--------|------|-------------|
| POST | `/recommend` | Hybrid recommendation (main endpoint) |
| POST | `/recommend/feedback` | Update recommendation feedback |
| GET | `/substitutions?ingredient=X` | Find substitutions |
| GET | `/substitutions/all` | All substitutions |
| POST | `/nb/train` | Retrain Naive Bayes model |
| GET | `/nb/status` | Model status |
| POST | `/preferences/track` | Track user interaction |
| GET | `/preferences/scores` | User genre affinity scores |
| GET | `/metrics/summary` | Full metrics dashboard data |
| GET | `/metrics/precision-at-k/{k}` | Precision@K detail |
| POST | `/detection/recommend` | CV → Recommendation pipeline |

---

## Migration Log

| Version | File | Description |
|---------|------|-------------|
| V001 | `V001__create_ingredient_substitutions.sql` | Substitutions table |
| V001b | `V001b__seed_substitutions.sql` | 55 seed substitutions |
| V002 | `V002__create_nb_model_params.sql` | NB model parameters table |
| V003 | `V003__create_user_preferences.sql` | User preferences table |
| V004 | `V004__create_recommendation_logs.sql` | Recommendation logs table |

All migrations in: `backend/migrations/`

---

## Frontend Changes

| Component | Change |
|-----------|--------|
| `KitchenScreen.tsx` | Replaced static `computeMatch` + `RECIPES` with `POST /recommend` API call. Added loading, error states. `findRecipes()` is now `async`. |
| `AdminPortal.tsx` | Added "Metrics" tab (4th tab), imports `MetricsDashboard` |
| `MetricsDashboard.tsx` | New component — live metrics from `GET /metrics/summary` + NB retrain button |

---

## Known Issues / TODOs
- `recipe.time`, `recipe.calories`, `recipe.servings`, `recipe.difficulty`, `recipe.rating` in `KitchenScreen` are **defaulted** (30min, 400cal, 2, Medium, 4.0) because `rcptable` doesn't store these fields yet. Add columns when needed.
- `CookingView` `userIngredients` prop is still passed but used only for legacy `userHas` check — now using `matchedIngredients` from API.
- YOLO detection (`/detection/recommend`) requires separate Python YOLO server at `localhost:8001`.

---

---

## How to Run the System

### Prerequisites
| Requirement | Version | Notes |
|-------------|---------|-------|
| JDK | 17+ | Required for Ktor backend |
| Node.js | 18+ | Required for Vite frontend |
| MySQL | 8.0+ | Database must be running |
| Python | 3.9+ | Required for YOLO CV server (optional) |
| Gradle | (wrapper included) | No separate install needed |

---

### 1. Database Setup
Make sure MySQL is running, then create the database and run migrations:

```sql
-- In MySQL client:
CREATE DATABASE IF NOT EXISTS cookingdb;
```

Migrations are in `backend/migrations/`. Run them in order:
```powershell
# From the project root, connect to MySQL and source each file:
mysql -u root -p cookingdb < backend/migrations/V001__create_ingredient_substitutions.sql
mysql -u root -p cookingdb < backend/migrations/V001b__seed_substitutions.sql
mysql -u root -p cookingdb < backend/migrations/V002__create_nb_model_params.sql
mysql -u root -p cookingdb < backend/migrations/V003__create_user_preferences.sql
mysql -u root -p cookingdb < backend/migrations/V004__create_recommendation_logs.sql
```

---

### 2. Backend (Ktor — Port 8080)

**Configure environment:**

The backend reads from `backend/.env`. Default values:
```env
DB_URL=jdbc:mysql://localhost:3306/cookingdb
DB_DRIVER=com.mysql.cj.jdbc.Driver
DB_USER=root
DB_PASSWORD=1234567890
IMAGE_BASE_PATH=D:/files/Online Classes/College/3rd Year/2nd Sem/random/chefMAI/backend
YOLO_BASE_URL=http://localhost:8001
```
> ⚠️ Update `IMAGE_BASE_PATH` to match your local path.

**Run the backend:**
```powershell
cd backend
.\gradlew.bat run
```

The server starts at **http://localhost:8080**  
Health check: `GET http://localhost:8080/health`

On startup, the Naive Bayes model **auto-trains** from existing recipe data.

---

### 3. Frontend (Vite React — Port 5173)

```powershell
cd frontend
npm install        # first time only
npm run dev
```

The app starts at **http://localhost:5173**

> The frontend is hardcoded to call `http://localhost:8080` as the API base.
> Both backend and frontend must be running at the same time.

---

### 4. YOLO CV Server (Optional — Port 8001)

The Computer Vision ingredient detection requires a separate Python server.

```powershell
# From the yolo/ directory (if present):
pip install -r requirements.txt
python yolo_server.py
```

Runs at **http://localhost:8001**  
If not running, `/detection/ingredients` and `/detection/recommend` will return errors, but the rest of the app works fine.

---

### 5. Admin Portal

Navigate to **http://localhost:5173**, then log in with admin credentials.  
The Admin Console is accessible from the login screen when signing in as an admin account.

Admin tabs:
- **Dashboard** — system KPIs + ML metrics overview (static)
- **Users** — user management (search, suspend, delete)
- **Reviews** — review moderation (approve/remove)
- **Metrics** — live recommendation engine metrics from `GET /metrics/summary`

---

### Quick Start (all at once)

Open **three separate terminals**:

```powershell
# Terminal 1 — Backend
cd backend
.\gradlew.bat run

# Terminal 2 — Frontend
cd frontend
npm run dev

# Terminal 3 — YOLO (optional)
cd yolo
python yolo_server.py
```

---

## Session Log

### Session 1 — 2026-06-17
**Performed by:** Antigravity (Gemini)

**Actions:**
1. Full codebase audit (backend routes, services, DB schema, frontend components)
2. Produced Architecture Audit, Database Audit, Gap Analysis, Implementation Roadmap (implementation_plan.md)
3. Ran 5 MySQL migrations (V001, V001b, V002, V003, V004) — confirmed 9 tables now in `cookingdb`
4. Created 4 Exposed table definitions (SubstitutionTable, NbModelTable, UserPreferenceTable, RecommendationLogTable)
5. Created 4 DTOs (substitution, recommendation, preference, metrics)
6. Created 4 repositories (SubstitutionRepository, NbModelRepository, UserPreferenceRepository, RecommendationLogRepository)
7. Created 5 services (SubstitutionService, MatchScoringService, NaiveBayesService, BayesianPreferenceService, RecommendationEngine, MetricsService)
8. Created 5 route files (SubstitutionRoutes, RecommendationRoutes, NbRoutes, PreferenceRoutes, MetricsRoutes)
9. Added `getAllRecipes()` to `RcpRepository`
10. Updated `Routing.kt` — wired all services + NB auto-trains on startup
11. Updated `DetectionRoutes.kt` — added `/detection/recommend` for CV→Recommendation pipeline
12. Updated `KitchenScreen.tsx` — replaced hardcoded recommendation with backend API
13. Created `MetricsDashboard.tsx` — live metrics + NB retrain button
14. Updated `AdminPortal.tsx` — added Metrics tab
15. Backend: **BUILD SUCCESSFUL** (warnings only, no errors)

**Status:** All 7 priorities implemented.
