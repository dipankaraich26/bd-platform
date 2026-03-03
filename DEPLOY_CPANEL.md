# cPanel Deployment Guide
**Domain:** business-development.erpsolution26.com
**cPanel:** erpsolution26

---

## What Was Built

The project is now a **single combined Node.js app**:
- `server.js` (root) — starts Express API + Next.js frontend in one process
- `backend/dist/` — compiled TypeScript backend routes
- `frontend/.next/` — compiled Next.js frontend

---

## Step 1 — Create MySQL Database in cPanel

1. Log into cPanel → **MySQL Databases**
2. Create a new database: e.g. `erpsolu_bd`
3. Create a new user: e.g. `erpsolu_bd` with a strong password
4. Add the user to the database with **ALL PRIVILEGES**
5. Note down: `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

## Step 2 — Create Node.js Application in cPanel

1. In cPanel → **Setup Node.js App**
2. Click **Create Application**
3. Fill in:
   - **Node.js version:** 18.x or 20.x (choose the highest available)
   - **Application mode:** Production
   - **Application root:** `public_html/business-development.erpsolution26.com`
   - **Application URL:** `business-development.erpsolution26.com`
   - **Application startup file:** `server.js`
4. Click **Create**
5. Note the path cPanel shows (it sets up the Node.js environment)

---

## Step 3 — Upload Files via File Manager or FTP

Upload the entire `erp-system` folder contents to:
```
/home/erpsolution26/public_html/business-development.erpsolution26.com/
```

**What to upload** (upload these folders/files):
```
server.js              ← Combined entry point
package.json           ← Root dependencies
prisma/                ← Schema folder
backend/
  ├── dist/            ← Compiled backend (already built)
  ├── src/             ← Source (needed for ts-node seed only)
  └── package.json
frontend/
  ├── .next/           ← Built frontend (already built)
  ├── public/          ← Static assets
  ├── app/             ← Next.js pages source
  └── package.json
.env.production.example  ← Rename to .env and edit
```

**Do NOT need to upload:**
- `node_modules/` (will be installed on server)
- `backend/node_modules/` (same)
- `frontend/node_modules/` (same)

### Fastest upload method: ZIP

1. Create a ZIP of the `erp-system` folder on your computer (excluding all `node_modules/` folders)
2. Upload the ZIP via File Manager
3. Extract it in the correct directory

**Exclude node_modules when zipping** — on Windows, zip only these:
- `server.js`, `package.json`, `.env.production.example`
- `prisma/`
- `backend/dist/`, `backend/src/`, `backend/package.json`, `backend/tsconfig.json`
- `frontend/.next/`, `frontend/public/`, `frontend/app/`, `frontend/components/`, `frontend/lib/`, `frontend/package.json`, `frontend/next.config.js`, `frontend/tailwind.config.ts`, `frontend/postcss.config.js`, `frontend/tsconfig.json`

---

## Step 4 — Create .env File

In the application root on cPanel, create `.env`:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://erpsolu_bd:YOUR_DB_PASSWORD@localhost:3306/erpsolu_bd
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_STRING_AT_LEAST_32_CHARS
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=https://business-development.erpsolution26.com/api
FRONTEND_URL=https://business-development.erpsolution26.com
```

Replace:
- `erpsolu_bd` with your actual DB username (use full cPanel prefix format, e.g. `erpsolu_bduser`)
- `YOUR_DB_PASSWORD` with the password you set
- `REPLACE_WITH_LONG_RANDOM_STRING...` with any 32+ character random string
- DB name with actual DB name (cPanel prefixes with account name)

---

## Step 5 — Install Dependencies via cPanel Terminal

In cPanel → **Terminal** (or SSH):

```bash
# Navigate to app directory
cd /home/erpsolution26/public_html/business-development.erpsolution26.com

# Install root dependencies (next, express, etc.)
npm install --production=false

# Install frontend dependencies (needed for next build on server)
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Generate Prisma client (downloads Linux binary)
npx prisma generate

# Push schema to MySQL (creates tables)
npx prisma db push

# Seed initial data (admin user + sample businesses)
cd backend && npm run db:seed && cd ..
```

---

## Step 6 — Rebuild Frontend on Server (for NEXT_PUBLIC_API_URL)

Since `NEXT_PUBLIC_API_URL` is baked into the frontend at build time, rebuild on the server:

```bash
cd /home/erpsolution26/public_html/business-development.erpsolution26.com/frontend
npm run build
```

This ensures the frontend calls `https://business-development.erpsolution26.com/api` correctly.

---

## Step 7 — Start the Application

1. Go back to cPanel → **Setup Node.js App**
2. Find your app and click **Restart**
3. Visit: `https://business-development.erpsolution26.com`
4. Login with: `admin@bd.local` / `admin123`

**Change the admin password after first login!**

---

## Troubleshooting

### App shows 503 / won't start
- Check cPanel → Node.js App logs
- SSH and run: `node server.js` to see errors directly
- Most common: `.env` missing or `DATABASE_URL` wrong

### Database connection error
- Verify MySQL is running (cPanel MySQL should always be running)
- Check the DATABASE_URL format: `mysql://USER:PASS@localhost:3306/DBNAME`
- Ensure DB user has ALL PRIVILEGES on the database

### Prisma binary error
- Run: `npx prisma generate` again on the server
- The schema includes `debian-openssl-3.0.x` and `linux-musl-openssl-3.0.x` targets

### Frontend shows blank/old content
- Rebuild: `cd frontend && npm run build`
- Restart Node.js app in cPanel

### API calls failing (network error)
- Check `.env` has correct `NEXT_PUBLIC_API_URL=https://business-development.erpsolution26.com/api`
- Rebuild frontend after setting env
- Check cPanel SSL is enabled for the domain

---

## Default Login
- **URL:** https://business-development.erpsolution26.com/login
- **Email:** admin@bd.local
- **Password:** admin123

---

## Quick Summary of Files Changed for This Deployment

| File | Change |
|------|--------|
| `server.js` | NEW — combined Express + Next.js entry point |
| `package.json` | Updated with all production deps |
| `prisma/schema.prisma` | Added Linux binaryTargets |
| `frontend/next.config.js` | Removed `output: 'standalone'` |
| `frontend/app/layout.tsx` | Removed Google Fonts (network unavailable at build) |
| `frontend/app/globals.css` | Added system font stack |
| `backend/src/middleware/rbac.middleware.ts` | Removed obsolete `requireSector` function |
| `backend/src/routes/auth.routes.ts` | Fixed JWT TypeScript type |
| `.env.production.example` | NEW — template for production env vars |
