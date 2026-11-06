import { apiFetch, hasBackend } from "./client";

export interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderPayload {
  items: { bookId: string; quantity: number; price: number }[];
  shipping: ShippingAddress;
  paymentMethod: "stripe" | "cod";
  promoCode?: string | undefined;
  total: number;
  currency: string;
}

export interface Order extends OrderPayload {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed";
}

export async function createOrder(payload: OrderPayload): Promise<Order> {
  if (hasBackend()) {
    const res = await apiFetch<any>("/orders", { method: "POST", body: JSON.stringify(payload) });
    return res?.data ?? res;
  }
  await new Promise((r) => setTimeout(r, 700));
  return {
    ...payload,
    id: `PC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "confirmed",
  };
}
