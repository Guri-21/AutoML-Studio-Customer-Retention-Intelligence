# AutoML Studio v4.0

**A Full-Stack Automated Machine Learning Platform for Customer Analytics & Retention Intelligence**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini_via_OpenRouter-8E75B2?logo=google&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production_Ready-success)

---

## 🎯 Project Overview

AutoML Studio is a **production-grade, full-stack machine learning platform** that transforms raw CSV data into actionable business intelligence — automatically. Upload any customer, sales, or transactional dataset and receive instant insights from **seven parallel ML pipelines** covering anomaly detection, churn prediction, demand forecasting, **product retention analysis with manufacturing recommendations**, data profiling, correlation analysis, and distribution modeling. Includes an **AI-powered chatbot** (Gemini via OpenRouter) that can discuss your analysis results in natural language.

### Evolution of this Project

This project began as a single-file **Streamlit dashboard** for cohort retention analysis on the DataCo Smart Supply Chain dataset. It has since been **completely rearchitected from the ground up** into a modern, decoupled, multi-service application spanning three separate services, a persistent database layer, full user authentication, an admin panel, and a SaaS-ready landing page.

| Phase | Description |
|:------|:------------|
| **v1.0** — Streamlit Dashboard | Single `dashboard.py` file. Static cohort heatmaps and retention metrics. No auth, no persistence. |
| **v2.0** — Data Pipeline | Added `create_database.py` for data preprocessing, SQL queries, and Jupyter notebooks for exploration. |
| **v3.0** — AutoML Studio | Full-stack SaaS rebuild: React frontend, Node.js API, FastAPI ML engine, MongoDB persistence, JWT authentication, admin panel, usage tracking, and a polished landing page. |
| **v4.0** — Retention Intelligence (Current) | Added Product Retention Forecast with manufacturing recommendations, AI Chatbot powered by Gemini via OpenRouter, 7-pipeline analytics engine, and enhanced Forecast tab with sparkline charts and action cards. |

---

## ✨ Complete Feature List

### 🏗️ 1. Decoupled Three-Service Architecture

The monolithic Streamlit script was replaced with three cooperating services:

| Service | Technology | Port | Role |
|:--------|:-----------|:-----|:-----|
| **Frontend** | React 19 + Vite | `5173` | Interactive UI, data visualization, routing |
| **Backend API** | Node.js + Express 5 | `5001` | Authentication, data persistence, file handling, usage tracking |
| **Analytics Engine** | Python + FastAPI | `8000` | All ML model execution, data processing |

A single `start_services.sh` script boots all three services simultaneously with colored output and graceful `CTRL+C` shutdown.

---

### 🔐 2. User Authentication System

A complete JWT-based authentication system was built from scratch:

- **Registration** — Name, email, password, and optional company field. Passwords are hashed with **bcrypt** (12 salt rounds).
- **Login** — Email + password authentication issuing **7-day JWT tokens**.
- **Session Persistence** — Tokens and user info are saved to `localStorage` and automatically restored on page reload via the `AuthContext` provider.
- **Role-Based Access** — Users are assigned a `role` (`user` or `admin`) and an `orgId` for multi-tenant organization support.
- **Protected Routes** — All API endpoints behind `/api/analysis`, `/api/upload`, and `/api/usage` require a valid Bearer token.
- **Auth Middleware** — A dedicated JWT verification middleware (`backend/middleware/auth.js`) guards sensitive endpoints.
- **Seeded Admin Account** — An admin user (`admin@automl.studio` / `admin123`) is automatically created on server boot for immediate access.

**Frontend auth features:**
- Animated login/signup forms with **real-time input focus highlighting** (Framer Motion `layoutId` transitions)
- Password show/hide toggle with smooth micro-animations
- Inline error banners with animated entry/exit
- Animated loading indicator (bouncing dots) on submit
- Subtle shimmer hover effect across the submit button

---

### 🧠 3. Seven Automated ML Pipelines

The Python analytics engine (`analytics_engine/`) runs **seven independent ML pipelines** on every uploaded CSV — zero configuration required.

#### 3a. Data Profiling (`models/profiler.py → run_data_profile`)
- Column-level statistics: dtype, missing count, missing %, unique count
- Numeric columns: mean, std, min, max
- Categorical columns: top 3 most frequent values with counts
- **Data Quality Score** — Computed as `(1 - total_missing_cells / total_cells) × 100`
- Total memory usage in MB
- Split of numeric vs. categorical column counts

