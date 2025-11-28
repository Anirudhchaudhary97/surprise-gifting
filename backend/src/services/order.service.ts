import prisma from "../config/database";
import stripe from "../config/stripe";
import { CreateDirectOrderInput, CreateOrderInput } from "../types";
import { OrderStatus, PaymentMethod } from "@prisma/client";

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
      throw new Error("Cart is empty");
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: data.addressId,
        userId,
      },
    });

    if (!address) {
      throw new Error("Invalid address");
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
      currency: "npr",
      payment_method: data.paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        userId,
        addressId: data.addressId,
      },
    });

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment failed");
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
        paymentStatus: "completed",
        paymentMethod: PaymentMethod.STRIPE,
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

  async createDirectOrder(userId: string, payload: CreateDirectOrderInput) {
    const { items, shipping, totals, note, paymentMethod } = payload;

    const normalizedPaymentMethod =
      typeof paymentMethod === "string"
        ? paymentMethod.toUpperCase()
        : paymentMethod;

    const resolvedPaymentMethod =
      normalizedPaymentMethod === PaymentMethod.STRIPE
        ? PaymentMethod.STRIPE
        : PaymentMethod.COD;
    const paymentStatus =
      resolvedPaymentMethod === PaymentMethod.STRIPE
        ? "requires_payment"
        : "pending";

    if (!items || items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const computedSubtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const subtotal = totals?.subtotal ?? computedSubtotal;
    const tax = totals?.tax ?? 0;
    const deliveryCharge = totals?.deliveryCharge ?? 0;
    const total = totals?.total ?? subtotal + tax + deliveryCharge;

    const addressLine = shipping.addressLine2
      ? `${shipping.addressLine1}, ${shipping.addressLine2}`
      : shipping.addressLine1;

    const order = await prisma.$transaction(
      async (tx) => {
        // Validate stock INSIDE transaction to prevent race conditions
        const giftIds = items.map((item) => item.giftId);
        const gifts = await tx.gift.findMany({
          where: { id: { in: giftIds } },
        });

        const giftMap = new Map(gifts.map((gift) => [gift.id, gift]));

        for (const item of items) {
          const gift = giftMap.get(item.giftId);
          if (!gift) {
            throw new Error("One or more gifts are no longer available");
          }

          if (gift.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${gift.name}`);
          }
        }

        const address = await tx.address.create({
          data: {
            userId,
            fullName: shipping.fullName,
            phone: shipping.phone,
            addressLine,
            city: shipping.city,
            state: shipping.state,
            zipCode: shipping.postalCode,
            country: shipping.country ?? "Nepal",
            isDefault: false,
          },
        });

        const orderRecord = await tx.order.create({
          data: {
            userId,
            addressId: address.id,
            subtotal,
            tax,
            deliveryCharge,
            total,
            paymentStatus,
            paymentMethod: resolvedPaymentMethod,
            status: OrderStatus.PENDING,
            items: {
              create: items.map((item, index) => {
                const serializedAddons = [
                  ...(item.addons?.map((addon) =>
                    JSON.stringify({
                      id: addon.id,
                      name: addon.name,
                      price: addon.price,
                    })
                  ) ?? []),
                ];

                if (item.giftWrapPrice && item.giftWrapPrice > 0) {
                  serializedAddons.push(
                    JSON.stringify({
                      id: "gift-wrap",
                      name: "Gift wrap",
                      price: item.giftWrapPrice,
                    })
                  );
                }

                let personalMessage = item.personalMessage;
                if (index === 0 && note) {
                  personalMessage = personalMessage
                    ? `${personalMessage}\nCheckout note: ${note}`
                    : note;
                }

                return {
                  giftId: item.giftId,
                  quantity: item.quantity,
                  price: item.unitPrice,
                  personalMessage,
                  selectedAddons: serializedAddons,
                  customImageUrl: item.artworkUrl,
                };
              }),
            },
          },
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
        });

        const quantityByGift = new Map<string, number>();
        for (const item of items) {
          const current = quantityByGift.get(item.giftId) ?? 0;
          quantityByGift.set(item.giftId, current + item.quantity);
        }

        for (const [giftId, totalQuantity] of quantityByGift.entries()) {
          await tx.gift.update({
            where: { id: giftId },
            data: {
              stock: {
                decrement: totalQuantity,
              },
            },
          });
        }

        return orderRecord;
      },
      {
        maxWait: 10000, // Maximum time to wait for a transaction slot (10s)
        timeout: 15000, // Maximum time the transaction can run (15s)
      }
    );
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
      orderBy: { createdAt: "desc" },
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
      throw new Error("Order not found");
    }

    // If userId provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new Error("Unauthorized");
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
        orderBy: { createdAt: "desc" },
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
