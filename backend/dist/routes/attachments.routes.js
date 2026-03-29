"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.use(auth_middleware_1.authenticate);
const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
// Ensure uploads directory exists
if (!fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
// ─── UPLOAD ATTACHMENTS (multiple) ───────────────────────────────────────────
router.post('/:businessId', upload.array('files', 10), async (req, res) => {
    const { businessId } = req.params;
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    // descriptions come as JSON array or comma-separated
    let descriptions = [];
    if (req.body.descriptions) {
        try {
            descriptions = JSON.parse(req.body.descriptions);
        }
        catch {
            descriptions = req.body.descriptions.split(',');
        }
    }
    const attachments = await Promise.all(files.map((file, index) => prisma.attachment.create({
        data: {
            businessId,
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            description: descriptions[index] || null,
            uploadedBy: req.user.id,
        },
    })));
    await prisma.activityLog.create({
        data: {
            businessId,
            userId: req.user.id,
            action: 'ATTACHMENT_ADDED',
            description: `${files.length} attachment(s) uploaded`,
        },
    });
    return res.status(201).json(attachments);
});
// ─── LIST ATTACHMENTS FOR A BUSINESS ─────────────────────────────────────────
router.get('/:businessId', async (req, res) => {
    const attachments = await prisma.attachment.findMany({
        where: { businessId: req.params.businessId },
        orderBy: { createdAt: 'desc' },
    });
    return res.json(attachments);
});
// ─── UPDATE ATTACHMENT DESCRIPTION ───────────────────────────────────────────
router.patch('/item/:id', async (req, res) => {
    const { description } = req.body;
    const attachment = await prisma.attachment.update({
        where: { id: req.params.id },
        data: { description },
    });
    return res.json(attachment);
});
// ─── DELETE ATTACHMENT ───────────────────────────────────────────────────────
router.delete('/item/:id', async (req, res) => {
    const attachment = await prisma.attachment.findUnique({ where: { id: req.params.id } });
    if (!attachment)
        return res.status(404).json({ message: 'Attachment not found' });
    // Delete file from disk
    const filePath = path_1.default.join(UPLOADS_DIR, attachment.filename);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
    await prisma.attachment.delete({ where: { id: req.params.id } });
    return res.status(204).send();
});
exports.default = router;
