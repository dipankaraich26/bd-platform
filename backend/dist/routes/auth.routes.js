"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active)
        return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
    return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
});
// GET /api/auth/me
router.get('/me', auth_middleware_1.authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    return res.json(user);
});
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role = 'USER' } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: 'All fields required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
        return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma.user.create({
        data: { name, email, passwordHash, role },
        select: { id: true, name: true, email: true, role: true },
    });
    return res.status(201).json(user);
});
// PATCH /api/auth/profile
router.patch('/profile', auth_middleware_1.authenticate, async (req, res) => {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, avatar },
        select: { id: true, name: true, email: true, role: true, avatar: true },
    });
    return res.json(user);
});
exports.default = router;
