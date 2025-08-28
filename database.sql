-- ============================================
-- SUPABASE DATABASE SETUP FOR RESTAURANT APP
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- Create store_config table
CREATE TABLE IF NOT EXISTS store_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  opening_hours JSONB DEFAULT '{}',
  banner_image_url TEXT,
  banner_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  preparation_time INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a restaurant menu)
DROP POLICY IF EXISTS "Allow public read access on store_config" ON store_config;
CREATE POLICY "Allow public read access on store_config" ON store_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on products" ON products;
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);

-- Allow all operations for ALL users (since admin is password-protected in the app)
DROP POLICY IF EXISTS "Allow all operations on store_config" ON store_config;
CREATE POLICY "Allow all operations on store_config" ON store_config FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on products" ON products;
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_store_config_updated_at ON store_config;
CREATE TRIGGER update_store_config_updated_at BEFORE UPDATE ON store_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default store config (only if table is empty)
INSERT INTO store_config (store_name, whatsapp_number, address, delivery_fee, banner_text, opening_hours)
SELECT 
  'Sabor & Cia',
  '5511999999999',
  'Rua das Delícias, 123 - Centro',
  5.00,
  'Bem-vindos ao melhor sabor da cidade!',
  '{
    "monday": {"open": "18:00", "close": "23:00", "closed": false},
    "tuesday": {"open": "18:00", "close": "23:00", "closed": false},
    "wednesday": {"open": "18:00", "close": "23:00", "closed": false},
    "thursday": {"open": "18:00", "close": "23:00", "closed": false},
    "friday": {"open": "18:00", "close": "23:30", "closed": false},
    "saturday": {"open": "18:00", "close": "23:30", "closed": false},
    "sunday": {"open": "18:00", "close": "22:00", "closed": false}
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM store_config);

-- Insert default categories (only if table is empty)
INSERT INTO categories (name, description, order_index, is_active)
SELECT * FROM (VALUES
  ('Lanches', 'Deliciosos sanduíches artesanais', 1, true),
  ('Bebidas', 'Refrescantes bebidas geladas', 2, true),
  ('Sobremesas', 'Doces irresistíveis', 3, true)
) AS new_categories(name, description, order_index, is_active)
WHERE NOT EXISTS (SELECT 1 FROM categories);

-- Insert sample products (only if table is empty)
INSERT INTO products (name, description, price, category_id, is_available, is_featured, preparation_time, order_index)
SELECT 
  sample_products.name,
  sample_products.description,
  sample_products.price,
  categories.id,
  sample_products.is_available,
  sample_products.is_featured,
  sample_products.preparation_time,
  sample_products.order_index
FROM (VALUES
  ('X-Burger Especial', 'Hambúrguer artesanal com carne bovina, queijo, alface, tomate e molho especial', 18.90, 'Lanches', true, true, 15, 1),
  ('X-Bacon', 'Hambúrguer com bacon crocante, queijo, alface e tomate', 21.90, 'Lanches', true, false, 18, 2),
  ('Coca-Cola 350ml', 'Refrigerante gelado', 5.50, 'Bebidas', true, false, 2, 1),
  ('Brownie com Sorvete', 'Brownie quentinho com bola de sorvete de baunilha', 12.90, 'Sobremesas', true, true, 10, 1)
) AS sample_products(name, description, price, category_name, is_available, is_featured, preparation_time, order_index)
JOIN categories ON categories.name = sample_products.category_name
WHERE NOT EXISTS (SELECT 1 FROM products);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE store_config;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Success message
SELECT 'Database setup completed successfully! 🎉' AS status;
