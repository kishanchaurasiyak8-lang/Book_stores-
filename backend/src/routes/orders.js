import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { createOrderSchema } from "../schemas/order.schema.js";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
} from "../services/orderService.js";
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order with stock validation
 * @access  Public (Guest) or Authenticated Customer
 */
router.post("/", optionalAuthenticate, validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const orderPayload = {
      ...req.body,
      userId: req.user ? req.user.id : null,
    };

    const order = await createOrder(orderPayload);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
      ...order, // ensures res.id, res.status work directly
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get order history (Authenticated User) or All Orders (Admin)
 * @access  Private (JWT required)
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const result = await getAllOrders(page, limit);
      return res.status(200).json({
        success: true,
        ...result,
      });
    }

    const orders = await getUserOrders(req.user.id);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Public (Guest lookup) / Authenticated
 */
router.get("/:id", optionalAuthenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const userRole = req.user?.role || "customer";

    const order = await getOrderById(req.params.id, userId, userRole);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order "${req.params.id}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      ...order,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

