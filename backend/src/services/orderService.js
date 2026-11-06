import crypto from "node:crypto";
import { query, get, run, transaction } from "../db/index.js";

export async function createOrder({
  items,
  shipping,
  shipping_address,
  paymentMethod = "stripe",
  promoCode,
  total,
  currency = "USD",
  userId = null,
}) {
  const resolvedShipping = shipping || shipping_address;
  if (!resolvedShipping) {
    const error = new Error("Shipping address is required");
    error.statusCode = 400;
    throw error;
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error("Order must contain at least one item");
    error.statusCode = 400;
    throw error;
  }

  // 1. Stock validation & price calculation
  return await transaction(async () => {
    const validatedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const book = await get("SELECT id, title, price, stock FROM books WHERE id = ?", [item.bookId]);
      if (!book) {
        const error = new Error(`Book with ID "${item.bookId}" not found`);
        error.statusCode = 404;
        throw error;
      }

      if (book.stock < item.quantity) {
        const error = new Error(
          `Insufficient stock for "${book.title}". Available stock: ${book.stock}, requested quantity: ${item.quantity}`
        );
        error.statusCode = 400;
        throw error;
      }

      const itemPrice = Number(book.price);
      calculatedSubtotal += itemPrice * item.quantity;

      validatedItems.push({
        bookId: book.id,
        title: book.title,
        price: itemPrice,
        quantity: item.quantity,
      });
    }

    // Apply promo code discount if provided
    let discount = 0;
    if (promoCode) {
      const code = promoCode.trim().toUpperCase();
      if (code === "WELCOME10" || code === "READ10") {
        discount = calculatedSubtotal * 0.1;
      } else if (code === "SAVE20") {
        discount = calculatedSubtotal * 0.2;
      }
    }

    const calculatedTotal = Math.max(0, Math.round((calculatedSubtotal - discount) * 100) / 100);
    const finalTotal = total !== undefined && total !== null ? Number(total) : calculatedTotal;

    // Deduct stock for each item
    for (const item of validatedItems) {
      await run("UPDATE books SET stock = stock - ? WHERE id = ?", [item.quantity, item.bookId]);
    }

    // Generate unique order ID (e.g. PC-7F2A4B1C)
    const orderId = `PC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const now = new Date().toISOString();
    const paymentStatus = paymentMethod === "cod" ? "pending" : "paid";
    const orderStatus = "confirmed";

    // Insert into orders table
    await run(
      `INSERT INTO orders (
        id, user_id, items, total_amount, currency, shipping_address,
        payment_status, payment_method, order_status, promo_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        JSON.stringify(validatedItems),
        finalTotal,
        currency.toUpperCase(),
        JSON.stringify(resolvedShipping),
        paymentStatus,
        paymentMethod,
        orderStatus,
        promoCode || null,
        now,
      ]
    );

    // Insert relational order items
    for (const item of validatedItems) {
      await run(
        `INSERT INTO order_items (order_id, book_id, quantity, price, title)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.bookId, item.quantity, item.price, item.title]
      );
    }

    return {
      id: orderId,
      userId,
      items: validatedItems,
      shipping: resolvedShipping,
      shipping_address: resolvedShipping,
      paymentMethod,
      payment_method: paymentMethod,
      paymentStatus,
      payment_status: paymentStatus,
      orderStatus,
      order_status: orderStatus,
      status: orderStatus,
      promoCode: promoCode || null,
      subtotal: calculatedSubtotal,
      discount,
      total: finalTotal,
      total_amount: finalTotal,
      currency: currency.toUpperCase(),
      createdAt: now,
      created_at: now,
    };
  });
}

export async function getOrderById(orderId, userId = null, userRole = "customer") {
  const row = await get("SELECT * FROM orders WHERE id = ?", [orderId]);
  if (!row) return null;

  // If user is regular customer, ensure they own the order
  if (userRole !== "admin" && userId !== null && row.user_id !== null && row.user_id !== userId) {
    const error = new Error("Unauthorized to view this order");
    error.statusCode = 403;
    throw error;
  }

  const items = await query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
  let parsedShipping = {};
  try {
    parsedShipping = JSON.parse(row.shipping_address);
  } catch {
    parsedShipping = { address: row.shipping_address };
  }

  return {
    id: row.id,
    userId: row.user_id,
    total: Number(row.total_amount),
    total_amount: Number(row.total_amount),
    currency: row.currency,
    shipping: parsedShipping,
    shipping_address: parsedShipping,
    paymentStatus: row.payment_status,
    payment_status: row.payment_status,
    paymentMethod: row.payment_method,
    payment_method: row.payment_method,
    orderStatus: row.order_status,
    order_status: row.order_status,
    promoCode: row.promo_code,
    createdAt: row.created_at,
    created_at: row.created_at,
    items: items.map((i) => ({
      bookId: i.book_id,
      title: i.title,
      quantity: i.quantity,
      price: Number(i.price),
    })),
  };
}

export async function getUserOrders(userId) {
  const rows = await query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    total: Number(row.total_amount),
    total_amount: Number(row.total_amount),
    currency: row.currency,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    items: JSON.parse(row.items || "[]"),
    shipping: JSON.parse(row.shipping_address || "{}"),
  }));
}

export async function getAllOrders(page = 1, limit = 20) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const offset = (pageNum - 1) * limitNum;

  const totalRow = await get("SELECT COUNT(*) as count FROM orders");
  const total = totalRow ? Number(totalRow.count) : 0;

  const rows = await query(
    "SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?",
    [limitNum, offset]
  );

  const orders = rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    total: Number(row.total_amount),
    currency: row.currency,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    items: JSON.parse(row.items || "[]"),
    shipping: JSON.parse(row.shipping_address || "{}"),
  }));

  return {
    orders,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
}

