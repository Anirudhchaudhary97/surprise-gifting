import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterInput, LoginInput } from '../types';

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const data: RegisterInput = req.body;
            const result = await authService.register(data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const data: LoginInput = req.body;
            const result = await authService.login(data);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }
}
