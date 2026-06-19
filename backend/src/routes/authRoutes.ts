import { Router, Response } from 'express';
import { prisma } from '../lib/db';
import { hashPassword, comparePassword, signToken } from '../lib/auth';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();
const COOKIE_NAME = 'auth_token';

// Helper to set cookie
function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, fullName, companyName } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (role !== 'SEEKER' && role !== 'EMPLOYER' && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
        },
      });

      if (role === 'SEEKER') {
        await tx.jobSeekerProfile.create({
          data: {
            userId: newUser.id,
            fullName: fullName || 'New Job Seeker',
            skills: '',
            experience: '[]',
            education: '[]',
            visibility: 'PUBLIC',
            openToWork: true,
          },
        });
      } else if (role === 'EMPLOYER') {
        await tx.employerProfile.create({
          data: {
            userId: newUser.id,
            companyName: companyName || 'New Company',
            size: '1-10',
          },
        });
      }

      return newUser;
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    setSessionCookie(res, token);

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Register API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordCorrect = await comparePassword(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    setSessionCookie(res, token);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/auth/session
router.get('/session', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(200).json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        seekerProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return res.status(200).json({ user: null });
    }

    const profile = user.role === 'SEEKER' ? user.seekerProfile : user.employerProfile;

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
      },
    });

  } catch (error) {
    console.error('Session API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
