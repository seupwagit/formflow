# 🚀 Quick Start - Deploy no Coolify

## Em 5 Minutos

### 1️⃣ Verificar Projeto (30 segundos)

```bash
npm run pre-deploy
```

Se aparecer ✅ SUCESSO, continue!

### 2️⃣ Commit e Push (1 minuto)

```bash
git add .
git commit -m "Configurar deploy para Coolify"
git push
```

### 3️⃣ Criar Aplicação no Coolify (2 minutos)

1. Acesse seu Coolify
2. **New Resource** → **Application**
3. Selecione seu repositório Git
4. Escolha a branch (main/master)

### 4️⃣ Configurar Variáveis (1 minuto)

No Coolify, adicione estas variáveis obrigatórias:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
SUPABASE_SERVICE_ROLE_KEY=sua_chave
GEMINI_API_KEY=sua_chave
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NODE_ENV=production
```

**Dica:** Copie de `.env.production.example`

### 5️⃣ Deploy! (30 segundos)

Clique em **Deploy** e aguarde!

---

## ✅ Verificar Deploy

Após o deploy, teste:

1. **Health Check:**
   ```
   https://seu-dominio.com/api/health
   ```
   Deve retornar: `{"status":"ok",...}`

2. **Página Principal:**
   ```
   https://seu-dominio.com
   ```
   Deve carregar normalmente

---

## 🆘 Problemas?

### Build Falha
```bash
# Teste localmente primeiro
npm run build
npm start
```

### Variáveis Não Funcionam
```bash
# Verifique quais estão faltando
npm run check-env
```

### Precisa de Ajuda?
Consulte: `TROUBLESHOOTING.md`

---

## 📱 Configuração Automática

O Coolify detecta automaticamente:
- ✅ Projeto Next.js
- ✅ Build command: `npm run build`
- ✅ Start command: `npm start`
- ✅ Port: `3000`

Você só precisa configurar as variáveis de ambiente!

---

## 🎯 Checklist Mínimo

- [ ] `npm run pre-deploy` passou
- [ ] Código no Git
- [ ] Variáveis configuradas no Coolify
- [ ] Deploy clicado

Pronto! 🎉

---

**Tempo total:** ~5 minutos
**Dificuldade:** Fácil
**Documentação completa:** `coolify-deploy.md`
