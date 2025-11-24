import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthUser } from '../types';

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || ''
        ) as AuthUser;

        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
