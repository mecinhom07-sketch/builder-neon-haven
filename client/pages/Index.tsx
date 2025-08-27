import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Plus, Minus, Clock, MapPin, Phone, Star, Search } from 'lucide-react';
import { Product, CartItem } from '@shared/types';

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product, quantity: number, notes?: string) => void }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity, notes);
    setQuantity(1);
    setNotes('');
    setIsDialogOpen(false);
  };

  return (
    <Card className="food-card-hover overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-restaurant-orange/20 to-restaurant-warm/30 flex items-center justify-center relative overflow-hidden">
          {product.is_featured && (
            <Badge className="absolute top-2 left-2 bg-restaurant-orange text-restaurant-orange-foreground z-10">
              <Star className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          )}
          {!product.is_available && (
            <Badge variant="secondary" className="absolute top-2 right-2 z-10">
              Indisponível
            </Badge>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML += '<div class="text-6xl opacity-20">🍔</div>';
              }}
            />
          ) : (
            <div className="text-6xl opacity-20">🍔</div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <span className="font-bold text-restaurant-orange text-lg">{formatPrice(product.price)}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
          {product.preparation_time && (
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <Clock className="w-4 h-4 mr-1" />
              {product.preparation_time} min
            </div>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full restaurant-gradient hover:opacity-90" 
                disabled={!product.is_available}
              >
                <Plus className="w-4 h-4 mr-2" />
                {product.is_available ? 'Adicionar' : 'Indisponível'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Quantidade:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                  <Textarea
                    placeholder="Ex: sem cebola, ponto da carne..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-bold text-lg">Total: {formatPrice(product.price * quantity)}</span>
                  <Button onClick={handleAddToCart} className="restaurant-gradient">
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function Cart() {
  const { cart, updateCartItem, removeFromCart, clearCart, getCartTotal, storeConfig } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const total = getCartTotal();
  const deliveryFee = storeConfig?.delivery_fee || 0;
  const grandTotal = total + deliveryFee;

  const handleWhatsAppOrder = () => {
    if (!storeConfig || cart.length === 0) return;

    const orderDetails = cart.map(item => 
      `${item.quantity}x ${item.product.name} - ${formatPrice(item.product.price * item.quantity)}${item.notes ? ` (${item.notes})` : ''}`
    ).join('\n');

    const message = `🍔 *NOVO PEDIDO*

*Cliente:* ${customerData.name}
*Telefone:* ${customerData.phone}
${customerData.address ? `*Endereço:* ${customerData.address}` : ''}

*Pedido:*
${orderDetails}

*Subtotal:* ${formatPrice(total)}
*Taxa de entrega:* ${formatPrice(deliveryFee)}
*Total:* ${formatPrice(grandTotal)}

${customerData.notes ? `*Observações:* ${customerData.notes}` : ''}`;

    const whatsappUrl = `https://wa.me/${storeConfig.whatsapp_number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    clearCart();
    setCustomerData({ name: '', phone: '', address: '', notes: '' });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-4 right-4 rounded-full w-16 h-16 restaurant-gradient shadow-lg z-50">
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center bg-red-500">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seu Pedido</DialogTitle>
        </DialogHeader>
        {cart.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Seu carrinho está vazio</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                    {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Input
                placeholder="Seu nome"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Seu telefone"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Endereço para entrega (opcional)"
                value={customerData.address}
                onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
              />
              <Textarea
                placeholder="Observações adicionais"
                value={customerData.notes}
                onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de entrega:</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Button
              className="w-full restaurant-gradient"
              onClick={handleWhatsAppOrder}
              disabled={!customerData.name || !customerData.phone}
            >
              Finalizar Pedido via WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Index() {
  const { storeConfig, categories, products, addToCart, isLoading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter(product => product.is_featured && product.is_available);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-restaurant-orange mx-auto mb-4"></div>
          <p>Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!storeConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Erro ao carregar dados da lanchonete</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="restaurant-gradient text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">{storeConfig.store_name}</h1>
          <p className="text-lg opacity-90">{storeConfig.banner_text}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {storeConfig.address}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              WhatsApp: {storeConfig.whatsapp_number}
            </div>
          </div>
          {!storeConfig.is_open && (
            <Badge variant="destructive" className="mt-4">
              Fechado no momento
            </Badge>
          )}
        </div>
      </header>

      {/* Search and Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "restaurant-gradient" : ""}
          >
            Todos
          </Button>
          {categories.filter(cat => cat.is_active).map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? "restaurant-gradient" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && !searchTerm && !selectedCategory && (
        <section className="container mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Destaques da Casa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* Products by Category */}
      <section className="container mx-auto px-4 pb-20">
        {selectedCategory ? (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {categories.find(cat => cat.id === selectedCategory)?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        ) : (
          categories.filter(cat => cat.is_active).map((category) => {
            const categoryProducts = filteredProducts.filter(product => product.category_id === category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category.id} className="mb-12">
                <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                {category.description && (
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </section>

      {/* Floating Cart */}
      <Cart />

      {/* Admin Link */}
      <div className="fixed bottom-4 left-4">
        <Button variant="ghost" size="sm" asChild>
          <a href="/admin">Admin</a>
        </Button>
      </div>
    </div>
  );
}
