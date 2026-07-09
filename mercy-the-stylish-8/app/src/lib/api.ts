import type { Product, Order, User, PaginatedProducts, AdminStats } from "../types";

export const MAIN_SERVER_URL = import.meta.env.VITE_MAIN_SERVER_URL || "http://localhost:4000";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
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
    throw new ApiError(body.error || `Request failed with ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listProducts: (filters?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "All") params.set("category", filters.category);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const query = params.toString();
    return request<PaginatedProducts>(`${MAIN_SERVER_URL}/api/products${query ? `?${query}` : ""}`);
  },

  getProduct: (id: string) => request<Product>(`${MAIN_SERVER_URL}/api/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    request<Product>(`${MAIN_SERVER_URL}/api/products`, { method: "POST", body: JSON.stringify(data) }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`${MAIN_SERVER_URL}/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`${MAIN_SERVER_URL}/api/products/${id}`, { method: "DELETE" }),

  listOrders: () => request<Order[]>(`${MAIN_SERVER_URL}/api/orders`),

  getOrder: (id: string) => request<Order>(`${MAIN_SERVER_URL}/api/orders/${id}`),

  updateOrderStatus: (id: string, status: Order["status"]) =>
    request<Order>(`${MAIN_SERVER_URL}/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

  loginWithGoogle: (idToken: string) =>
    request<User>(`${MAIN_SERVER_URL}/api/auth/google`, { method: "POST", body: JSON.stringify({ idToken }) }),

  getMe: () => request<Omit<User, "token">>(`${MAIN_SERVER_URL}/api/auth/me`),

  createCheckoutSession: (data: {
    items: { productId: string; quantity: number }[];
    customerName: string;
    customerPhone: string;
    shippingAddress: string;
  }) =>
    request<{ url: string; orderId: string }>(`${MAIN_SERVER_URL}/api/payments/create-checkout-session`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getAdminStats: () => request<AdminStats>(`${MAIN_SERVER_URL}/api/admin/stats`)
};

export function saveSession(user: User) {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadSession(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function formatUGX(amount: number) {
  return `UGX ${amount.toLocaleString()}`;
}

export function formatStatus(status: Order["status"]) {
  return status.replace(/_/g, " ");
}
