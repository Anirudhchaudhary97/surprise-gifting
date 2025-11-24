import prisma from '../config/database';
import { CreateCategoryInput } from '../types';

export class CategoryService {
    async getAll() {
        return await prisma.category.findMany({
            include: {
                _count: {
                    select: { gifts: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async getById(id: string) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                gifts: {
                    include: {
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!category) {
            throw new Error('Category not found');
        }

        return category;
    }

    async create(data: CreateCategoryInput) {
        return await prisma.category.create({
            data,
        });
    }

    async update(id: string, data: Partial<CreateCategoryInput>) {
        return await prisma.category.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return await prisma.category.delete({
            where: { id },
        });
    }
}
