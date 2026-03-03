import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// ─── LIST MILESTONES ──────────────────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response) => {
  const { businessId, projectId, status } = req.query as Record<string, string>;

  const where: any = {};
  if (businessId) where.businessId = businessId;
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;

  const milestones = await prisma.milestone.findMany({
    where,
    include: {
      business: { select: { id: true, name: true, sector: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return res.json(milestones);
});

// ─── CREATE MILESTONE ─────────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response) => {
  const { businessId, projectId, title, description, dueDate, status } = req.body;

  const milestone = await prisma.milestone.create({
    data: {
      businessId: businessId || null,
      projectId: projectId || null,
      title,
      description,
      dueDate: new Date(dueDate),
      status: status || 'PENDING',
    },
  });

  return res.status(201).json(milestone);
});

// ─── UPDATE MILESTONE ─────────────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { dueDate, completedAt, status, ...rest } = req.body;

  const data: any = { ...rest };
  if (dueDate) data.dueDate = new Date(dueDate);
  if (status) data.status = status;
  if (status === 'COMPLETED' && !completedAt) data.completedAt = new Date();
  else if (completedAt) data.completedAt = new Date(completedAt);

  const milestone = await prisma.milestone.update({
    where: { id: req.params.id },
    data,
  });

  return res.json(milestone);
});

// ─── DELETE MILESTONE ─────────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.milestone.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
