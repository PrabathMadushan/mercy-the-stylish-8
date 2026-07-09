export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  stock: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  userEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  stripeSessionId?: string;
  createdAt: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  revenue: number;
  lowStockCount: number;
  productCount: number;
}
