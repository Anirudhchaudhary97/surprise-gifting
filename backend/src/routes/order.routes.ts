import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";
import { validate } from "../middleware/validate.middleware";
import { createDirectOrderSchema } from "../utils/validation.schemas";

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post("/", (req, res) => orderController.createOrder(req, res));
router.post("/direct", validate(createDirectOrderSchema), (req, res) =>
  orderController.createDirectOrder(req, res)
);
router.get("/user", (req, res) => orderController.getUserOrders(req, res));
router.get("/:id", (req, res) => orderController.getOrderById(req, res));

// Admin routes
router.get("/", requireAdmin, (req, res) =>
  orderController.getAllOrders(req, res)
);

router.put("/:id", requireAdmin, (req, res) =>
  orderController.updateOrderStatus(req, res)
);

export default router;
