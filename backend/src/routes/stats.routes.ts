import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

router.get('/dashboard', async (_req: AuthRequest, res: Response) => {
  const [
    totalBusinesses,
    businessesByStage,
    businessesBySector,
    totalProjects,
    projectsByStatus,
    recentActivities,
    upcomingMilestones,
    avgScore,
    totalFeedback,
    feedbackBySentiment,
  ] = await Promise.all([
    // Total businesses (top-level only)
    prisma.business.count({ where: { parentId: null } }),

    // Businesses by stage
    prisma.business.groupBy({
      by: ['stage'],
      _count: { stage: true },
    }),

    // Businesses by sector
    prisma.business.groupBy({
      by: ['sector'],
      _count: { sector: true },
      _avg: { score: true },
    }),

    // Total projects
    prisma.project.count(),

    // Projects by status
    prisma.project.groupBy({
      by: ['status'],
      _count: { status: true },
    }),

    // Recent activities
    prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        business: { select: { id: true, name: true, sector: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    // Upcoming milestones (next 30 days)
    prisma.milestone.findMany({
      where: {
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      include: {
        business: { select: { id: true, name: true, sector: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),

    // Average score
    prisma.business.aggregate({ _avg: { score: true } }),

    // Total feedback
    prisma.customerFeedback.count(),

    // Feedback by sentiment
    prisma.customerFeedback.groupBy({
      by: ['sentiment'],
      _count: { sentiment: true },
    }),
  ]);

  // Compute pipeline value
  const pipelineValue = await prisma.business.aggregate({
    _sum: { estimatedValue: true },
    where: { stage: { notIn: ['WON', 'LOST'] } },
  });

  const wonValue = await prisma.business.aggregate({
    _sum: { estimatedValue: true },
    where: { stage: 'WON' },
  });

  // Top businesses by score
  const topBusinesses = await prisma.business.findMany({
    where: { parentId: null },
    orderBy: { score: 'desc' },
    take: 5,
    select: {
      id: true, name: true, sector: true, category: true,
      stage: true, score: true, estimatedValue: true, priority: true,
    },
  });

  return res.json({
    overview: {
      totalBusinesses,
      totalProjects,
      avgScore: Math.round(avgScore._avg.score || 0),
      totalFeedback,
      pipelineValue: pipelineValue._sum.estimatedValue || 0,
      wonValue: wonValue._sum.estimatedValue || 0,
    },
    businessesByStage: businessesByStage.map((b) => ({ stage: b.stage, count: b._count.stage })),
    businessesBySector: businessesBySector.map((b) => ({
      sector: b.sector,
      count: b._count.sector,
      avgScore: Math.round(b._avg.score || 0),
    })),
    projectsByStatus: projectsByStatus.map((p) => ({ status: p.status, count: p._count.status })),
    feedbackBySentiment: feedbackBySentiment.map((f) => ({
      sentiment: f.sentiment,
      count: f._count.sentiment,
    })),
    recentActivities,
    upcomingMilestones,
    topBusinesses,
  });
});

// ─── SECTOR BREAKDOWN ─────────────────────────────────────────────────────────

router.get('/sectors', async (_req: AuthRequest, res: Response) => {
  const sectors = await prisma.business.groupBy({
    by: ['sector', 'stage'],
    _count: { id: true },
    _avg: { score: true },
    _sum: { estimatedValue: true },
  });

  return res.json(sectors);
});

// ─── PIPELINE FUNNEL ──────────────────────────────────────────────────────────

router.get('/pipeline', async (_req: AuthRequest, res: Response) => {
  const stages = ['IDEA', 'EXPLORING', 'PROPOSAL', 'NEGOTIATION', 'ACTIVE', 'ON_HOLD', 'WON', 'LOST'];

  const data = await Promise.all(
    stages.map(async (stage) => {
      const [count, value] = await Promise.all([
        prisma.business.count({ where: { stage: stage as any } }),
        prisma.business.aggregate({
          where: { stage: stage as any },
          _sum: { estimatedValue: true },
          _avg: { score: true },
        }),
      ]);
      return {
        stage,
        count,
        totalValue: value._sum.estimatedValue || 0,
        avgScore: Math.round(value._avg.score || 0),
      };
    })
  );

  return res.json(data);
});

export default router;
