import { useState } from 'react';
import { useAdminAuth } from '@/lib/use-admin-auth';
import { useStore } from '@/lib/store-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Store,
  Package,
  Tag,
  Clock,
  Phone,
  MapPin,
  DollarSign,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { Category, Product } from '@shared/types';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Área Administrativa</CardTitle>
          <CardDescription>Digite a senha para acessar o painel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full restaurant-gradient">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StoreSettings() {
  const { storeConfig, updateStoreConfig } = useStore();
  const [formData, setFormData] = useState({
    store_name: storeConfig?.store_name || '',
    whatsapp_number: storeConfig?.whatsapp_number || '',
    address: storeConfig?.address || '',
    delivery_fee: storeConfig?.delivery_fee || 0,
    banner_text: storeConfig?.banner_text || '',
    is_open: storeConfig?.is_open || false,
  });

  const handleSave = async () => {
    await updateStoreConfig(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Loja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="store_name">Nome da Lanchonete</Label>
            <Input
              id="store_name"
              value={formData.store_name}
              onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
              placeholder="5511999999999"
            />
          </div>
          
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
            <Input
              id="delivery_fee"
              type="number"
              step="0.01"
              value={formData.delivery_fee}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div>
            <Label htmlFor="banner_text">Texto do Banner</Label>
            <Textarea
              id="banner_text"
              value={formData.banner_text}
              onChange={(e) => setFormData(prev => ({ ...prev, banner_text: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_open"
              checked={formData.is_open}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_open: checked }))}
            />
            <Label htmlFor="is_open">Loja Aberta</Label>
          </div>

          <Button onClick={handleSave} className="restaurant-gradient">
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const handleSave = async () => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await addCategory({
        ...formData,
        order_index: categories.length + 1,
      });
    }
    setFormData({ name: '', description: '', is_active: true });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categorias</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="restaurant-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Ativa</Label>
              </div>
              <Button onClick={handleSave} className="w-full restaurant-gradient">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <Badge variant={category.is_active ? "default" : "secondary"} className="mt-1">
                  {category.is_active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductManager() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category_id: '',
    is_available: true,
    is_featured: false,
    preparation_time: 15,
  });

  const handleSave = async () => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await addProduct({
        ...formData,
        order_index: products.length + 1,
      });
    }
    setFormData({
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category_id: '',
      is_available: true,
      is_featured: false,
      preparation_time: 15,
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url || '',
      category_id: product.category_id,
      is_available: product.is_available,
      is_featured: product.is_featured,
      preparation_time: product.preparation_time || 15,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
    }
  };

  const toggleAvailability = async (product: Product) => {
    await updateProduct(product.id, { is_available: !product.is_available });
  };

  const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Produtos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="restaurant-gradient">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.is_active).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prep_time">Tempo de Preparo (min)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: parseInt(e.target.value) || 15 }))}
                />
              </div>
              <div>
                <Label>Imagem do Produto</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                  />
                  <Label htmlFor="is_available">Disponível</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Destaque</Label>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full restaurant-gradient">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.map((product) => {
          const category = categories.find(cat => cat.id === product.category_id);
          return (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant="outline">{category?.name}</Badge>
                      {product.is_featured && (
                        <Badge className="bg-restaurant-orange text-restaurant-orange-foreground">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-restaurant-orange">
                        {formatPrice(product.price)}
                      </span>
                      {product.preparation_time && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {product.preparation_time} min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(product)}
                    >
                      {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {!product.is_available && (
                  <Badge variant="secondary" className="mt-2">
                    Indisponível
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAuthenticated, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <a href="/">Ver Cardápio</a>
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <StoreSettings />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="products">
            <ProductManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
