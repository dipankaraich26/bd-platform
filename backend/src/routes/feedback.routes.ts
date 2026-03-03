import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// ─── LIST ALL FEEDBACK ────────────────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response) => {
  const { businessId, projectId, sentiment } = req.query as Record<string, string>;

  const where: any = {};
  if (businessId) where.businessId = businessId;
  if (projectId) where.projectId = projectId;
  if (sentiment) where.sentiment = sentiment;

  const feedbacks = await prisma.customerFeedback.findMany({
    where,
    include: {
      business: { select: { id: true, name: true, sector: true } },
      project: { select: { id: true, name: true, type: true } },
    },
    orderBy: { date: 'desc' },
  });

  return res.json(feedbacks);
});

// ─── GET SINGLE FEEDBACK ──────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const feedback = await prisma.customerFeedback.findUnique({
    where: { id: req.params.id },
    include: {
      business: { select: { id: true, name: true, sector: true } },
      project: { select: { id: true, name: true, type: true } },
    },
  });

  if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
  return res.json(feedback);
});

// ─── CREATE FEEDBACK ──────────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response) => {
  const { businessId, projectId, customerName, customerOrg, sentiment, rating, feedback, date } = req.body;

  const record = await prisma.customerFeedback.create({
    data: {
      businessId: businessId || null,
      projectId: projectId || null,
      customerName,
      customerOrg,
      sentiment,
      rating,
      feedback,
      date: date ? new Date(date) : new Date(),
    },
    include: {
      business: { select: { id: true, name: true, sector: true } },
      project: { select: { id: true, name: true, type: true } },
    },
  });

  if (businessId) {
    await prisma.activityLog.create({
      data: {
        businessId,
        action: 'FEEDBACK_ADDED',
        description: `Feedback from ${customerName} (${sentiment})`,
      },
    });
  }

  return res.status(201).json(record);
});

// ─── UPDATE FEEDBACK ──────────────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { date, ...rest } = req.body;
  const data: any = { ...rest };
  if (date) data.date = new Date(date);

  const record = await prisma.customerFeedback.update({
    where: { id: req.params.id },
    data,
  });

  return res.json(record);
});

// ─── DELETE FEEDBACK ──────────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.customerFeedback.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