#### 3b. Anomaly Detection (`models/anomaly.py → run_anomaly_detection`)
- **Algorithm**: Isolation Forest (Scikit-Learn) with 1% contamination threshold
- **Anomaly scoring**: `decision_function()` produces continuous anomaly scores for every row
- **Severity distribution**: Critical / High / Medium — bucketed by score percentiles (10th and 40th)
- **Top anomaly drivers**: Computes mean deviation (%) between anomaly rows and normal rows for each numeric feature, ranks the top 5
- **Flagged samples**: Returns the 15 most anomalous rows (lowest scores) with their values
- **Profile comparison**: Normal vs. anomaly profile means for every numeric column

#### 3c. Churn Prediction (`models/churn.py → run_churn_prediction`)
- **Auto-detection** of Customer ID, Date, and Monetary columns via keyword matching (`_find_customer_column`, `_find_date_column`, `_find_monetary_column`)
- **RFM Feature Engineering**: Automatically computes Recency (days since last purchase), Frequency (transaction count), and Monetary (total spend) per customer
- **Heuristic labeling**: Customers in the top 25th percentile of recency are flagged as churned
- **Algorithm**: Random Forest Classifier (100 estimators, max depth 5) trained on StandardScaler-normalized RFM features
- **Risk segmentation**: Customers are binned into Low Risk (< 30%), Medium Risk (30–60%), and High Risk (> 60%) based on churn probability
- **Feature importance**: Random Forest feature importances for recency, frequency, and monetary
- **Top at-risk customers**: Returns the 10 customers with the highest churn probability, with their full RFM metrics
- Overall churn rate and retention rate percentages

#### 3d. Time-Series Forecasting (`models/forecasting.py → run_time_series_forecast`)
- **Auto-detection** of Date and Sales/Revenue columns
- Aggregates transaction data to daily granularity
- **Trend fitting**: Linear polynomial regression (`np.polyfit`) on the full time series
- **Moving average offset**: Applies a 7-day moving average correction to align the trend line with recent observed behavior
- **30-day forward projection** with non-negative clamping
- Returns both historical sample (last 30 days) and forecast data for charting

#### 3e. Product Retention Forecast (`models/forecasting.py → run_product_retention_forecast`) ✨ NEW
- **Auto-detects** Customer ID, Date, Product Name/Category, Sales, and Quantity columns
- **Identifies returning customers** — Customers with ≥2 distinct order dates vs one-time buyers
- **Retention lift scoring** — Computes how much more likely returning customers buy each product compared to one-time buyers (e.g., 6.78x means returners are 6.78× more likely to purchase it)
- **Per-product demand forecast** — Runs individual 30-day linear trend + moving average forecasts for the top 5 retention-driving products
- **Manufacturing recommendations** — Generates structured action items per product:
  - **Increase production** — retention-driving product with growing demand
  - **Hold / Monitor** — stable or slightly declining demand
  - **Decrease inventory** — declining demand among returners
- **Urgency levels** (high/medium/low) based on trend magnitude and retention lift
- Returns full product stats, historical data, forecast data, and a manufacturing actions summary

#### 3f. Correlation Analysis (`models/profiler.py → run_correlation`)
- Computes the full Pearson correlation matrix for numeric columns
- If more than 15 numeric columns exist, selects the top 15 by variance to avoid huge matrices
- **Top correlating pairs**: Ranks all column pairs by absolute correlation, returns the top 10
- Returns the full matrix as a 2D array for heatmap rendering

#### 3g. Distribution Analysis (`models/profiler.py → run_distribution`)
- Selects the top 8 numeric columns by variance
- Generates 20-bin histograms (`np.histogram`) for each column
- Returns bin edges, counts, mean, median, and standard deviation per column

---

### 💾 4. Persistent Data Storage (MongoDB)

All analysis results are now permanently stored in MongoDB, replacing the volatile in-memory-only approach:

- **Analysis Schema** (`backend/models/Analysis.js`) — Stores `userId`, `filename`, `rowsProcessed`, `columnsProcessed`, `results`, and `createdAt`
- **Large Result Handling** — ML output that exceeds MongoDB's 16 MB BSON limit is serialized to disk as JSON files in `backend/uploads/` and the file path is stored in the document instead
- **User Schema** (`backend/models/User.js`) — Stores name, email, bcrypt-hashed password, company. Includes a Mongoose `pre('save')` hook for automatic password hashing and a `comparePassword()` instance method.
- **CRUD Operations** — Full create/read/delete lifecycle via `POST /api/analysis`, `GET /api/analysis`, `GET /api/analysis/:id`, `DELETE /api/analysis/:id`
- **Graceful MongoDB Fallback** — If MongoDB is unavailable on startup, the server continues running with in-memory stores and logs a warning instead of crashing

