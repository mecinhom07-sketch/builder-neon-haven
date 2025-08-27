import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StoreConfig, Category, Product, CartItem } from '@shared/types';

interface StoreContextType {
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

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock data for development
const mockStoreConfig: StoreConfig = {
  id: '1',
  store_name: 'Sabor & Cia',
  whatsapp_number: '5511999999999',
  address: 'Rua das Delícias, 123 - Centro',
  delivery_fee: 5.00,
  is_open: true,
  opening_hours: {
    monday: { open: '18:00', close: '23:00', closed: false },
    tuesday: { open: '18:00', close: '23:00', closed: false },
    wednesday: { open: '18:00', close: '23:00', closed: false },
    thursday: { open: '18:00', close: '23:00', closed: false },
    friday: { open: '18:00', close: '23:30', closed: false },
    saturday: { open: '18:00', close: '23:30', closed: false },
    sunday: { open: '18:00', close: '22:00', closed: false },
  },
  banner_text: 'Bem-vindos ao melhor sabor da cidade!',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Lanches',
    description: 'Deliciosos sanduíches artesanais',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bebidas',
    description: 'Refrescantes bebidas geladas',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Sobremesas',
    description: 'Doces irresistíveis',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'X-Burger Especial',
    description: 'Hambúrguer artesanal com carne bovina, queijo, alface, tomate e molho especial',
    price: 18.90,
    category_id: '1',
    is_available: true,
    is_featured: true,
    preparation_time: 15,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'X-Bacon',
    description: 'Hambúrguer com bacon crocante, queijo, alface e tomate',
    price: 21.90,
    category_id: '1',
    is_available: true,
    is_featured: false,
    preparation_time: 18,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Coca-Cola 350ml',
    description: 'Refrigerante gelado',
    price: 5.50,
    category_id: '2',
    is_available: true,
    is_featured: false,
    preparation_time: 2,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Brownie com Sorvete',
    description: 'Brownie quentinho com bola de sorvete de baunilha',
    price: 12.90,
    category_id: '3',
    is_available: true,
    is_featured: true,
    preparation_time: 10,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with stored or mock data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load from localStorage or use mock data
        const storedConfig = localStorage.getItem('restaurant_store_config');
        const storedCategories = localStorage.getItem('restaurant_categories');
        const storedProducts = localStorage.getItem('restaurant_products');

        setStoreConfig(storedConfig ? JSON.parse(storedConfig) : mockStoreConfig);
        setCategories(storedCategories ? JSON.parse(storedCategories) : mockCategories);
        setProducts(storedProducts ? JSON.parse(storedProducts) : mockProducts);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load store data');
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const updateStoreConfig = async (config: Partial<StoreConfig>) => {
    if (!storeConfig) return;
    const updatedConfig = { ...storeConfig, ...config, updated_at: new Date().toISOString() };
    setStoreConfig(updatedConfig);
    localStorage.setItem('restaurant_store_config', JSON.stringify(updatedConfig));
  };

  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem('restaurant_categories', JSON.stringify(updatedCategories));
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    const updatedCategories = categories.map(cat =>
      cat.id === id ? { ...cat, ...category, updated_at: new Date().toISOString() } : cat
    );
    setCategories(updatedCategories);
    localStorage.setItem('restaurant_categories', JSON.stringify(updatedCategories));
  };

  const deleteCategory = async (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id);
    const updatedProducts = products.filter(prod => prod.category_id !== id);
    setCategories(updatedCategories);
    setProducts(updatedProducts);
    localStorage.setItem('restaurant_categories', JSON.stringify(updatedCategories));
    localStorage.setItem('restaurant_products', JSON.stringify(updatedProducts));
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('restaurant_products', JSON.stringify(updatedProducts));
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const updatedProducts = products.map(prod =>
      prod.id === id ? { ...prod, ...product, updated_at: new Date().toISOString() } : prod
    );
    setProducts(updatedProducts);
    localStorage.setItem('restaurant_products', JSON.stringify(updatedProducts));
  };

  const deleteProduct = async (id: string) => {
    const updatedProducts = products.filter(prod => prod.id !== id);
    setProducts(updatedProducts);
    setCart(prev => prev.filter(item => item.product.id !== id));
    localStorage.setItem('restaurant_products', JSON.stringify(updatedProducts));
  };

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
    setIsLoading(true);
    // In a real app, this would refetch from Supabase
    setIsLoading(false);
  };

  const value: StoreContextType = {
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

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
