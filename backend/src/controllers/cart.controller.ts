import { Response } from 'express';
import { CartService } from '../services/cart.service';
import { AuthRequest, AddToCartInput, UpdateCartItemInput } from '../types';

const cartService = new CartService();

export class CartController {
    async getCart(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const cart = await cartService.getCart(userId);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async addToCart(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const data: AddToCartInput = {
                ...req.body,
                quantity: parseInt(req.body.quantity),
                selectedAddons: req.body.selectedAddons
                    ? JSON.parse(req.body.selectedAddons)
                    : undefined,
            };

            const customImage = req.file;
            const cart = await cartService.addToCart(userId, data, customImage);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateCartItem(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const data: UpdateCartItemInput = {
                cartItemId: req.body.cartItemId,
                ...(req.body.quantity && { quantity: parseInt(req.body.quantity) }),
                ...(req.body.personalMessage !== undefined && {
                    personalMessage: req.body.personalMessage,
                }),
                ...(req.body.selectedAddons && {
                    selectedAddons: JSON.parse(req.body.selectedAddons),
                }),
                ...(req.body.deliveryDate && { deliveryDate: req.body.deliveryDate }),
            };

            const cart = await cartService.updateCartItem(userId, data);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeFromCart(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const { cartItemId } = req.params;
            const cart = await cartService.removeFromCart(userId, cartItemId);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async clearCart(req: AuthRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const cart = await cartService.clearCart(userId);
            res.status(200).json(cart);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
