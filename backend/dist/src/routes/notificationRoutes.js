"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/notifications - Retrieve user notifications
router.get('/', auth_1.authenticate, auth_1.requireAuth, async (req, res) => {
    try {
        const notifications = await db_1.prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        const unreadCount = await db_1.prisma.notification.count({
            where: {
                userId: req.user.userId,
                isRead: false,
            },
        });
        return res.status(200).json({ success: true, notifications, unreadCount });
    }
    catch (error) {
        console.error('Fetch notifications error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PUT /api/notifications - Mark notifications as read
router.put('/', auth_1.authenticate, auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.body;
        if (id) {
            await db_1.prisma.notification.update({
                where: { id, userId: req.user.userId },
                data: { isRead: true },
            });
        }
        else {
            await db_1.prisma.notification.updateMany({
                where: { userId: req.user.userId, isRead: false },
                data: { isRead: true },
            });
        }
        return res.status(200).json({ success: true, message: 'Notifications updated' });
    }
    catch (error) {
        console.error('Update notifications error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
