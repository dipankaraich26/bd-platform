"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_middleware_1.authenticate);
// ─── LIST ALL PROJECTS ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { businessId, status, type, search } = req.query;
    const where = {};
    if (businessId)
        where.businessId = businessId;
    if (status)
        where.status = status;
    if (type)
        where.type = type;
    if (search)
        where.name = { contains: search };
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
router.get('/:id', async (req, res) => {
    const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
            business: { select: { id: true, name: true, sector: true, category: true } },
            feedbacks: { orderBy: { date: 'desc' } },
            milestones: { orderBy: { dueDate: 'asc' } },
        },
    });
    if (!project)
        return res.status(404).json({ message: 'Project not found' });
    return res.json(project);
});
// ─── CREATE PROJECT ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { name, description, businessId, type, productNature, status, score, progress, startDate, endDate, budget, customer, customerContact, notes, } = req.body;
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
router.patch('/:id', async (req, res) => {
    const { startDate, endDate, ...rest } = req.body;
    const data = { ...rest };
    if (startDate !== undefined)
        data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
        data.endDate = endDate ? new Date(endDate) : null;
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
router.delete('/:id', async (req, res) => {
    await prisma.project.delete({ where: { id: req.params.id } });
    return res.status(204).send();
});
exports.default = router;
