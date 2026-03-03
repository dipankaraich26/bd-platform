import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// ─── LIST ALL PROJECTS ────────────────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response) => {
  const { businessId, status, type, search } = req.query as Record<string, string>;

  const where: any = {};
  if (businessId) where.businessId = businessId;
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) where.name = { contains: search };

  const projects = await prisma.project.findMany({
    where,
    include: {
      business: { select: { id: true, name: true, sector: true, category: true } },
      _count: { select: { feedbacks: true, milestones: true } },
    },
    orderBy: [{ score: 'desc' }, { updatedAt: 'desc' }],
  });

  return res.json(projects);
});

// ─── GET SINGLE PROJECT ───────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      business: { select: { id: true, name: true, sector: true, category: true } },
      feedbacks: { orderBy: { date: 'desc' } },
      milestones: { orderBy: { dueDate: 'asc' } },
    },
  });

  if (!project) return res.status(404).json({ message: 'Project not found' });
  return res.json(project);
});

// ─── CREATE PROJECT ───────────────────────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response) => {
  const {
    name, description, businessId, type, productNature, status, score, progress,
    startDate, endDate, budget, customer, customerContact, notes,
  } = req.body;

  const project = await prisma.project.create({
    data: {
      name, description, businessId, type, productNature, status, score, progress,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget, customer, customerContact, notes,
    },
    include: {
      business: { select: { id: true, name: true, sector: true, category: true } },
    },
  });

  // Log on parent business
  await prisma.activityLog.create({
    data: {
      businessId: project.businessId,
      action: 'PROJECT_ADDED',
      description: `${project.type} "${project.name}" added`,
    },
  });

  return res.status(201).json(project);
});

// ─── UPDATE PROJECT ───────────────────────────────────────────────────────────

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, ...rest } = req.body;

  const data: any = { ...rest };
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data,
    include: {
      business: { select: { id: true, name: true, sector: true, category: true } },
    },
  });

  return res.json(project);
});

// ─── DELETE PROJECT ───────────────────────────────────────────────────────────

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