---

### 📊 5. Interactive Dashboard Application

The authenticated dashboard (`/app/*`) is a complete single-page application with persistent sidebar navigation:

#### Navigation & Layout
- **Persistent sidebar** with grouped sections: Main (Workspace, History, Usage), Library (Datasets, Reports), Account (Settings), and Admin (Admin Panel — conditionally rendered for admin users only)
- **Morphing active indicator** — The sidebar highlight uses Framer Motion `layoutId` to fluidly animate between navigation items
- **User avatar** with dynamically computed initials from the user's name
- **Dark/Light mode toggle** accessible from the sidebar at all times
- **Sign-out button** that clears `localStorage` and navigates to the landing page

#### Workspace (`/app`) — The CSV Upload & Analysis Hub
- **Drag-and-drop file upload** with animated scale-up on drag hover and spring physics on the upload icon
- **File preview badge** showing filename and size (in MB) with bouncy entry animation
- **Animated 6-stage pipeline view** during ML processing:
  - Stages: Uploading → Cleaning data → Anomaly detection → Churn prediction → Forecasting → Finalizing
  - Breathing AI brain icon with concentric pulsing ring animations
  - Contextual AI messages that crossfade with blur transitions
  - Horizontal pipeline progress bar with green checkmarks for completed stages and spinning sparkle icon for the active stage
  - Each stage node has a pulsing ring animation when active
- **Multi-tab results view** with 7 tabs: Overview, Anomalies, Churn, Forecast, Profile, Correlations, Data Health
  - Tab switcher uses a **morphing background indicator** (`layoutId="active-tab"`) for fluid transitions
  - Tab content uses directional slide + fade animations on switch

#### Analysis Tabs (6 dedicated visualization components)

| Tab | Component | Visualizations |
|:----|:----------|:---------------|
| **Overview** | `OverviewTab.jsx` | KPI metric cards (rows, columns, anomalies, churn risk), Pipeline status table (Complete/Skipped for all 7 pipelines), contextual alert banners for anomalies and churn |
| **Anomalies** | `AnomalyTab.jsx` | Anomaly count, anomaly %, severity badges (Critical/High/Medium), animated driver importance bars, scrollable flagged records table with scores |
| **Churn** | `ChurnTab.jsx` | 4-card KPI grid (total, high/medium/low risk), animated Recharts donut chart with color-coded segments, animated feature importance bars, at-risk customer table with ID/Recency/Frequency/Monetary/Churn% |
| **Forecast** | `ForecastTab.jsx` | **Two-section layout**: (1) Overall demand forecast with trend chart, (2) **Product Retention Forecast** with returning customer stats, retention-driving products table with sparkline mini-charts, trend badges, expandable per-product forecast charts, manufacturing recommendation cards with urgency indicators, and a Key Insight banner |
| **Profile** | `ProfileTab.jsx` | Full column-by-column statistics table, data quality score, memory usage, numeric vs. categorical breakdown |
| **Correlations** | `CorrelationTab.jsx` | Correlation matrix visualization, top correlating pairs list with values |
| **Data Health** | `DataHealthTab.jsx` | Overall health score, completeness/uniqueness metrics, duplicate detection, issue identification with fix suggestions, auto-fix CSV download |

#### History Page (`/app/history`)
- **Timeline view** with vertical left-border connector line and accent-colored dots
- Each entry shows pipeline execution name, dataset filename, row count, and timestamp
- Direct "Full Report" button linking to the individual report viewer

#### Datasets Page (`/app/datasets`)
- **Card grid** with animated staggered entry
- Each card shows filename, creation date, rows processed, columns processed
- "View Analysis" button to jump directly to the report

#### Reports Page (`/app/reports`)
- **List view** with icon-highlighted rows
- Hover effects transitioning the arrow icon to accent-colored background
- Click anywhere on a row to navigate to the full report

#### Report Viewer (`/app/reports/:id`)
- Fetches a saved analysis from MongoDB by ID
- Maps the stored data back to the shape expected by `ResultsView`
- Provides a back-arrow button with the same morphing tab interface as the Workspace
- Fully reuses all 6 analysis tab components

