# ExzosVerse Platform

> Fork multi-tenant do Lobe Chat para gerenciar múltiplos clientes

## 🚀 Setup

```bash
# Clone Lobe Chat
git submodule add https://github.com/lobehub/lobe-chat .
git submodule update --init --recursive

# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env.local

# Rodar em dev
pnpm dev
```

## 🎯 Modificações para Multi-Tenant

1. **Middleware de Tenant**: Detecta organização por subdomínio/path
2. **Context Provider**: Fornece dados da organização atual
3. **Tema Dinâmico**: Aplica cores e branding por tenant
4. **Isolamento de Dados**: Cada org com seus próprios dados
5. **Menu Customizado**: Link para loja e outros módulos

## 🔗 URLs de Acesso

- Volaron: https://volaron.exzosverse.com
- Cliente X: https://cliente-x.exzosverse.com
- Admin: https://admin.exzosverse.com