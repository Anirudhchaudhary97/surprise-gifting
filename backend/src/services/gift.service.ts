import prisma from '../config/database';
import { CreateGiftInput } from '../types';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.utils';

export class GiftService {
    async getAll(filters?: {
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        featured?: boolean;
        page?: number;
        limit?: number;
        sortBy?: 'newest' | 'price_asc' | 'price_desc';
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 12;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
            if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters?.featured !== undefined) {
            where.featured = filters.featured;
        }

        const sortBy = filters?.sortBy || 'newest';
        const orderBy: any = {};

        switch (sortBy) {
            case 'price_asc':
                orderBy.price = 'asc';
                break;
            case 'price_desc':
                orderBy.price = 'desc';
                break;
            case 'newest':
            default:
                orderBy.createdAt = 'desc';
                break;
        }

        const [gifts, total] = await Promise.all([
            prisma.gift.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    _count: {
                        select: { reviews: true },
                    },
                },
                skip,
                take: limit,
                orderBy,
            }),
            prisma.gift.count({ where }),
        ]);

        // Calculate average rating for each gift
        const giftsWithRatings = await Promise.all(
            gifts.map(async (gift) => {
                const avgRating = await prisma.review.aggregate({
                    where: { giftId: gift.id },
                    _avg: { rating: true },
                });

                return {
                    ...gift,
                    averageRating: avgRating._avg.rating || 0,
                };
            })
        );

        return {
            gifts: giftsWithRatings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getById(id: string) {
        const gift = await prisma.gift.findUnique({
            where: { id },
            include: {
                category: true,
                images: {
                    orderBy: { isPrimary: 'desc' },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!gift) {
            throw new Error('Gift not found');
        }

        // Calculate average rating
        const avgRating = await prisma.review.aggregate({
            where: { giftId: id },
            _avg: { rating: true },
        });

        return {
            ...gift,
            averageRating: avgRating._avg.rating || 0,
        };
    }

    async create(data: CreateGiftInput, imageFiles?: Express.Multer.File[]) {
        const gift = await prisma.gift.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                categoryId: data.categoryId,
                isCustomizable: data.isCustomizable,
                allowPersonalMsg: data.allowPersonalMsg,
                allowAddons: data.allowAddons,
                allowImageUpload: data.allowImageUpload,
                addonsOptions: data.addonsOptions || [],
                featured: data.featured,
            },
        });

        // Upload images if provided
        if (imageFiles && imageFiles.length > 0) {
            const imagePromises = imageFiles.map(async (file, index) => {
                const { url, publicId } = await uploadToCloudinary(
                    file.path,
                    'surprise-gifting/gifts'
                );

                return prisma.giftImage.create({
                    data: {
                        giftId: gift.id,
                        url,
                        publicId,
                        isPrimary: index === 0,
                    },
                });
            });

            await Promise.all(imagePromises);
        }

        return await this.getById(gift.id);
    }

    async update(
        id: string,
        data: Partial<CreateGiftInput>,
        imageFiles?: Express.Multer.File[]
    ) {
        const gift = await prisma.gift.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description && { description: data.description }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.stock !== undefined && { stock: data.stock }),
                ...(data.categoryId && { categoryId: data.categoryId }),
                ...(data.isCustomizable !== undefined && {
                    isCustomizable: data.isCustomizable,
                }),
                ...(data.allowPersonalMsg !== undefined && {
                    allowPersonalMsg: data.allowPersonalMsg,
                }),
                ...(data.allowAddons !== undefined && { allowAddons: data.allowAddons }),
                ...(data.allowImageUpload !== undefined && {
                    allowImageUpload: data.allowImageUpload,
                }),
                ...(data.addonsOptions && { addonsOptions: data.addonsOptions }),
                ...(data.featured !== undefined && { featured: data.featured }),
            },
        });

        // Upload new images if provided
        if (imageFiles && imageFiles.length > 0) {
            const imagePromises = imageFiles.map(async (file) => {
                const { url, publicId } = await uploadToCloudinary(
                    file.path,
                    'surprise-gifting/gifts'
                );

                return prisma.giftImage.create({
                    data: {
                        giftId: gift.id,
                        url,
                        publicId,
                        isPrimary: false,
                    },
                });
            });

            await Promise.all(imagePromises);
        }

        return await this.getById(gift.id);
    }

    async delete(id: string) {
        // Get all images to delete from Cloudinary
        const images = await prisma.giftImage.findMany({
            where: { giftId: id },
        });

        // Delete from Cloudinary
        await Promise.all(
            images.map((image) => deleteFromCloudinary(image.publicId))
        );

        // Delete gift (images will be cascade deleted)
        return await prisma.gift.delete({
            where: { id },
        });
    }

    async deleteImage(imageId: string) {
        const image = await prisma.giftImage.findUnique({
            where: { id: imageId },
        });

        if (!image) {
            throw new Error('Image not found');
        }

        await deleteFromCloudinary(image.publicId);
        await prisma.giftImage.delete({
            where: { id: imageId },
        });

        return { message: 'Image deleted successfully' };
    }
}
