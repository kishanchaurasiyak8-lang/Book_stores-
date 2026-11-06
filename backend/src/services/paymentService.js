import crypto from "node:crypto";
import { config } from "../config/env.js";
import { get } from "../db/index.js";

export async function createPaymentIntent({ amount, currency = "usd", items = [], metadata = {} }) {
  let resolvedAmount = amount;

  // If amount was not explicitly provided, calculate from items
  if (!resolvedAmount && items.length > 0) {
    let subtotal = 0;
    for (const item of items) {
      const book = await get("SELECT price FROM books WHERE id = ?", [item.bookId]);
      if (book) {
        subtotal += Number(book.price) * item.quantity;
      }
    }
    resolvedAmount = Math.round(subtotal * 100) / 100;
  }

  if (!resolvedAmount || resolvedAmount <= 0) {
    const error = new Error("Valid amount is required to create a payment intent");
    error.statusCode = 400;
    throw error;
  }

  const normalizedCurrency = currency.toLowerCase();
  const amountInCents = Math.round(resolvedAmount * 100);

  // If real Stripe secret key is configured, use Stripe API via fetch
  if (config.stripeSecretKey && config.stripeSecretKey.startsWith("sk_")) {
    try {
      const params = new URLSearchParams();
      params.append("amount", amountInCents.toString());
      params.append("currency", normalizedCurrency);
      params.append("payment_method_types[]", "card");

      for (const [key, val] of Object.entries(metadata)) {
        params.append(`metadata[${key}]`, String(val));
      }

      const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!stripeRes.ok) {
        const errorData = await stripeRes.json();
        throw new Error(errorData.error?.message || "Stripe API error");
      }

      const intent = await stripeRes.json();
      return {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency,
        status: intent.status,
        mock: false,
      };
    } catch (err) {
      console.warn("Stripe API failed, falling back to mock session:", err.message);
    }
  }

  // Realistic mock payment session
  const mockIntentId = `pi_mock_${crypto.randomBytes(12).toString("hex")}`;
  const mockClientSecret = `${mockIntentId}_secret_${crypto.randomBytes(12).toString("hex")}`;

  return {
    clientSecret: mockClientSecret,
    paymentIntentId: mockIntentId,
    amount: resolvedAmount,
    currency: normalizedCurrency,
    status: "requires_payment_method",
    mock: true,
  };
}

