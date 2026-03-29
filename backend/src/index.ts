import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/businesses.routes';
import projectRoutes from './routes/projects.routes';
import feedbackRoutes from './routes/feedback.routes';
import milestoneRoutes from './routes/milestones.routes';
import statsRoutes from './routes/stats.routes';
import leadRoutes from './routes/leads.routes';
import contactRoutes from './routes/contacts.routes';
import interactionRoutes from './routes/interactions.routes';
import attachmentRoutes from './routes/attachments.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/attachments', attachmentRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`BD Platform backend running on port ${PORT}`);
});

export default app;
