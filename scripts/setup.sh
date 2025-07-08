#!/bin/bash

# ExzosVerse Setup Script

echo "🌟 ExzosVerse - Setup Inicial"
echo "=============================="

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar pré-requisitos
echo -e "${YELLOW}🔍 Verificando pré-requisitos...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm não encontrado! Instale com: npm install -g pnpm${NC}"
    exit 1
fi

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
pnpm install

# Configurar banco de dados
echo -e "${YELLOW}🗺️ Configurando banco de dados...${NC}"
cd packages/database
pnpm db:generate
pnpm db:push
pnpm db:seed
cd ../..

# Copiar arquivos de ambiente
echo -e "${YELLOW}🔐 Configurando variáveis de ambiente...${NC}"
cp .env.example .env.local

echo -e "${GREEN}✅ Setup concluído!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Configure as variáveis em .env.local"
echo "2. Execute 'pnpm dev' para iniciar o desenvolvimento"
echo "3. Acesse http://localhost:3000"
echo ""
echo "Organizações de teste:"
echo "- volaron (Enterprise)"
echo "- cliente-x (Pro)"