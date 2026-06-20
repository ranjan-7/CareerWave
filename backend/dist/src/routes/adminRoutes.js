"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply auth + role verification to all admin routes
router.use(auth_1.authenticate, auth_1.requireAuth, (0, auth_1.requireRole)(['ADMIN']));
// GET /api/admin/stats - Retrieve system-wide statistics
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await db_1.prisma.user.count();
        const seekerCount = await db_1.prisma.user.count({ where: { role: 'SEEKER' } });
        const employerCount = await db_1.prisma.user.count({ where: { role: 'EMPLOYER' } });
        const totalJobs = await db_1.prisma.job.count();
        const activeJobs = await db_1.prisma.job.count({ where: { status: 'ACTIVE' } });
        const totalApplications = await db_1.prisma.application.count();
        const appStats = await db_1.prisma.application.groupBy({
            by: ['status'],
            _count: {
                id: true,
            },
        });
        const jobStats = await db_1.prisma.job.groupBy({
            by: ['workMode'],
            where: { status: 'ACTIVE' },
            _count: {
                id: true,
            },
        });
        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                seekerCount,
                employerCount,
                totalJobs,
                activeJobs,
                totalApplications,
                applicationDistribution: appStats.map(stat => ({
                    status: stat.status,
                    count: stat._count.id,
                })),
                workModeDistribution: jobStats.map(stat => ({
                    workMode: stat.workMode,
                    count: stat._count.id,
                })),
            },
        });
    }
    catch (error) {
        console.error('Fetch admin stats error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/admin/users - Retrieve user list for administration
router.get('/users', async (req, res) => {
    try {
        const users = await db_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ success: true, users });
    }
    catch (error) {
        console.error('Fetch users admin error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
// DELETE /api/admin/users - Delete a user account (cascade deletion)
router.delete('/users', async (req, res) => {
    try {
        const userIdToDelete = req.query.userId;
        if (!userIdToDelete) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }
        if (userIdToDelete === req.user.userId) {
            return res.status(400).json({ error: 'You cannot delete your own admin account' });
        }
        await db_1.prisma.user.delete({
            where: { id: userIdToDelete },
        });
        return res.status(200).json({ success: true, message: 'User account deleted successfully' });
    }
    catch (error) {
        console.error('Delete user admin error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