#### Usage Analytics Page (`/app/usage`)
- **3 KPI cards**: Total Analyses (all-time), Rows Processed (cumulative), This Week (last 7 days)
- **Weekly Activity bar chart** — Recharts bar chart with the last 7 days of activity, themed to the current dark/light mode
- **Recent Analyses list** — Scrollable list of the user's last 10 analyses with filename, timestamp, and row count badge
- Data sourced from `GET /api/usage/me` which aggregates per-user logs

#### Settings Page (`/app/settings`)
- **Profile card** — Name, Email, Company, Role (with colored badge), Organization ID
- **Appearance card** — Dark/Light mode toggle
- **Plan & Billing card** — Current plan badge (Free Plan) with "Upgrade (Coming Soon)" button
- **Danger Zone** — Delete Account button with red alert styling
- **Keyboard Shortcuts card** — Documents `⌘K` (Command Palette) and `⌘/` (Toggle Theme)

---

### 🛡️ 6. Admin Panel (`/app/admin`)

A role-gated admin dashboard accessible only to users with `role: "admin"`:

- **Overview Tab** — 4 KPI cards (Total Users, Organizations, Analyses Run, Rows Processed) + Recent Activity feed from platform-wide usage logs
- **Users Tab** — Full user table: Name, Email, Role (color-coded badge), Organization, Join Date. Fetched from `GET /api/auth/admin/users`.
- **Organizations Tab** — Org table: Name, Plan (badge), Member Count (computed), Created Date. Fetched from `GET /api/auth/admin/orgs`.
- **Admin-only API Endpoints**:
  - `GET /api/auth/admin/users` — List all registered users
  - `GET /api/auth/admin/orgs` — List all organizations with member counts
  - `POST /api/auth/admin/orgs` — Create a new organization
  - `PATCH /api/auth/admin/users/:id` — Update a user's role or organization
  - `GET /api/usage/admin/stats` — Platform-wide analytics (total analyses, total rows, unique users, per-org breakdown, 14-day daily chart, recent 20 logs)

---

### ⌘ 7. Command Palette

A macOS Spotlight-style command palette (`CommandPalette.jsx`):

- Triggered via `⌘K` (or `Ctrl+K`) keyboard shortcut
- Full-text fuzzy search across all 6 navigation targets: Workspace, Usage Analytics, Settings, Admin Panel, Reports, Analysis History
- Backdrop blur overlay with smooth scale + fade animation
- ESC key or backdrop click to dismiss
- Each command shows an icon, label, and navigates on click

---

### 🤖 8. AI Data Assistant (Chatbot)

A floating AI chatbot (`AIChatbot.jsx`) powered by **Gemini 2.0 Flash via OpenRouter**:

- **Floating toggle button** — Bottom-right sparkle icon with pulsing ring animation
- **Chat panel** — 400×560px glassmorphic panel with smooth spring entry/exit
- **Starter suggestions** — 4 pre-built prompts: "Summarize my analysis results", "What are the key anomaly patterns?", "How can I reduce churn?", "Which columns have data quality issues?"
- **Context-aware responses** — The chatbot has full access to the current analysis context including:
  - Data profile, anomaly detection results, churn prediction, forecast summary
  - **Product retention forecast** — Which products drive repeat customers, retention lifts, manufacturing recommendations
  - Data health scores, top correlations
- **Markdown rendering** — Bot responses support bold text, bullet points, and inline code formatting
- **Loading animation** — Three bouncing dots while waiting for AI response
- **Error handling** — User-friendly messages for rate limits, timeouts, invalid keys, and safety filters
- **Backend**: `POST /api/chat` route uses OpenRouter's OpenAI-compatible API with 30-second timeout
- **Test endpoint**: `GET /api/chat/test` to verify AI configuration without authentication
- **API key validation** — On server startup, the API key is automatically validated with a test call

**Configuration**: Set `OPENROUTER_API_KEY` in `backend/.env` with your OpenRouter API key.

---

### 🎨 9. Design System & Theming

#### Custom CSS Design Token System (`index.css`)
A complete design token system using CSS custom properties with separate light and dark palettes:

