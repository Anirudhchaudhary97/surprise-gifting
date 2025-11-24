import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== Role.ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    return next();
};
