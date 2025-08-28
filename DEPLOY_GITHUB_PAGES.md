# 🚀 Deploy no GitHub Pages

## 📋 Instruções de Configuração

### 1. Configure o Repositório GitHub

1. **Vá para Settings** do seu repositório
2. **Pages** → Source: "GitHub Actions"
3. **Secrets and variables** → Actions → New repository secret

Adicione estas variáveis secretas:

```
VITE_SUPABASE_URL=https://seuprojectid.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 2. Crie o Workflow do GitHub Actions

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build project
        run: pnpm build:pages
        env:
          NODE_ENV: production
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Comandos de Build

Para build local de teste:

```bash
# Build para GitHub Pages
pnpm build:pages

# Preview local
pnpm preview
```

### 4. URL do Site

Após o deploy, seu site estará disponível em:

```
https://mecinhom07-sketch.github.io/builder-neon-haven/
```

## ✅ Configurações Aplicadas

### 🔧 Vite Config

- ✅ Base path configurado para `/builder-neon-haven/`
- ✅ Build otimizado para produção
- ✅ Code splitting implementado

### 🌐 SPA Routing

- ✅ `404.html` para redirects do GitHub Pages
- ✅ Script de redirect no `index.html`
- ✅ Routing client-side funcionando

### 📦 Build Process

- ✅ Script `build:pages` criado
- ✅ 404.html copiado para dist
- ✅ Assets otimizados

## ���� Deploy Automático

1. **Push para main** → Deploy automático
2. **PR aberto** → Build de teste
3. **Erro?** → Check Actions tab
4. **Sucesso** → Site no ar! 🎉

## 🧪 Teste Local

```bash
# Simular GitHub Pages localmente
pnpm build:pages
pnpm preview
```

Acesse: `http://localhost:4173/builder-neon-haven/`

## 🔧 Troubleshooting

### Problema: Rotas 404

- ✅ Verifique se `404.html` existe em `/dist`
- ✅ Confirme script no `index.html`

### Problema: Assets não carregam

- ✅ Verifique `base` no `vite.config.ts`
- ✅ Confirme nome do repositório

### Problema: Supabase não conecta

- ✅ Verifique secrets no GitHub
- ✅ Confirme URL e chave do Supabase

---

**Deploy configurado para GitHub Pages! 🚀**
