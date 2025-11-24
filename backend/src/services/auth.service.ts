import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { RegisterInput, LoginInput } from '../types';

export class AuthService {
    async register(data: RegisterInput) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error('User already exists with this email');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Create empty cart for user
        await prisma.cart.create({
            data: {
                userId: user.id,
            },
        });

        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);

        return { user, token };
    }

    async login(data: LoginInput) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.password);

        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    }

    private generateToken(id: string, email: string, role: string): string {
        return jwt.sign(
            { id, email, role },
            process.env.JWT_SECRET || '',
            { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
        );
    }
}
