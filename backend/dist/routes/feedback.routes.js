"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_middleware_1.authenticate);
// ─── LIST ALL FEEDBACK ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { businessId, projectId, sentiment } = req.query;
    const where = {};
    if (businessId)
        where.businessId = businessId;
    if (projectId)
        where.projectId = projectId;
    if (sentiment)
        where.sentiment = sentiment;
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
router.get('/:id', async (req, res) => {
    const feedback = await prisma.customerFeedback.findUnique({
        where: { id: req.params.id },
        include: {
            business: { select: { id: true, name: true, sector: true } },
            project: { select: { id: true, name: true, type: true } },
        },
    });
    if (!feedback)
        return res.status(404).json({ message: 'Feedback not found' });
    return res.json(feedback);
});
// ─── CREATE FEEDBACK ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
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
router.patch('/:id', async (req, res) => {
    const { date, ...rest } = req.body;
    const data = { ...rest };
    if (date)
        data.date = new Date(date);
    const record = await prisma.customerFeedback.update({
        where: { id: req.params.id },
        data,
    });
    return res.json(record);
});
// ─── DELETE FEEDBACK ──────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    await prisma.customerFeedback.delete({ where: { id: req.params.id } });
    return res.status(204).send();
});
exports.default = router;
