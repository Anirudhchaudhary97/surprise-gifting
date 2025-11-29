import { Response } from "express";
import { OrderService } from "../services/order.service";
import {
  AuthRequest,
  CreateDirectOrderInput,
  CreateOrderInput,
} from "../types";
import { OrderStatus } from "@prisma/client";

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateOrderInput = req.body;
      const order = await orderService.createOrder(userId, data);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createDirectOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const payload: CreateDirectOrderInput = req.body;
      const order = await orderService.createDirectOrder(userId, payload);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const orders = await orderService.getUserOrders(userId);
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.role === "ADMIN" ? undefined : req.user!.id;
      const order = await orderService.getOrderById(id, userId);
      res.status(200).json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      const { status, page, limit } = req.query;

      const filters = {
        status: status as OrderStatus,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await orderService.getAllOrders(filters);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid order status" });
      }

      const order = await orderService.updateOrderStatus(id, status);
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
