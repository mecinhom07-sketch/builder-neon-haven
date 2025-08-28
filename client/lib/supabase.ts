import { createClient } from '@supabase/supabase-js';

// These will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface StoreConfigDB {
  id: string;
  store_name: string;
  whatsapp_number: string;
  address: string;
  delivery_fee: number;
  is_open: boolean;
  opening_hours: any;
  banner_image_url?: string;
  banner_text?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryDB {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductDB {
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
}
