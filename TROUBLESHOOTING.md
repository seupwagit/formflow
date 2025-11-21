# Troubleshooting - Deploy no Coolify

## Problemas Comuns e Soluções

### 1. Build Falha no Coolify

#### Erro: "Module not found"
**Causa:** Dependências não instaladas corretamente.

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

No Coolify, force um rebuild completo.

#### Erro: "Out of memory"
**Causa:** Build do Next.js consome muita memória.

**Solução:**
- Aumente a memória alocada no Coolify (mínimo 2GB recomendado)
- Ou adicione variável de ambiente: `NODE_OPTIONS=--max-old-space-size=4096`

### 2. Aplicação Não Inicia

#### Erro: "Port 3000 already in use"
**Causa:** Porta já está sendo usada.

**Solução:**
- No Coolify, verifique se não há outra aplicação usando a porta 3000
- Ou configure uma porta diferente via variável `PORT`

#### Erro: "Cannot find module '.next/standalone'"
**Causa:** Build não gerou os arquivos standalone.

**Solução:**
- Verifique se `output: 'standalone'` está no `next.config.js`
- Force um rebuild completo

### 3. Variáveis de Ambiente

#### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Causa:** Variáveis de ambiente não configuradas.

**Solução:**
1. No Coolify, vá em "Environment Variables"
2. Adicione todas as variáveis do `.env.production.example`
3. Redeploy a aplicação

**Importante:** Variáveis `NEXT_PUBLIC_*` precisam estar disponíveis no build time!

### 4. Problemas com PDF.js

#### Erro: "pdf.worker.min.js not found"
**Causa:** Arquivo worker não foi copiado para o build.

**Solução:**
- Verifique se o script `postinstall` está executando
- Verifique se `public/pdf.worker.min.js` existe
- Execute manualmente: `npm run setup-pdf`

### 5. Problemas com Docker

#### Build Docker Lento
**Solução:**
- Use `.dockerignore` para excluir arquivos desnecessários
- Use cache de layers do Docker
- No Coolify, habilite "Docker Build Cache"

#### Erro: "COPY failed"
**Causa:** Arquivos não encontrados durante o build.

**Solução:**
- Verifique se todos os arquivos necessários estão commitados no Git
- Verifique o `.dockerignore` para garantir que não está excluindo arquivos importantes

### 6. Performance em Produção

#### Aplicação Lenta
**Soluções:**
1. **Habilitar compressão:**
   - O Coolify já faz isso automaticamente via proxy reverso

2. **Otimizar imagens:**
   - Use Next.js Image component
   - Configure domínios permitidos no `next.config.js`

3. **Cache:**
   - Configure headers de cache apropriados
   - Use CDN se disponível

#### Alto uso de memória
**Soluções:**
- Aumente a memória alocada no Coolify
- Otimize processamento de PDFs grandes
- Configure limites de upload menores

### 7. Problemas com Supabase

#### Erro: "Failed to fetch"
**Causa:** URL ou chaves do Supabase incorretas.

**Solução:**
1. Verifique as variáveis de ambiente
2. Teste a conexão localmente primeiro
3. Verifique se o projeto Supabase está ativo

#### Erro: "Invalid API key"
**Causa:** Chave de API expirada ou incorreta.

**Solução:**
- Gere novas chaves no painel do Supabase
- Atualize as variáveis no Coolify
- Redeploy

### 8. Problemas com Gemini AI

#### Erro: "API key not valid"
**Causa:** Chave de API do Gemini incorreta ou sem permissões.

**Solução:**
1. Verifique a chave em https://makersuite.google.com/app/apikey
2. Certifique-se que a API está habilitada
3. Verifique quotas e limites

### 9. Health Check Falha

#### Erro: "Health check failed"
**Causa:** Endpoint `/api/health` não responde.

**Solução:**
1. Verifique se o arquivo `app/api/health/route.ts` existe
2. Teste localmente: `curl http://localhost:3000/api/health`
3. Verifique logs da aplicação no Coolify

### 10. SSL/HTTPS

#### Erro: "Certificate error"
**Causa:** SSL não configurado corretamente.

**Solução:**
- O Coolify configura SSL automaticamente via Let's Encrypt
- Aguarde alguns minutos após adicionar o domínio
- Verifique se o DNS está apontando corretamente

## Comandos Úteis para Debug

### Verificar variáveis de ambiente
```bash
npm run check-env
```

### Testar build localmente
```bash
npm run build
npm start
```

### Testar com Docker
```bash
npm run docker:build
npm run docker:run
```

### Ver logs do Docker
```bash
docker logs <container-id>
```

### Acessar container em execução
```bash
docker exec -it <container-id> sh
```

## Logs no Coolify

1. Acesse o painel do Coolify
2. Vá em "Logs" na sua aplicação
3. Filtre por:
   - Build logs (para problemas de build)
   - Application logs (para problemas em runtime)

## Suporte

Se o problema persistir:

1. Verifique os logs completos no Coolify
2. Teste localmente com as mesmas variáveis de ambiente
3. Verifique a documentação do Coolify: https://coolify.io/docs
4. Verifique a documentação do Next.js: https://nextjs.org/docs

## Checklist Pré-Deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build local funciona: `npm run build`
- [ ] Testes passam (se houver)
- [ ] `.env.local` não está commitado
- [ ] `next.config.js` tem `output: 'standalone'`
- [ ] Arquivo `pdf.worker.min.js` existe em `public/`
- [ ] Health check responde: `/api/health`
- [ ] Domínio configurado (se aplicável)
- [ ] DNS apontando para o Coolify (se aplicável)
