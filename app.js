'use strict';

/**
 * BD Platform - Passenger Entry Point
 * cPanel Node.js apps use app.js as the startup file.
 * Handles Passenger IPC and delegates to server.js logic.
 */

const path = require('path');
const fs = require('fs');
const http = require('http');

require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const next = require('next');

const PORT = process.env.PORT || 3000;

const nextApp = next({ dev: false, dir: path.join(__dirname, 'frontend') });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(morgan('combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', node: process.version, timestamp: new Date() });
  });

  // Backend API Routes
  const backendDist = path.join(__dirname, 'backend', 'dist');
  app.use('/api/auth',       require(path.join(backendDist, 'routes', 'auth.routes')).default);
  app.use('/api/businesses', require(path.join(backendDist, 'routes', 'businesses.routes')).default);
  app.use('/api/projects',   require(path.join(backendDist, 'routes', 'projects.routes')).default);
  app.use('/api/feedback',   require(path.join(backendDist, 'routes', 'feedback.routes')).default);
  app.use('/api/milestones', require(path.join(backendDist, 'routes', 'milestones.routes')).default);
  app.use('/api/stats',      require(path.join(backendDist, 'routes', 'stats.routes')).default);
  app.use('/api/attachments', require(path.join(backendDist, 'routes', 'attachments.routes')).default);

  // Static uploads
  app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

  // Error handler
  app.use(require(path.join(backendDist, 'middleware', 'error.middleware')).errorHandler);

  // Next.js Frontend
  app.all('*', (req, res) => handle(req, res));

  const server = http.createServer(app);

  // Passenger integration via feedback FD
  if (process.env.PASSENGER_USE_FEEDBACK_FD === 'true') {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      try {
        const msg = '!~: {"result":"ok","socket_address":"tcp://127.0.0.1:' + addr.port + '","socket_type":"tcp"}\n';
        fs.writeSync(3, msg);
      } catch(e) {
        console.error('Passenger feedback error:', e.message);
      }
      console.log('BD Platform running via Passenger on port ' + addr.port);
    });
  } else {
    server.listen(PORT, () => {
      console.log('BD Platform running on port ' + PORT);
    });
  }
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
