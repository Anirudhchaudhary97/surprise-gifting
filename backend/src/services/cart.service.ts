import prisma from '../config/database';
import { AddToCartInput, UpdateCartItemInput } from '../types';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.utils';

export class CartService {
    async getCart(userId: string) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        gift: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        // Create cart if doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            gift: {
                                include: {
                                    images: {
                                        where: { isPrimary: true },
                                        take: 1,
                                    },
                                    category: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        // Calculate totals
        const subtotal = cart.items.reduce(
            (sum, item) => sum + item.gift.price * item.quantity,
            0
        );

        return {
            ...cart,
            subtotal,
            itemCount: cart.items.length,
        };
    }

    async addToCart(
        userId: string,
        data: AddToCartInput,
        customImage?: Express.Multer.File
    ) {
        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        // Check if gift exists and has stock
        const gift = await prisma.gift.findUnique({
            where: { id: data.giftId },
        });

        if (!gift) {
            throw new Error('Gift not found');
        }

        if (gift.stock < data.quantity) {
            throw new Error('Insufficient stock');
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                giftId: data.giftId,
            },
        });

        let customImageUrl: string | undefined;
        let customImageId: string | undefined;

        // Upload custom image if provided
        if (customImage) {
            const result = await uploadToCloudinary(
                customImage.path,
                'surprise-gifting/custom-images'
            );
            customImageUrl = result.url;
            customImageId = result.publicId;
        }

        if (existingItem) {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + data.quantity,
                    ...(data.personalMessage && { personalMessage: data.personalMessage }),
                    ...(data.selectedAddons && { selectedAddons: data.selectedAddons }),
                    ...(data.deliveryDate && {
                        deliveryDate: new Date(data.deliveryDate),
                    }),
                    ...(customImageUrl && { customImageUrl }),
                    ...(customImageId && { customImageId }),
                },
            });
        } else {
            // Create new cart item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    giftId: data.giftId,
                    quantity: data.quantity,
                    personalMessage: data.personalMessage,
                    selectedAddons: data.selectedAddons || [],
                    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
                    customImageUrl,
                    customImageId,
                },
            });
        }

        return await this.getCart(userId);
    }

    async updateCartItem(userId: string, data: UpdateCartItemInput) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: data.cartItemId },
            include: { cart: true },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new Error('Cart item not found');
        }

        // Check stock if quantity is being updated
        if (data.quantity !== undefined) {
            const gift = await prisma.gift.findUnique({
                where: { id: cartItem.giftId },
            });

            if (gift && gift.stock < data.quantity) {
                throw new Error('Insufficient stock');
            }
        }

        await prisma.cartItem.update({
            where: { id: data.cartItemId },
            data: {
                ...(data.quantity !== undefined && { quantity: data.quantity }),
                ...(data.personalMessage !== undefined && {
                    personalMessage: data.personalMessage,
                }),
                ...(data.selectedAddons !== undefined && {
                    selectedAddons: data.selectedAddons,
                }),
                ...(data.deliveryDate !== undefined && {
                    deliveryDate: new Date(data.deliveryDate),
                }),
            },
        });

        return await this.getCart(userId);
    }

    async removeFromCart(userId: string, cartItemId: string) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new Error('Cart item not found');
        }

        // Delete custom image from Cloudinary if exists
        if (cartItem.customImageId) {
            await deleteFromCloudinary(cartItem.customImageId);
        }

        await prisma.cartItem.delete({
            where: { id: cartItemId },
        });

        return await this.getCart(userId);
    }

    async clearCart(userId: string) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            return;
        }

        // Delete custom images from Cloudinary
        const deletePromises = cart.items
            .filter((item) => item.customImageId)
            .map((item) => deleteFromCloudinary(item.customImageId!));

        await Promise.all(deletePromises);

        // Delete all cart items
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return await this.getCart(userId);
    }
}
