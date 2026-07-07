import { Preferences } from "@capacitor/preferences";
import type { Product, Order, User, ChatMessage } from "./types";

// Point these at your deployed servers. For local dev with docker-compose,
// the defaults below already match the ports exposed in docker-compose.yml.
export const MAIN_SERVER_URL = (import.meta as any).env?.VITE_MAIN_SERVER_URL || "http://localhost:4000";
export const AI_SERVER_URL = (import.meta as any).env?.VITE_AI_SERVER_URL || "http://localhost:4100";

async function getToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: "authToken" });
  return value ?? null;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ---- Products ----
  listProducts: (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "All") params.set("category", filters.category);
    if (filters?.search) params.set("search", filters.search);
    const query = params.toString();
    return request<Product[]>(`${MAIN_SERVER_URL}/api/products${query ? `?${query}` : ""}`);
  },
  getProduct: (id: string) => request<Product>(`${MAIN_SERVER_URL}/api/products/${id}`),
  createProduct: (data: Partial<Product>) =>
    request<Product>(`${MAIN_SERVER_URL}/api/products`, { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`${MAIN_SERVER_URL}/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`${MAIN_SERVER_URL}/api/products/${id}`, { method: "DELETE" }),

  // ---- Orders ----
  listOrders: () => request<Order[]>(`${MAIN_SERVER_URL}/api/orders`),
  createOrder: (data: Partial<Order>) =>
    request<Order>(`${MAIN_SERVER_URL}/api/orders`, { method: "POST", body: JSON.stringify(data) }),
  updateOrderStatus: (id: string, status: Order["status"]) =>
    request<Order>(`${MAIN_SERVER_URL}/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

  // ---- Auth ----
  loginWithGoogle: (idToken: string) =>
    request<User>(`${MAIN_SERVER_URL}/api/auth/google`, { method: "POST", body: JSON.stringify({ idToken }) }),

  // ---- AI server ----
  chatWithStylist: (messages: ChatMessage[]) =>
    request<{ reply: string }>(`${AI_SERVER_URL}/api/ai/chat`, {
      method: "POST",
      body: JSON.stringify({ messages })
    }),
  recommendOutfits: (preferences: string) =>
    request<{ recommendations: string[] }>(`${AI_SERVER_URL}/api/ai/recommend`, {
      method: "POST",
      body: JSON.stringify({ preferences })
    })
};

export async function saveSession(user: User) {
  await Preferences.set({ key: "authToken", value: user.token });
  await Preferences.set({ key: "authUser", value: JSON.stringify(user) });
}

export async function loadSession(): Promise<User | null> {
  const { value } = await Preferences.get({ key: "authUser" });
  return value ? JSON.parse(value) : null;
}

export async function clearSession() {
  await Preferences.remove({ key: "authToken" });
  await Preferences.remove({ key: "authUser" });
}