| Token | Light | Dark |
|:------|:------|:-----|
| `--color-bg` | `#ffffff` | `#000000` |
| `--color-bg-card` | `#f5f5f7` | `#1c1c1e` |
| `--color-bg-elevated` | `#ffffff` | `#2c2c2e` |
| `--color-bg-hover` | `#e8e8ed` | `#3a3a3c` |
| `--color-text` | `#1d1d1f` | `#f5f5f7` |
| `--color-text-secondary` | `#6e6e73` | `#a1a1a6` |
| `--color-text-muted` | `#86868b` | `#636366` |
| `--color-border` | `#d2d2d7` | `#2c2c2e` |
| `--color-accent` | `#0071e3` | `#0a84ff` |
| `--color-success` | `#34c759` | `#30d158` |
| `--color-warning` | `#ff9f0a` | `#ffd60a` |
| `--color-danger` | `#ff3b30` | `#ff453a` |

- Font: Inter with Apple system font fallback stack
- 4-tier shadow system: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-card`
- `.text-gradient` utility: A linear gradient from accent to purple for hero headlines
- `ThemeContext` provider manages theme state, persists to `localStorage`, and respects `prefers-color-scheme: dark`

#### Apple-Level Motion Library (`lib/motion.js`)
A centralized, physics-based animation system with 126 lines of reusable presets:

| Preset | Usage | Physics |
|:-------|:------|:--------|
| `spring.gentle` | Cards, page transitions | stiffness: 120, damping: 14, mass: 1 |
| `spring.snappy` | Buttons, small UI | stiffness: 300, damping: 24, mass: 0.8 |
| `spring.bouncy` | Emphasis elements | stiffness: 150, damping: 12, mass: 1 |
| `spring.heavy` | Large elements | stiffness: 100, damping: 20, mass: 1.5 |
| `spring.micro` | Tiny interactions | stiffness: 400, damping: 30, mass: 0.5 |

Additional presets: `fadeUp`, `scaleIn`, `slideInLeft`, `slideInRight`, `stagger()`, `cardHover`, `buttonPress`, `pageTransition`, `scrollReveal`.

---

### 🌐 10. SaaS Landing Page

A fully built marketing landing page (`LandingPage.jsx`, 440 lines) with:

- **Responsive navigation bar** — Glassmorphism (`backdrop-blur-xl`), mobile hamburger menu with animated open/close, theme toggle, Sign In / Get Started CTAs
- **Hero Section** — Scroll-driven parallax with three depth layers (headline, subtitle, preview card move at different speeds), animated gradient background that scales on scroll, animated bar chart preview with spring-bouncy growth
- **Features Section** — 6-card grid with scroll-triggered reveal animations and hover lift effects. Each card highlights an ML pipeline: Churn Prediction, Anomaly Detection, Demand Forecasting, Data Profiling, Correlation Analysis, Multi-Tenant.
- **How It Works** — 3-step numbered flow: Upload → AI Analyzes → Get Insights. Spring-bouncy number scaling on scroll.
- **Pricing Section** — Monthly/Annual toggle, 3-tier pricing cards (Free, Pro at $29/mo, Enterprise). "Popular" badge with bouncy animation. Feature checklists with check icons.
- **CTA Section** — Full-width call to action with accent-colored button
- **Footer** — Copyright, Privacy/Terms/Docs links
- **Ambient Background** — Two continuously floating gradient orbs with 20s/25s animation loops for subtle depth

---

### 🔔 11. Toast Notification System

A global notification system (`ToastContext.jsx`):

- 4 notification types with distinct icons and colors: **success** (green), **error** (red), **warning** (amber), **info** (blue)
- Fixed position bottom-right with stacked layout
- Animated entry (slide up + scale) and exit (slide up + fade)
- Auto-dismiss after 4 seconds with manual dismiss via ✕ button
- Used throughout the app: analysis success, analysis failure, etc.

---

### 📁 12. File Upload Pipeline

The file upload flow touches three services:

1. **Frontend** → User drops/selects a CSV in the Workspace. `FormData` is POSTed directly to the FastAPI engine at `POST /api/analyze-csv`.
2. **FastAPI Engine** → Reads the file with robust UTF-8/Latin-1 fallback encoding, runs all 6 ML pipelines, and returns the aggregated JSON result.
3. **Backend** → After receiving results on the frontend, two parallel `POST` requests are made (non-blocking):
   - `POST /api/analysis` — Saves the full analysis result to MongoDB (or disk for large payloads)
   - `POST /api/usage/log` — Logs the action, filename, rows processed, columns processed, and processing duration for usage analytics

There is also an alternative upload route through the Express backend (`POST /api/upload/csv`) which proxies the file to the Python engine using Multer for server-side file handling with a 2-minute timeout and automatic temp file cleanup.

---

## 🏗️ Complete Technology Stack

| Layer | Technologies | Purpose |
|:------|:-------------|:--------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Framer Motion 12, Recharts 3, React Router 7, Axios, Lucide React | UI rendering, charting, animations, routing |
| **Backend API** | Node.js, Express 5, Mongoose 9, JWT (jsonwebtoken), bcryptjs, Multer, Axios, CORS, dotenv | Auth, data persistence, file handling, AI chat proxy |
| **Analytics Engine** | Python 3, FastAPI, Pandas, NumPy, Scikit-Learn, Uvicorn, Pydantic | ML model execution, data processing (7 pipelines) |
| **AI / LLM** | Gemini 2.0 Flash via OpenRouter (OpenAI-compatible API) | AI chatbot, context-aware data analysis assistant |
| **Database** | MongoDB | User accounts, analysis results, metadata |
| **DevOps** | Shell scripts, `.env` configuration | Service orchestration, environment management |

---

## 📁 Complete Project Structure

```
ecommerce-customer-retention-analysis/
│
├── frontend/                           # React SPA (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Marketing landing page (440 lines)
│   │   │   ├── AuthPage.jsx            # Login / Signup with animations
│   │   │   ├── DashboardApp.jsx        # Authenticated shell (sidebar + routing)
│   │   │   ├── DatasetsPage.jsx        # Saved datasets grid
│   │   │   ├── ReportsPage.jsx         # Saved reports list
│   │   │   ├── ReportViewer.jsx        # Single report detail viewer
│   │   │   ├── HistoryPage.jsx         # Timeline view of analysis history
│   │   │   ├── UsagePage.jsx           # Usage analytics with charts
│   │   │   ├── SettingsPage.jsx        # Profile, theme, plan, danger zone
│   │   │   └── AdminPanel.jsx          # Admin-only: users, orgs, stats
│   │   ├── components/
│   │   │   ├── Workspace.jsx           # Upload + Pipeline + ResultsView
│   │   │   ├── CommandPalette.jsx      # ⌘K command palette
│   │   │   ├── OverviewTab.jsx         # KPI cards + pipeline status
│   │   │   ├── AnomalyTab.jsx          # Anomaly drivers + flagged records
│   │   │   ├── ChurnTab.jsx            # Risk segments + pie chart + table
│   │   │   ├── ForecastTab.jsx         # Overall forecast + Product Retention Forecast
│   │   │   ├── ProfileTab.jsx          # Column stats + quality score
│   │   │   ├── CorrelationTab.jsx      # Correlation matrix + top pairs
│   │   │   ├── DataHealthTab.jsx       # Data health assessment + auto-fix
│   │   │   ├── AIChatbot.jsx           # Floating AI chatbot (OpenRouter)
│   │   │   └── Dashboard.jsx           # Legacy dashboard component
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # JWT auth state + localStorage
│   │   │   ├── ThemeContext.jsx         # Dark/light mode + system pref
│   │   │   └── ToastContext.jsx        # Global toast notifications
│   │   ├── lib/
│   │   │   └── motion.js              # Apple-level animation presets
│   │   ├── index.css                   # Design token system (light + dark)
│   │   ├── App.jsx                     # Root: providers + router
│   │   └── main.jsx                    # Vite entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                            # Node.js API Gateway
│   ├── routes/
│   │   ├── auth.js                     # Register, login, admin user/org CRUD
│   │   ├── analysis.js                 # Save, list, get, delete analyses
│   │   ├── chat.js                     # AI chatbot (OpenRouter/Gemini integration)
│   │   ├── upload.js                   # Multer CSV → FastAPI proxy
│   │   └── usage.js                    # Usage logging + personal/admin stats
│   ├── models/
│   │   ├── User.js                     # Mongoose user schema + bcrypt hooks
│   │   └── Analysis.js                 # Mongoose analysis schema
│   ├── middleware/
│   │   └── auth.js                     # JWT verification middleware
│   ├── uploads/                        # Temp file storage + large result JSONs
│   ├── .env                            # MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY
│   ├── server.js                       # Express app + MongoDB connection
│   └── package.json
│
├── analytics_engine/                   # Python FastAPI ML Service
│   ├── models/
│   │   ├── anomaly.py                  # Isolation Forest anomaly detection
│   │   ├── churn.py                    # RFM + Random Forest churn prediction
│   │   ├── forecasting.py             # Overall forecast + Product Retention Forecast
│   │   ├── data_health.py             # Data health assessment + auto-fix
│   │   └── profiler.py                # Data profiling, correlation, distribution
│   ├── main.py                         # FastAPI app + 7-pipeline /api/analyze-csv endpoint
│   └── requirements.txt               # FastAPI, Pandas, Scikit-Learn, etc.
│
├── dashboard.py                        # Legacy Streamlit dashboard (v1.0)
├── create_database.py                  # Original data preprocessing script
├── start_services.sh                   # One-command boot script for all 3 services
├── requirements.txt                    # Root Python dependencies
├── anaconda_projects/                  # Exploratory Jupyter notebooks
│   └── db/
│       ├── 01_data_exploration.ipynb
│       └── 02_database_creation.ipynb
└── sql_queries/
    └── retention_analysis.sql          # Reference SQL queries
