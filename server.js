'use strict';

/**
 * BD Platform - Combined Production Server
 * Serves Express API at /api/* and Next.js frontend for all other routes.
 * Entry point for cPanel Node.js App (Phusion Passenger).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;

// Next.js app points to the frontend directory
const nextApp = next({ dev, dir: path.join(__dirname, 'frontend') });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();

  // Security & logging middleware
  server.use(helmet({ contentSecurityPolicy: false }));
  server.use(morgan(dev ? 'dev' : 'combined'));
  server.use(express.json({ limit: '10mb' }));
  server.use(express.urlencoded({ extended: true }));

  // CORS — same-origin in production (frontend and API on same domain)
  server.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  }));

  // ── API Health Check ──────────────────────────────────────────────────────
  server.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  // ── Backend API Routes ────────────────────────────────────────────────────
  // These are compiled TypeScript files from backend/src → backend/dist
  const backendDist = path.join(__dirname, 'backend', 'dist');

  server.use('/api/auth',       require(path.join(backendDist, 'routes', 'auth.routes')).default);
  server.use('/api/businesses', require(path.join(backendDist, 'routes', 'businesses.routes')).default);
  server.use('/api/projects',   require(path.join(backendDist, 'routes', 'projects.routes')).default);
  server.use('/api/feedback',   require(path.join(backendDist, 'routes', 'feedback.routes')).default);
  server.use('/api/milestones', require(path.join(backendDist, 'routes', 'milestones.routes')).default);
  server.use('/api/stats',      require(path.join(backendDist, 'routes', 'stats.routes')).default);

  // Backend error handler
  server.use(require(path.join(backendDist, 'middleware', 'error.middleware')).errorHandler);

  // ── Next.js Frontend (catch-all) ──────────────────────────────────────────
  server.all('*', (req, res) => handle(req, res));

  server.listen(PORT, () => {
    console.log(`BD Platform running on port ${PORT} [${dev ? 'development' : 'production'}]`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
