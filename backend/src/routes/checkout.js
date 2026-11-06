import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { createPaymentIntentSchema } from "../schemas/order.schema.js";
import { createPaymentIntent } from "../services/paymentService.js";

const router = Router();

/**
 * @route   POST /api/checkout/create-payment-intent
 * @desc    Create Stripe / mock payment intent session
 * @access  Public
 */
router.post(
  "/create-payment-intent",
  validateBody(createPaymentIntentSchema),
  async (req, res, next) => {
    try {
      const intent = await createPaymentIntent(req.body);
      res.status(200).json({
        success: true,
        ...intent,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