```

---

## 🔧 Setup & Installation

### Prerequisites

| Requirement | Version |
|:------------|:--------|
| Node.js | v18+ |
| Python | 3.8+ |
| MongoDB | Running locally or via cloud URI |
| Git | Any recent version |

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/Guri-21/ecommerce-customer-retention-analysis.git
cd ecommerce-customer-retention-analysis

# 2. Set up the Python virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r analytics_engine/requirements.txt

# 3. Install Backend dependencies
cd backend
npm install
cd ..

# 4. Install Frontend dependencies
cd frontend
npm install
cd ..

# 5. Configure environment variables
# Edit backend/.env to set your own MONGO_URI, JWT_SECRET, and OPENROUTER_API_KEY
# Get an OpenRouter API key from https://openrouter.ai/keys

# 6. Start all services
chmod +x start_services.sh
./start_services.sh
```

### Service URLs

| Service | URL | Description |
|:--------|:----|:------------|
| **Frontend App** | `http://localhost:5173` | The main user-facing application |
| **Backend API** | `http://localhost:5001` | Express REST API gateway |
| **ML Engine** | `http://localhost:8000` | FastAPI analytics endpoint |

### Default Admin Credentials

| Field | Value |
|:------|:------|
| Email | `admin@automl.studio` |
| Password | `admin123` |

