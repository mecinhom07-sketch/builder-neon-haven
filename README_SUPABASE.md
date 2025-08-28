# 🚀 Sistema de Sincronização em Tempo Real com Supabase

## 📋 Configuração

### 1. Configure o Supabase

1. **Execute o SQL**: Copie e cole o conteúdo do arquivo `database.sql` no Supabase Dashboard > SQL Editor
2. **Configure as variáveis de ambiente**:
   - Copie `.env.example` para `.env`
   - Preencha com suas credenciais do Supabase:
   ```
   VITE_SUPABASE_URL=https://seuprojectid.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

### 2. Deploy no Netlify

O projeto já está configurado para deploy no Netlify com:
- ✅ Redirects para SPA (Single Page Application)
- ✅ Configuração automática de build
- ✅ Suporte a rotas cliente-side

## ⚡ Como Funciona o Tempo Real

### 🔄 Sincronização Automática
- **Admin altera produto** → Todos os usuários veem instantaneamente
- **Loja abre/fecha** → Status atualiza em tempo real
- **Novos produtos** → Aparecem automaticamente no cardápio
- **Mudança de preços** → Reflete imediatamente em todos os dispositivos

### 📱 Multi-Dispositivo
- Desktop, tablet, celular - todos sincronizados
- Não precisa atualizar a página
- Funciona em redes diferentes
- Suporte offline com sincronização ao reconectar

## 🛠️ Recursos Implementados

### ✅ Banco de Dados
- **store_config**: Configurações da loja
- **categories**: Categorias de produtos  
- **products**: Produtos do cardápio
- **RLS habilitado**: Segurança por linha
- **Policies públicas**: Leitura livre, escrita controlada

### ✅ Real-time
- **WebSocket**: Conexão persistent para atualizações
- **Subscriptions**: Por tabela individual
- **Auto-reconnect**: Reconexão automática
- **Event handling**: INSERT, UPDATE, DELETE

### ✅ Features
- **Upload de imagens**: Base64 ou URL
- **Gestão de estoque**: Disponível/Indisponível  
- **Produtos em destaque**: Sistema de featured
- **Carrinho local**: Não perde itens durante sync
- **WhatsApp integration**: Pedidos automáticos

## 🎯 Deploy Production

1. **Push para GitHub**
2. **Conecte no Netlify** 
3. **Configure environment variables** no Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy automático** ✨

## 🔧 Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build para produção  
pnpm build
```

## 🧪 Testando Tempo Real

1. Abra o site em 2 navegadores/dispositivos
2. Faça login no admin (senha: 595510)
3. Altere um produto ou configuração
4. Veja a mudança aparecer instantaneamente no outro dispositivo! 🎉

---
**Sistema desenvolvido com React + Supabase Real-time + Netlify** 🚀
