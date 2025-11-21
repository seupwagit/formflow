# FormFlow - Sistema de Mapeamento Automático de Formulários

Sistema inteligente para mapeamento e inspeção de formulários com IA.

## 🚀 Deploy no Coolify

Este projeto está **100% pronto** para deploy no Coolify!

### 🎯 Começar Agora

**✅ STATUS FINAL** → [FINAL-STATUS.md](./FINAL-STATUS.md) (todas as correções aplicadas!)

**Quick Start** → [QUICK-START-COOLIFY.md](./QUICK-START-COOLIFY.md) (5 minutos)

**Ver tudo** → [COOLIFY-INDEX.md](./COOLIFY-INDEX.md) (índice completo)

### Quick Start

```bash
# 1. Verificar se está pronto
npm run pre-deploy

# 2. Commit e push
git add . && git commit -m "Deploy" && git push

# 3. No Coolify: New Resource → Application → Deploy!
```

O Coolify detecta automaticamente as configurações do Next.js.

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

## 🐳 Docker

```bash
# Build e executar com Docker
docker build -t formflow .
docker run -p 3000:3000 --env-file .env.local formflow

# Ou usar docker-compose
docker-compose up --build
```

## 📋 Variáveis de Ambiente

Copie `.env.example` para `.env.local` e configure suas chaves:

- **Supabase:** URL e chaves de API
- **Gemini AI:** Chave de API do Google AI
- **Configurações da aplicação:** URLs, limites, etc.

## 🏥 Health Check

Endpoint disponível em `/api/health` para monitoramento.

## 📚 Documentação

### Deploy
- [🚀 Quick Start (5 minutos)](./QUICK-START-COOLIFY.md)
- [📖 Guia Completo de Deploy](./coolify-deploy.md)
- [📋 Resumo da Configuração](./DEPLOY-SUMMARY.md)
- [🆘 Troubleshooting](./TROUBLESHOOTING.md)

### Configuração
- [Variáveis de Ambiente - Desenvolvimento](./.env.example)
- [Variáveis de Ambiente - Produção](./.env.production.example)

### Scripts Úteis
```bash
npm run pre-deploy    # Verificar se está pronto para deploy
npm run check-env     # Verificar variáveis de ambiente
npm run docker:build  # Build da imagem Docker
npm run docker:up     # Testar com Docker Compose
```
