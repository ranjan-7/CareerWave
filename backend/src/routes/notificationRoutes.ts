import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest, authenticate, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/notifications - Retrieve user notifications
router.get('/', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user!.userId,
        isRead: false,
      },
    });

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/notifications - Mark notifications as read
router.put('/', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.body;

    if (id) {
      await prisma.notification.update({
        where: { id, userId: req.user!.userId },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId, isRead: false },
        data: { isRead: true },
      });
    }

    return res.status(200).json({ success: true, message: 'Notifications updated' });
  } catch (error) {
    console.error('Update notifications error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
