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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userEmail: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  imageUrl?: string;
  isAdmin: boolean;
  token: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
