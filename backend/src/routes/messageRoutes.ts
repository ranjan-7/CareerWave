import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest, authenticate, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/messages - Retrieve message threads or specific conversation
router.get('/', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const session = req.user!;
    const otherUserId = req.query.userId as string;

    // Scenario A: Fetch full thread with a specific user
    if (otherUserId) {
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: session.userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: session.userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      return res.status(200).json({ success: true, messages });
    }

    // Scenario B: Fetch list of all message threads (inbox)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.userId },
          { receiverId: session.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const threadsMap = new Map<string, any>();

    for (const msg of messages) {
      const partnerId = msg.senderId === session.userId ? msg.receiverId : msg.senderId;
      if (!threadsMap.has(partnerId)) {
        threadsMap.set(partnerId, msg);
      }
    }

    const threadList = [];
    for (const [partnerId, lastMessage] of threadsMap.entries()) {
      const partner = await prisma.user.findUnique({
        where: { id: partnerId },
        select: {
          id: true,
          email: true,
          role: true,
          seekerProfile: {
            select: { fullName: true, headline: true },
          },
          employerProfile: {
            select: { companyName: true, logoUrl: true },
          },
        },
      });

      if (partner) {
        const name = partner.role === 'SEEKER' 
          ? partner.seekerProfile?.fullName 
          : partner.employerProfile?.companyName;
          
        const avatar = partner.role === 'EMPLOYER' 
          ? partner.employerProfile?.logoUrl 
          : null;

        threadList.push({
          userId: partner.id,
          email: partner.email,
          role: partner.role,
          name: name || partner.email,
          avatar,
          lastMessage: {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
            isRead: lastMessage.isRead,
          },
        });
      }
    }

    return res.status(200).json({ success: true, threads: threadList });

  } catch (error) {
    console.error('Fetch messages error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/messages - Send a new message
router.post('/', authenticate, requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const session = req.user!;
    const { receiverId, content } = req.body;

    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Missing receiverId or content' });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: {
        seekerProfile: true,
        employerProfile: true,
      },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver user not found' });
    }

    const sender = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        seekerProfile: true,
        employerProfile: true,
      },
    });

    const senderName = session.role === 'SEEKER'
      ? sender?.seekerProfile?.fullName
      : sender?.employerProfile?.companyName;

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          senderId: session.userId,
          receiverId,
          content,
          isRead: false,
        },
      });

      await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE',
          title: `New Message from ${senderName || 'User'}`,
          message: content.length > 60 ? `${content.substring(0, 57)}...` : content,
          link: receiver.role === 'SEEKER' ? '/seeker/messages' : '/employer/messages',
        },
      });

      return msg;
    });

    return res.status(201).json({ success: true, message });

  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
