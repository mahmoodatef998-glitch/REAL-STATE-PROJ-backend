import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database';
import { getJWTSecret } from '../utils/jwtHelper';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }

    try {
        const secret = getJWTSecret();
        const decoded = jwt.verify(token, secret) as any;
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token - user not found'
            });
        }

        // Check if user account is still active
        if (user.status === 'rejected') {
            return res.status(403).json({
                success: false,
                error: 'Account has been rejected'
            });
        }

        req.user = user;
        next();
    } catch (error: any) {
        console.error('Token verification error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceOwnerId = req.params.userId || req.body.owner_id || req.query.owner_id;

    if (req.user.role === 'admin' || (resourceOwnerId && req.user.id.toString() === resourceOwnerId.toString())) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
};
