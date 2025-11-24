import { Response } from 'express';
import { GiftService } from '../services/gift.service';
import { AuthRequest, CreateGiftInput } from '../types';

const giftService = new GiftService();

export class GiftController {
    async getAll(req: AuthRequest, res: Response) {
        try {
            const {
                categoryId,
                minPrice,
                maxPrice,
                search,
                featured,
                page,
                limit,
            } = req.query;

            const filters = {
                categoryId: categoryId as string,
                minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
                search: search as string,
                featured: featured === 'true' ? true : undefined,
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
            };

            const result = await giftService.getAll(filters);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const gift = await giftService.getById(id);
            res.status(200).json(gift);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    async create(req: AuthRequest, res: Response) {
        try {
            const data: CreateGiftInput = {
                ...req.body,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock),
                isCustomizable: req.body.isCustomizable === 'true',
                allowPersonalMsg: req.body.allowPersonalMsg === 'true',
                allowAddons: req.body.allowAddons === 'true',
                allowImageUpload: req.body.allowImageUpload === 'true',
                featured: req.body.featured === 'true',
                addonsOptions: req.body.addonsOptions
                    ? JSON.parse(req.body.addonsOptions)
                    : [],
            };

            const files = req.files as Express.Multer.File[];
            const gift = await giftService.create(data, files);
            res.status(201).json(gift);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const data: Partial<CreateGiftInput> = {
                ...req.body,
                ...(req.body.price && { price: parseFloat(req.body.price) }),
                ...(req.body.stock && { stock: parseInt(req.body.stock) }),
                ...(req.body.isCustomizable !== undefined && {
                    isCustomizable: req.body.isCustomizable === 'true',
                }),
                ...(req.body.allowPersonalMsg !== undefined && {
                    allowPersonalMsg: req.body.allowPersonalMsg === 'true',
                }),
                ...(req.body.allowAddons !== undefined && {
                    allowAddons: req.body.allowAddons === 'true',
                }),
                ...(req.body.allowImageUpload !== undefined && {
                    allowImageUpload: req.body.allowImageUpload === 'true',
                }),
                ...(req.body.featured !== undefined && {
                    featured: req.body.featured === 'true',
                }),
                ...(req.body.addonsOptions && {
                    addonsOptions: JSON.parse(req.body.addonsOptions),
                }),
            };

            const files = req.files as Express.Multer.File[];
            const gift = await giftService.update(id, data, files);
            res.status(200).json(gift);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            await giftService.delete(id);
            res.status(200).json({ message: 'Gift deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteImage(req: AuthRequest, res: Response) {
        try {
            const { imageId } = req.params;
            const result = await giftService.deleteImage(imageId);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
