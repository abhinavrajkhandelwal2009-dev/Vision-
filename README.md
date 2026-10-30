# VisionIntelligence AI - Enterprise Computer Vision Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7.svg)](https://render.com/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%202.5%20Vision-purple.svg)](https://aistudio.google.com/)

An enterprise-grade, end-to-end **Computer Vision & Visual Intelligence Platform** that automates visual QA, defect detection, safety hazard auditing, and inventory compliance using Google Gemini multi-modal vision models (`@google/genai` SDK) and Supabase cloud infrastructure.

---

## 🏛️ Tri-System Architecture

The project is structured into **3 distinct, decoupled systems**:

```text
┌─────────────────────────┐     HTTPS API     ┌─────────────────────────┐     PostgreSQL / Storage     ┌─────────────────────────┐
│       1. CLIENT         │ ────────────────> │        2. SERVER        │ ─────────────────────────> │       3. BACKEND        │
│   React 18 / Vite SPA   │                   │    Express API Gateway  │                            │     Supabase Cloud      │
│  Target: VERCEL (CDN)   │ <──────────────── │   Multi-Modal Pipeline  │ <───────────────────────── │    Target: RENDER Host  │
└─────────────────────────┘      JSON JWT     └─────────────────────────┘          Public CDN        └─────────────────────────┘
```

