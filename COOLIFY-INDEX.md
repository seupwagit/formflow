# 📑 Índice Completo - Deploy no Coolify

## 🎯 Por Onde Começar?

### Iniciante / Primeira Vez
👉 **[QUICK-START-COOLIFY.md](./QUICK-START-COOLIFY.md)** - Deploy em 5 minutos

### Usuário Experiente
👉 **[coolify-deploy.md](./coolify-deploy.md)** - Guia completo e detalhado

### Problemas?
👉 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Soluções para problemas comuns

---

## 📁 Estrutura de Arquivos

### 🐳 Docker
| Arquivo | Descrição |
|---------|-----------|
| `Dockerfile` | Imagem otimizada para Next.js com build multi-stage |
| `.dockerignore` | Otimização do build, exclui arquivos desnecessários |
| `docker-compose.yml` | Configuração para teste local com Docker |

### 📖 Documentação
| Arquivo | Quando Usar |
|---------|-------------|
| `QUICK-START-COOLIFY.md` | ⭐ Primeiro deploy, guia rápido |
| `coolify-deploy.md` | Instruções completas e detalhadas |
| `DEPLOY-SUMMARY.md` | Resumo do que foi configurado |
| `TROUBLESHOOTING.md` | Quando algo não funciona |
| `COOLIFY-INDEX.md` | Este arquivo - índice geral |

### ⚙️ Configuração
| Arquivo | Descrição |
|---------|-----------|
| `.coolify` | Configuração automática do Coolify |
| `.env.example` | Template para desenvolvimento local |
| `.env.production.example` | Template para produção (Coolify) |
| `next.config.js` | Configurado com `output: 'standalone'` |

### 🔧 Scripts
| Script | Comando | Descrição |
|--------|---------|-----------|
| Pré-Deploy | `npm run pre-deploy` | Verifica se está pronto para deploy |
| Check Env | `npm run check-env` | Verifica variáveis de ambiente |
| Docker Build | `npm run docker:build` | Build da imagem Docker |
| Docker Run | `npm run docker:run` | Executa container |
| Docker Up | `npm run docker:up` | Inicia com docker-compose |
| Docker Down | `npm run docker:down` | Para docker-compose |

### 🏥 API
| Endpoint | Descrição |
|----------|-----------|
| `/api/health` | Health check para monitoramento |

---

## 🚀 Fluxo de Deploy

```
1. Desenvolvimento Local
   ├─ npm install
   ├─ npm run dev
   └─ Testar funcionalidades

2. Preparação
   ├─ npm run pre-deploy  ✅ Verificar projeto
   ├─ git add .
   ├─ git commit
   └─ git push

3. Coolify
   ├─ New Resource → Application
   ├─ Conectar repositório
   ├─ Configurar variáveis (.env.production.example)
   └─ Deploy!

4. Verificação
   ├─ /api/health  ✅ Health check
   ├─ Página principal  ✅ Funciona
   └─ Logs no Coolify  ✅ Sem erros
```

---

## 📋 Checklists

### Antes do Deploy
- [ ] `npm run pre-deploy` passou sem erros
- [ ] Código commitado e pushed para Git
- [ ] `.env.local` NÃO está commitado
- [ ] Variáveis de produção preparadas

### No Coolify
- [ ] Repositório conectado
- [ ] Branch selecionada (main/master)
- [ ] Variáveis de ambiente configuradas
- [ ] Build settings corretos (automático)

### Após Deploy
- [ ] `/api/health` retorna status OK
- [ ] Aplicação carrega sem erros
- [ ] Funcionalidades principais testadas
- [ ] Logs sem erros críticos

---

## 🔑 Variáveis de Ambiente

### Obrigatórias
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
NEXT_PUBLIC_GEMINI_API_KEY
NEXT_PUBLIC_APP_URL
NODE_ENV=production
```

### Opcionais (com valores padrão)
```env
GEMINI_MODEL=gemini-2.0-flash-exp
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
PDF_QUALITY=0.9
OCR_LANGUAGE=por
# ... e outras (veja .env.production.example)
```

---

## 🆘 Problemas Comuns

| Problema | Solução Rápida | Documentação |
|----------|----------------|--------------|
| Build falha | `npm run build` localmente | TROUBLESHOOTING.md → Build Falha |
| Variáveis não funcionam | `npm run check-env` | TROUBLESHOOTING.md → Variáveis |
| App não inicia | Verificar logs no Coolify | TROUBLESHOOTING.md → Aplicação |
| PDF.js erro | `npm run setup-pdf` | TROUBLESHOOTING.md → PDF.js |
| Health check falha | Verificar `/api/health` | TROUBLESHOOTING.md → Health Check |

---

## 🎓 Recursos Adicionais

### Documentação Externa
- [Coolify Docs](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Comandos Úteis
```bash
# Verificações
npm run pre-deploy
npm run check-env

# Docker local
npm run docker:build
npm run docker:up

# Build de produção
npm run build
npm start
```

---

## 📞 Suporte

1. **Primeiro:** Consulte `TROUBLESHOOTING.md`
2. **Logs:** Verifique logs no Coolify
3. **Teste Local:** Execute com Docker localmente
4. **Documentação:** Leia os guias específicos

---

## ✨ Resumo

Este projeto está **100% pronto** para deploy no Coolify com:

- ✅ Dockerfile otimizado
- ✅ Configuração automática
- ✅ Health check
- ✅ Scripts de verificação
- ✅ Documentação completa
- ✅ Troubleshooting

**Tempo estimado de deploy:** 5-10 minutos

**Próximo passo:** [QUICK-START-COOLIFY.md](./QUICK-START-COOLIFY.md)

---

*Última atualização: Configuração inicial para Coolify*
