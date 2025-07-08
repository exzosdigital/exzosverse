# 🌟 ExzosVerse - Multi-Tenant AI Platform

> Plataforma multi-tenant baseada em Lobe Chat para gerenciar múltiplos clientes da Exzos Digital

## 🏗️ Arquitetura

- **Multi-Tenant**: Suporte para múltiplas organizações/clientes
- **AI-Powered**: Integração com GPT-4, Claude, Gemini
- **Customizável**: Cada tenant com sua própria identidade visual
- **Escalável**: Arquitetura pronta para crescimento

## 📁 Estrutura do Projeto

```
exzosverse/
├── apps/
│   ├── platform/       # Lobe Chat Multi-tenant
│   ├── admin/          # Painel Admin ExzosVerse
│   └── landing/        # Site Institucional
├── packages/
│   ├── @exzos/auth/    # Autenticação compartilhada
│   ├── @exzos/ui/      # Componentes UI
│   ├── @exzos/database/# Schemas Prisma
│   └── @exzos/types/   # TypeScript types
└── docker-compose.yml
```

## 🚀 Quick Start

```bash
# Clone o repositório
git clone https://github.com/exzosdigital/exzosverse

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Rode o projeto
pnpm dev
```

## 🎯 Clientes

- **Volaron Store** - E-commerce com IA
- **Cliente X** - Em desenvolvimento

## 📝 Licença

Proprietário - Exzos Digital © 2025