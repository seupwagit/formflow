# Deploy no Coolify - Guia Rápido

## Pré-requisitos
- Conta no Coolify configurada
- Repositório Git (GitHub, GitLab, etc.)
- Variáveis de ambiente configuradas

## ✅ Checklist Pré-Deploy

Antes de fazer o deploy, certifique-se de:

- [ ] Código commitado e pushed para o repositório Git
- [ ] Arquivo `.env.local` NÃO está commitado (deve estar no `.gitignore`)
- [ ] Todas as dependências estão no `package.json`
- [ ] Build local funciona: `npm run build && npm start`
- [ ] Variáveis de ambiente preparadas (veja `.env.production.example`)

## Passos para Deploy

### 1. Criar Novo Projeto no Coolify
1. Acesse seu painel do Coolify
2. Clique em "New Resource" → "Application"
3. Selecione seu repositório Git
4. Escolha a branch (geralmente `main` ou `master`)

### 2. Configurar Build
O Coolify detectará automaticamente que é um projeto Next.js pelo `package.json`.

**Build Command:** `npm run build`
**Start Command:** `npm start`
**Port:** `3000`

### 3. Configurar Variáveis de Ambiente
No painel do Coolify, adicione as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Gemini AI
GEMINI_API_KEY=sua_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=sua_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash-exp

# Application
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_MAX_FILE_SIZE=52428800

# PDF Configuration
PDF_QUALITY=0.9
PDF_SCALE=2.0
PDF_MAX_WIDTH=1200
PDF_MAX_HEIGHT=1600

# PDF.js Worker
NEXT_PUBLIC_PDF_WORKER_LOCAL=/pdf.worker.min.js
NEXT_PUBLIC_PDF_WORKER_FAILOVER=true
NEXT_PUBLIC_PDF_WORKER_TIMEOUT=5000

# OCR Configuration
OCR_LANGUAGE=por
OCR_CONFIDENCE_THRESHOLD=0.6
OCR_HYBRID_MODE=true
OCR_MIN_CONFIDENCE=0.7
OCR_RETRY_ATTEMPTS=3

# AI Configuration
AI_FIELD_DETECTION_AGGRESSIVE=true

# Timeouts
CONVERSION_TIMEOUT=30000
OCR_TIMEOUT=60000

# Debug
NEXT_PUBLIC_DEBUG_PDF=false
NEXT_PUBLIC_LOG_LEVEL=info

# Production
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4. Configurar Domínio (Opcional)
1. No painel do Coolify, vá em "Domains"
2. Adicione seu domínio personalizado
3. O Coolify configurará SSL automaticamente via Let's Encrypt

### 5. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse sua aplicação pela URL fornecida

## Usando Docker (Alternativa)

Se preferir usar o Dockerfile diretamente:

1. No Coolify, selecione "Dockerfile" como método de build
2. O Coolify usará o `Dockerfile` na raiz do projeto
3. Configure as mesmas variáveis de ambiente

## Health Check

O projeto está configurado com health check em:
- Endpoint: `/api/health` (você pode criar este endpoint)
- Intervalo: 30s
- Timeout: 10s

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

1. **Health Check:** Acesse `https://seu-dominio.com/api/health`
   - Deve retornar: `{"status":"ok","timestamp":"...","uptime":...}`

2. **Página Principal:** Acesse `https://seu-dominio.com`
   - Deve carregar sem erros

3. **Console do Browser:** Verifique se não há erros de JavaScript

4. **Logs no Coolify:** Monitore por alguns minutos

## Troubleshooting

Para problemas comuns e soluções detalhadas, consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

### Problemas Rápidos

**Build falha:**
- Verifique variáveis de ambiente
- Verifique logs de build no Coolify
- Execute `npm run check-env` localmente

**Aplicação não inicia:**
- Verifique porta 3000
- Verifique logs da aplicação
- Teste localmente com Docker

**PDF.js não funciona:**
- Verifique `public/pdf.worker.min.js`
- Execute `npm run setup-pdf`

## Comandos Úteis

### Testar build localmente com Docker
```bash
docker build -t form-mapper .
docker run -p 3000:3000 --env-file .env.local form-mapper
```

### Testar com docker-compose
```bash
docker-compose up --build
```

## Recursos Adicionais
- [Documentação Coolify](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
