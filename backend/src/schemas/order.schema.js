import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(255),
  address: z.string().trim().min(4, "Street address is required").max(200),
  city: z.string().trim().min(2, "City is required").max(100),
  postalCode: z.string().trim().min(2, "Postal code is required").max(20),
  country: z.string().trim().min(2, "Country is required").max(60),
});

export const orderItemSchema = z.object({
  bookId: z.string().trim().min(1, "Book ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be non-negative").optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  // Support both 'shipping' and 'shipping_address'
  shipping: shippingAddressSchema.optional(),
  shipping_address: shippingAddressSchema.optional(),
  paymentMethod: z.enum(["stripe", "cod", "card", "mock"]).default("stripe"),
  promoCode: z.string().trim().optional().nullable(),
  total: z.coerce.number().min(0).optional(),
  currency: z.string().trim().default("USD"),
}).refine((data) => data.shipping || data.shipping_address, {
  message: "Shipping address is required (provide shipping or shipping_address)",
  path: ["shipping"],
});

export const createPaymentIntentSchema = z.object({
  amount: z.coerce.number().min(0.5, "Amount must be at least 0.50").optional(),
  currency: z.string().trim().default("usd"),
  items: z.array(orderItemSchema).optional(),
  metadata: z.record(z.any()).optional(),
});

