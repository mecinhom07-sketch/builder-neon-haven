export interface Category {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id: string;
  is_available: boolean;
  is_featured: boolean;
  preparation_time?: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface StoreConfig {
  id: string;
  store_name: string;
  whatsapp_number: string;
  address: string;
  delivery_fee: number;
  is_open: boolean;
  opening_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  banner_image_url?: string;
  banner_text?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  items: CartItem[];
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  notes?: string;
  total: number;
  delivery_fee: number;
}

export interface AdminAuth {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}