1. **`client/` (Frontend System):**
   * Configured specifically for deployment on **Vercel**.
   * Includes `client/vercel.json` for SPA rewrites, headers, and asset caching.
   * Supabase browser client integration in [`client/src/config/supabaseClient.js`](file:///c:/Users/khand/OneDrive/Desktop/Computer%20Vision%20%26%20Visual%20Intelligence/client/src/config/supabaseClient.js).
   * Dedicated environment files: `client/.env` and `client/.env.example`.

2. **`server/` (API Server System):**
   * Express.js gateway handling authentication, rate limiting, and Gemini 2.5 Vision AI multi-modal inference.
   * Dedicated environment files: `server/.env` and `server/.env.example`.

3. **`backend/` (Cloud Infrastructure & Supabase System):**
   * Configured for deployment on **Render** (via `backend/render.yaml` and root `render.yaml`).
   * Supabase Database integration, Row-Level Security (RLS) migrations, and Object Storage services for the `inspection-assets` bucket.
   * Dedicated environment files: `backend/.env` and `backend/.env.example`.

---

## 📂 File System Structure

```text
vision-intelligence-ai/
├── client/                               # SYSTEM 1: FRONTEND (VERCEL)
│   ├── .env                              # Client Vercel environment
│   ├── .env.example                      # Client environment template
│   ├── vercel.json                       # Vercel deployment & SPA routing rules
│   ├── src/
│   │   ├── config/
│   │   │   └── supabaseClient.js         # Supabase client (VITE_SUPABASE_ANON_KEY)
│   │   ├── components/                   # Canvas, ResultCard, DropZone, Metrics
│   │   ├── pages/                        # Dashboard, Inspect, History, Settings
│   │   └── context/AuthContext.jsx       # Auth state connected to Render API
│   └── package.json
│
├── server/                               # SYSTEM 2: API SERVER
│   ├── .env                              # Server environment
│   ├── .env.example
│   ├── config/db.js                      # PostgreSQL pool (Supabase connection + fallback)
│   ├── controllers/                      # Auth & Inspection controllers
│   ├── middleware/                       # JWT auth & Zod schema validation
│   ├── services/geminiService.js         # Google Gemini 2.5 Vision SDK
│   └── server.js                         # Express entrypoint
│
├── backend/                              # SYSTEM 3: SUPABASE & RENDER BACKEND
│   ├── .env                              # Backend cloud environment
│   ├── .env.example
│   ├── render.yaml                       # Render Infrastructure-as-Code Blueprint
│   ├── config/
│   │   └── supabaseClient.js             # Supabase Admin (Service Role) & Anon clients
│   ├── services/
│   │   ├── supabaseStorageService.js     # Uploads to 'inspection-assets' Supabase Bucket
│   │   └── supabaseDbService.js          # Direct Supabase table queries & mutations
│   ├── supabase/
│   │   └── schema.sql                    # Complete Supabase DDL, RLS & Bucket schema
│   ├── testSupabase.js                   # Connection verification test script
│   └── package.json
│
├── .env                                  # Root environment (local orchestrator)
├── .env.example
├── render.yaml                           # Root Render Blueprint
├── package.json
└── README.md
```

---

## 🔑 Environment Variables Setup

Each system has its own `.env` file:

### 1. Client Environment (`client/.env`)
```env
# URL to your deployed Render Backend (or http://localhost:5000 for local dev)
VITE_API_URL=http://localhost:5000

# Supabase Public Anonymous Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Server Environment (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase Keys
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_STORAGE_BUCKET=inspection-assets

# PostgreSQL Direct Connection (From Supabase -> Settings -> Database)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

JWT_SECRET=super_secret_jwt_key_vision_intelligence_production_secure_token_2025
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Backend Environment (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
RENDER_EXTERNAL_URL=https://vision-intelligence-backend.onrender.com
CLIENT_URL=https://your-app.vercel.app

# Supabase Cloud Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_STORAGE_BUCKET=inspection-assets

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
JWT_SECRET=super_secret_jwt_key_vision_intelligence_production_secure_token_2025
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

---

## ⚡ Supabase Setup (3-Step Guide)

1. **Create Supabase Project:**
   * Go to [https://supabase.com](https://supabase.com) and create a project.
2. **Execute Database DDL & Bucket Schema:**
   * In your Supabase Dashboard, open **SQL Editor**.
   * Copy the complete SQL script from [`backend/supabase/schema.sql`](file:///c:/Users/khand/OneDrive/Desktop/Computer%20Vision%20%26%20Visual%20Intelligence/backend/supabase/schema.sql) and click **Run**.
   * This automatically provisions the `users` table, `inspections` table, RLS policies, and the public `inspection-assets` storage bucket.
3. **Copy Supabase Credentials:**
   * Go to **Project Settings -> API**:
     * Copy **Project URL** into `SUPABASE_URL` / `VITE_SUPABASE_URL`.
     * Copy **anon / public key** into `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`.
     * Copy **service_role key** (secret) into `SUPABASE_SERVICE_ROLE_KEY`.
   * Go to **Project Settings -> Database**:
     * Copy the **Connection String (URI)** into `DATABASE_URL`.
4. **Test Connection:**
   ```bash
   node backend/testSupabase.js
   ```

---

## 🚀 Deployment Instructions

### 1. Deploy Backend on Render
1. Push this repository to GitHub or GitLab.
2. In [Render Dashboard](https://dashboard.render.com/), click **New + -> Blueprint**.
3. Select your repository. Render will automatically detect `render.yaml` and configure the Web Service with build command `npm install` and start command `npm start`.
4. In the Render environment settings, fill in:
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `DATABASE_URL`
   * `GEMINI_API_KEY`
   * `CLIENT_URL` (set to your Vercel deployment URL)
5. Copy your Render Backend URL (e.g. `https://vision-intelligence-backend.onrender.com`).

### 2. Deploy Client on Vercel
1. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New... -> Project**.
2. Select your repository.
3. Set the **Root Directory** to `client`.
4. Add the following Environment Variables in Vercel:
   * `VITE_API_URL` = `https://your-render-backend-url.onrender.com`
   * `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   * `VITE_SUPABASE_ANON_KEY` = `your_supabase_anon_key`
5. Click **Deploy**. Vercel will build the frontend using `client/vercel.json` with zero configuration hassle.

---

## 🧪 Local Testing

### Run All 9 End-to-End Tests
```bash
node server/scripts/runE2E.js
```

### Start Server Locally
```bash
npm start
```
Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Start Frontend Locally
```bash
npm run client
```
Open [http://localhost:5173](http://localhost:5173).
