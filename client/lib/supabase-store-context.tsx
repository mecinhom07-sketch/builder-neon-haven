import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, StoreConfigDB, CategoryDB, ProductDB } from './supabase';
import { StoreConfig, Category, Product, CartItem } from '@shared/types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SupabaseStoreContextType {
  storeConfig: StoreConfig | null;
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  
  // Store management
  updateStoreConfig: (config: Partial<StoreConfig>) => Promise<void>;
  
  // Category management
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Product management
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Cart management
  addToCart: (product: Product, quantity: number, notes?: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  
  // Data fetching
  refreshData: () => Promise<void>;
}

const SupabaseStoreContext = createContext<SupabaseStoreContextType | undefined>(undefined);

// Convert database types to app types
const convertStoreConfig = (config: StoreConfigDB): StoreConfig => ({
  id: config.id,
  store_name: config.store_name,
  whatsapp_number: config.whatsapp_number,
  address: config.address,
  delivery_fee: config.delivery_fee,
  is_open: config.is_open,
  opening_hours: config.opening_hours,
  banner_image_url: config.banner_image_url,
  banner_text: config.banner_text,
  created_at: config.created_at,
  updated_at: config.updated_at,
});

const convertCategory = (category: CategoryDB): Category => ({
  id: category.id,
  name: category.name,
  description: category.description,
  order_index: category.order_index,
  is_active: category.is_active,
  created_at: category.created_at,
  updated_at: category.updated_at,
});

const convertProduct = (product: ProductDB): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  image_url: product.image_url,
  category_id: product.category_id,
  is_available: product.is_available,
  is_featured: product.is_featured,
  preparation_time: product.preparation_time,
  order_index: product.order_index,
  created_at: product.created_at,
  updated_at: product.updated_at,
});

export function SupabaseStoreProvider({ children }: { children: ReactNode }) {
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load store config
      const { data: configData, error: configError } = await supabase
        .from('store_config')
        .select('*')
        .limit(1)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (categoriesError) throw categoriesError;

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('order_index');

      if (productsError) throw productsError;

      setStoreConfig(configData ? convertStoreConfig(configData) : null);
      setCategories(categoriesData?.map(convertCategory) || []);
      setProducts(productsData?.map(convertProduct) || []);
    } catch (err) {
      setError('Erro ao carregar dados: ' + (err as Error).message);
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    loadData();

    // Subscribe to store_config changes
    const storeConfigSubscription = supabase
      .channel('store_config_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'store_config' },
          (payload: RealtimePostgresChangesPayload<StoreConfigDB>) => {
            if (payload.eventType === 'UPDATE' && payload.new) {
              setStoreConfig(convertStoreConfig(payload.new));
            }
          }
      )
      .subscribe();

    // Subscribe to categories changes
    const categoriesSubscription = supabase
      .channel('categories_changes')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          (payload: RealtimePostgresChangesPayload<CategoryDB>) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              setCategories(prev => [...prev, convertCategory(payload.new!)].sort((a, b) => a.order_index - b.order_index));
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              setCategories(prev => prev.map(cat => 
                cat.id === payload.new!.id ? convertCategory(payload.new!) : cat
              ).sort((a, b) => a.order_index - b.order_index));
            } else if (payload.eventType === 'DELETE' && payload.old) {
              setCategories(prev => prev.filter(cat => cat.id !== payload.old!.id));
            }
          }
      )
      .subscribe();

    // Subscribe to products changes
    const productsSubscription = supabase
      .channel('products_changes')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload: RealtimePostgresChangesPayload<ProductDB>) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              setProducts(prev => [...prev, convertProduct(payload.new!)].sort((a, b) => a.order_index - b.order_index));
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              setProducts(prev => prev.map(prod => 
                prod.id === payload.new!.id ? convertProduct(payload.new!) : prod
              ).sort((a, b) => a.order_index - b.order_index));
            } else if (payload.eventType === 'DELETE' && payload.old) {
              setProducts(prev => prev.filter(prod => prod.id !== payload.old!.id));
              setCart(prev => prev.filter(item => item.product.id !== payload.old!.id));
            }
          }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      storeConfigSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
      productsSubscription.unsubscribe();
    };
  }, []);

  // Store management
  const updateStoreConfig = async (config: Partial<StoreConfig>) => {
    if (!storeConfig) return;
    
    const { error } = await supabase
      .from('store_config')
      .update(config)
      .eq('id', storeConfig.id);

    if (error) {
      throw new Error('Erro ao atualizar configurações: ' + error.message);
    }
  };

  // Category management
  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('categories')
      .insert([category]);

    if (error) {
      throw new Error('Erro ao adicionar categoria: ' + error.message);
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    const { error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id);

    if (error) {
      throw new Error('Erro ao atualizar categoria: ' + error.message);
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Erro ao excluir categoria: ' + error.message);
    }
  };

  // Product management
  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase
      .from('products')
      .insert([product]);

    if (error) {
      throw new Error('Erro ao adicionar produto: ' + error.message);
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);

    if (error) {
      throw new Error('Erro ao atualizar produto: ' + error.message);
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Erro ao excluir produto: ' + error.message);
    }
  };

  // Cart management (still local)
  const addToCart = (product: Product, quantity: number, notes?: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, notes }
            : item
        );
      } else {
        return [...prev, { product, quantity, notes }];
      }
    });
  };

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const refreshData = async () => {
    await loadData();
  };

  const value: SupabaseStoreContextType = {
    storeConfig,
    categories,
    products,
    cart,
    isLoading,
    error,
    updateStoreConfig,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    refreshData,
  };

  return <SupabaseStoreContext.Provider value={value}>{children}</SupabaseStoreContext.Provider>;
}

export function useSupabaseStore() {
  const context = useContext(SupabaseStoreContext);
  if (context === undefined) {
    throw new Error('useSupabaseStore must be used within a SupabaseStoreProvider');
  }
  return context;
}
