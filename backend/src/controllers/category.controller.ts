import { Response } from 'express';
import { CategoryService } from '../services/category.service';
import { AuthRequest, CreateCategoryInput } from '../types';

const categoryService = new CategoryService();

export class CategoryController {
    async getAll(_req: AuthRequest, res: Response) {
        try {
            const categories = await categoryService.getAll();
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const category = await categoryService.getById(id);
            res.status(200).json(category);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async create(req: AuthRequest, res: Response) {
        try {
            const data: CreateCategoryInput = req.body;
            const category = await categoryService.create(data);
            res.status(201).json(category);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const data: Partial<CreateCategoryInput> = req.body;
            const category = await categoryService.update(id, data);
            res.status(200).json(category);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            await categoryService.delete(id);
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