---

## 📊 API Reference

### Authentication
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |

### Analysis
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/analysis` | Save analysis results to MongoDB |
| `GET` | `/api/analysis` | List user's analyses (last 20) |
| `GET` | `/api/analysis/:id` | Get full analysis with ML results |
| `DELETE` | `/api/analysis/:id` | Delete an analysis |

### Upload
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/upload/csv` | Upload CSV via backend proxy |

### Usage
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/usage/log` | Log an analysis event |
| `GET` | `/api/usage/me` | Personal usage stats + 7-day chart |

### AI Chat
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/chat` | Send message to AI assistant (auth required) |
| `GET` | `/api/chat/test` | Test AI configuration (no auth) |

### ML Engine
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/` | Health check |
| `POST` | `/api/analyze-csv` | Run full 7-pipeline analysis on CSV |
| `POST` | `/api/clean-csv` | Remove anomalous rows and download cleaned CSV |
| `POST` | `/api/fix-csv` | Auto-fix data quality issues and download fixed CSV |

### Admin (Admin role required)
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/auth/admin/users` | List all users |
| `GET` | `/api/auth/admin/orgs` | List all organizations |
| `POST` | `/api/auth/admin/orgs` | Create organization |
| `PATCH` | `/api/auth/admin/users/:id` | Update user role/org |
| `GET` | `/api/usage/admin/stats` | Platform-wide analytics |

---

## 📞 Contact

**Name**: Gurnoor Partap Singh Bhogal
**Email**: itsguri21@gmail.com
**LinkedIn**: [linkedin.com/in/gurnoor-p-s-bhogal-533818272](https://www.linkedin.com/in/gurnoor-p-s-bhogal-533818272)

---

*This project demonstrates production-grade full-stack engineering — from Python machine learning pipelines and Node.js API design, to React component architecture, physics-based animation systems, and SaaS product design.*

**Technologies**: React • Node.js • Express • FastAPI • Python • MongoDB • Scikit-Learn • Gemini AI (OpenRouter) • TailwindCSS • Framer Motion • Recharts • JWT • Vite
