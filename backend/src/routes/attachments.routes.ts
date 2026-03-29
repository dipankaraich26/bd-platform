import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// ─── UPLOAD ATTACHMENTS (multiple) ───────────────────────────────────────────

router.post('/:businessId', upload.array('files', 10), async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  // descriptions come as JSON array or comma-separated
  let descriptions: string[] = [];
  if (req.body.descriptions) {
    try {
      descriptions = JSON.parse(req.body.descriptions);
    } catch {
      descriptions = req.body.descriptions.split(',');
    }
  }

  const attachments = await Promise.all(
    files.map((file, index) =>
      prisma.attachment.create({
        data: {
          businessId,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          description: descriptions[index] || null,
          uploadedBy: req.user!.id,
        },
      })
    )
  );

  await prisma.activityLog.create({
    data: {
      businessId,
      userId: req.user!.id,
      action: 'ATTACHMENT_ADDED',
      description: `${files.length} attachment(s) uploaded`,
    },
  });

  return res.status(201).json(attachments);
});

// ─── LIST ATTACHMENTS FOR A BUSINESS ─────────────────────────────────────────

router.get('/:businessId', async (req: AuthRequest, res: Response) => {
  const attachments = await prisma.attachment.findMany({
    where: { businessId: req.params.businessId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(attachments);
});

// ─── UPDATE ATTACHMENT DESCRIPTION ───────────────────────────────────────────

router.patch('/item/:id', async (req: AuthRequest, res: Response) => {
  const { description } = req.body;
  const attachment = await prisma.attachment.update({
    where: { id: req.params.id },
    data: { description },
  });
  return res.json(attachment);
});

// ─── DELETE ATTACHMENT ───────────────────────────────────────────────────────

router.delete('/item/:id', async (req: AuthRequest, res: Response) => {
  const attachment = await prisma.attachment.findUnique({ where: { id: req.params.id } });
  if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

  // Delete file from disk
  const filePath = path.join(UPLOADS_DIR, attachment.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.attachment.delete({ where: { id: req.params.id } });

  return res.status(204).send();
});

export default router;
