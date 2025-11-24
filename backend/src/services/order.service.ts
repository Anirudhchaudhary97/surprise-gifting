import prisma from '../config/database';
import stripe from '../config/stripe';
import { CreateOrderInput } from '../types';
import { OrderStatus } from '@prisma/client';

export class OrderService {
    async createOrder(userId: string, data: CreateOrderInput) {
        // Get user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        gift: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        // Verify address belongs to user
        const address = await prisma.address.findFirst({
            where: {
                id: data.addressId,
                userId,
            },
        });

        if (!address) {
            throw new Error('Invalid address');
        }

        // Calculate totals
        const subtotal = cart.items.reduce(
            (sum, item) => sum + item.gift.price * item.quantity,
            0
        );
        const tax = subtotal * 0.13; // 13% VAT
        const deliveryCharge = 100; // Fixed delivery charge
        const total = subtotal + tax + deliveryCharge;

        // Check stock availability
        for (const item of cart.items) {
            if (item.gift.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.gift.name}`);
            }
        }

        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents
            currency: 'npr',
            payment_method: data.paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
            metadata: {
                userId,
                addressId: data.addressId,
            },
        });

        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Payment failed');
        }

        // Create order
        const order = await prisma.order.create({
            data: {
                userId,
                addressId: data.addressId,
                subtotal,
                tax,
                deliveryCharge,
                total,
                paymentIntentId: paymentIntent.id,
                paymentStatus: 'completed',
                status: OrderStatus.PENDING,
                items: {
                    create: cart.items.map((item) => ({
                        giftId: item.giftId,
                        quantity: item.quantity,
                        price: item.gift.price,
                        personalMessage: item.personalMessage,
                        selectedAddons: item.selectedAddons,
                        deliveryDate: item.deliveryDate,
                        customImageUrl: item.customImageUrl,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        gift: true,
                    },
                },
                address: true,
            },
        });

        // Update stock
        for (const item of cart.items) {
            await prisma.gift.update({
                where: { id: item.giftId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        // Clear cart
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return order;
    }

    async getUserOrders(userId: string) {
        return await prisma.order.findMany({
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
                            },
                        },
                    },
                },
                address: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getOrderById(orderId: string, userId?: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        gift: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                address: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // If userId provided, verify ownership
        if (userId && order.userId !== userId) {
            throw new Error('Unauthorized');
        }

        return order;
    }

    async getAllOrders(filters?: {
        status?: OrderStatus;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters?.status) {
            where.status = filters.status;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    address: true,
                    _count: {
                        select: { items: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.order.count({ where }),
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateOrderStatus(orderId: string, status: OrderStatus) {
        return await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                items: {
                    include: {
                        gift: true,
                    },
                },
                address: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
}
