import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest, authenticate, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Apply auth + role verification to all admin routes
router.use(authenticate, requireAuth, requireRole(['ADMIN']));

// GET /api/admin/stats - Retrieve system-wide statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const seekerCount = await prisma.user.count({ where: { role: 'SEEKER' } });
    const employerCount = await prisma.user.count({ where: { role: 'EMPLOYER' } });
    
    const totalJobs = await prisma.job.count();
    const activeJobs = await prisma.job.count({ where: { status: 'ACTIVE' } });
    const totalApplications = await prisma.application.count();

    const appStats = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const jobStats = await prisma.job.groupBy({
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
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/admin/users - Retrieve user list for administration
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Fetch users admin error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/admin/users - Delete a user account (cascade deletion)
router.delete('/users', async (req: AuthenticatedRequest, res) => {
  try {
    const userIdToDelete = req.query.userId as string;

    if (!userIdToDelete) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    if (userIdToDelete === req.user!.userId) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    await prisma.user.delete({
      where: { id: userIdToDelete },
    });

    return res.status(200).json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete user admin error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
