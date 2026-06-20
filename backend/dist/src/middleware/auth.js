"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const auth_1 = require("../lib/auth");
function authenticate(req, res, next) {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return next(); // Proceed without putting user on req (optional auth)
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (decoded && decoded.userId && decoded.role) {
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        }
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        next();
    }
}
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    next();
}
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Forbidden. Requires role: ${roles.join(' or ')}` });
        }
        next();
    };
}
