"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_middleware_1.authenticate);
// ─── LIST ALL BUSINESSES ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { sector, stage, priority, parentId, search } = req.query;
    const where = {};
    if (sector)
        where.sector = sector;
    if (stage)
        where.stage = stage;
    if (priority)
        where.priority = priority;
    // Top-level only by default (no parent), unless parentId is specified
    if (parentId === 'any') {
        // no filter on parentId
    }
    else if (parentId) {
        where.parentId = parentId;
    }
    else {
        where.parentId = null;
    }
    if (search)
        where.name = { contains: search };
    const businesses = await prisma.business.findMany({
        where,
        include: {
            owner: { select: { id: true, name: true, avatar: true } },
            _count: { select: { projects: true, children: true, feedbacks: true, milestones: true } },
        },
        orderBy: [{ score: 'desc' }, { updatedAt: 'desc' }],
    });
    return res.json(businesses);
});
// ─── GET SINGLE BUSINESS ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    const business = await prisma.business.findUnique({
        where: { id: req.params.id },
        include: {
            owner: { select: { id: true, name: true, avatar: true } },
            parent: { select: { id: true, name: true, sector: true, category: true } },
            children: {
                include: {
                    _count: { select: { projects: true, children: true } },
                },
                orderBy: { score: 'desc' },
            },
            projects: {
                include: {
                    _count: { select: { feedbacks: true, milestones: true } },
                },
                orderBy: { updatedAt: 'desc' },
            },
            feedbacks: {
                orderBy: { date: 'desc' },
                take: 10,
            },
            milestones: {
                orderBy: { dueDate: 'asc' },
            },
            activities: {
                include: { user: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                take: 20,
            },
        },
    });
    if (!business)
        return res.status(404).json({ message: 'Business not found' });
    return res.json(business);
});
// ─── CREATE BUSINESS ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { name, description, sector, category, productNature, stage, score, priority, targetCustomer, targetMarket, estimatedValue, currency, startDate, targetDate, ownerId, parentId, notes, tags, } = req.body;
    const business = await prisma.business.create({
        data: {
            name, description, sector, category, productNature, stage, score, priority,
            targetCustomer, targetMarket, estimatedValue, currency,
            startDate: startDate ? new Date(startDate) : null,
            targetDate: targetDate ? new Date(targetDate) : null,
            ownerId: ownerId || req.user.id,
            parentId: parentId || null,
            notes,
            tags: tags || [],
        },
        include: {
            owner: { select: { id: true, name: true, avatar: true } },
        },
    });
    // Log activity
    await prisma.activityLog.create({
        data: {
            businessId: business.id,
            userId: req.user.id,
            action: 'CREATED',
            description: `Business "${business.name}" created`,
        },
    });
    return res.status(201).json(business);
});
// ─── UPDATE BUSINESS ──────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
    const { startDate, targetDate, ...rest } = req.body;
    const data = { ...rest };
    if (startDate !== undefined)
        data.startDate = startDate ? new Date(startDate) : null;
    if (targetDate !== undefined)
        data.targetDate = targetDate ? new Date(targetDate) : null;
    const business = await prisma.business.update({
        where: { id: req.params.id },
        data,
        include: {
            owner: { select: { id: true, name: true, avatar: true } },
        },
    });
    await prisma.activityLog.create({
        data: {
            businessId: business.id,
            userId: req.user.id,
            action: 'UPDATED',
            description: `Business "${business.name}" updated`,
        },
    });
    return res.json(business);
});
// ─── DELETE BUSINESS ──────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    const business = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!business)
        return res.status(404).json({ message: 'Business not found' });
    await prisma.business.delete({ where: { id: req.params.id } });
    return res.status(204).send();
});
// ─── GET CHILDREN (SUB-BUSINESSES) ───────────────────────────────────────────
router.get('/:id/children', async (req, res) => {
    const children = await prisma.business.findMany({
        where: { parentId: req.params.id },
        include: {
            owner: { select: { id: true, name: true, avatar: true } },
            _count: { select: { projects: true, children: true } },
        },
        orderBy: { score: 'desc' },
    });
    return res.json(children);
});
// ─── GET PROJECTS UNDER BUSINESS ─────────────────────────────────────────────
router.get('/:id/projects', async (req, res) => {
    const projects = await prisma.project.findMany({
        where: { businessId: req.params.id },
        include: {
            _count: { select: { feedbacks: true, milestones: true } },
        },
        orderBy: { updatedAt: 'desc' },
    });
    return res.json(projects);
});
// ─── GET ACTIVITY LOG FOR BUSINESS ───────────────────────────────────────────
router.get('/:id/activities', async (req, res) => {
    const activities = await prisma.activityLog.findMany({
        where: { businessId: req.params.id },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    return res.json(activities);
});
exports.default = router;
