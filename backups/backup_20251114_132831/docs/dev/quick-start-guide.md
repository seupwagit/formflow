# 🚀 Guia de Início Rápido - FormFlow

## 📋 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Criar Primeiro Template](#criar-primeiro-template)
3. [Coletar Dados](#coletar-dados)
4. [Visualizar Relatórios](#visualizar-relatorios)
5. [Integrar com API](#integrar-com-api)
6. [Próximos Passos](#proximos-passos)

---

## 🎯 Primeiros Passos

### **1. Criar Conta**

1. Acesse: https://formflow.com.br
2. Clique em "Começar Teste Grátis"
3. Preencha seus dados
4. Confirme seu e-mail
5. Faça login

### **2. Configurar Empresa e Contrato**

Antes de criar templates, você precisa:

#### **Criar Empresa**
1. Vá para **Empresas** → **Nova Empresa**
2. Preencha:
   - Nome da empresa
   - CNPJ/CPF
   - E-mail
   - Telefone (opcional)
3. Clique em **Salvar**

#### **Criar Contrato**
1. Vá para **Contratos** → **Novo Contrato**
2. Preencha:
   - Número do contrato
   - Título
   - Empresa (selecione a criada acima)
   - Data de início
   - Data de fim (opcional)
3. Clique em **Salvar**

---

## 📝 Criar Primeiro Template

### **Método 1: Upload de PDF (Recomendado)**

1. **Prepare seu PDF**
   - Formulário em papel escaneado
   - Ou PDF existente
   - Qualidade mínima: 150 DPI

2. **Acesse o Designer**
   - Vá para **Templates** → **Novo Template**
   - Ou acesse diretamente: `/designer`

3. **Selecione o Contrato**
   - Escolha o contrato criado anteriormente
   - Clique em **Continuar**

4. **Faça Upload do PDF**
   - Clique em **Carregar PDF**
   - Selecione seu arquivo
   - Aguarde o processamento (10-30 segundos)

5. **IA Detecta Campos Automaticamente**
   - A IA analisa o PDF
   - Detecta campos de texto, números, datas, checkboxes
   - Cria campos automaticamente

6. **Ajuste os Campos**
   - Clique em um campo para editar
   - Ajuste posição arrastando
   - Configure propriedades:
     - Nome do campo
     - Tipo (texto, número, data, etc.)
     - Label (rótulo)
     - Obrigatório (sim/não)
     - Validações

7. **Salve o Template**
   - Clique em **Salvar** (Ctrl+S)
   - Digite um nome descritivo
   - Clique em **Confirmar**

### **Método 2: Criar do Zero**

1. **Acesse o Designer**
   - Vá para **Templates** → **Novo Template**

2. **Selecione "Criar do Zero"**
   - Escolha tamanho da página (A4, Letter, etc.)
   - Defina número de páginas

3. **Adicione Campos**
   - Clique em **+ Adicionar Campo**
   - Escolha o tipo
   - Posicione no canvas
   - Configure propriedades

4. **Salve o Template**

---

## 📱 Coletar Dados

### **Opção 1: Preencher pelo Navegador**

1. **Acesse Templates**
   - Vá para **Templates**
   - Encontre seu template

2. **Clique em "Preencher Formulário"**
   - Ícone de lápis azul

3. **Preencha os Campos**
   - Digite as informações
   - Validação em tempo real
   - Campos obrigatórios marcados com *

4. **Salve**
   - **Salvar Rascunho**: Salva sem enviar
   - **Enviar**: Finaliza e envia

### **Opção 2: Compartilhar Link**

1. **Copie o Link**
   - No template, clique em **Compartilhar**
   - Copie o link gerado

2. **Envie para Equipe**
   - WhatsApp, e-mail, SMS
   - Qualquer pessoa com o link pode preencher

3. **Acompanhe Respostas**
   - Vá para **Documentos** ou **Relatórios**
   - Veja respostas em tempo real

### **Opção 3: App Mobile (Em Breve)**

1. Baixe o app FormFlow
2. Faça login
3. Sincronize templates
4. Preencha offline
5. Sincronize quando tiver internet

---

## 📊 Visualizar Relatórios

### **Visualização em Tabela**

1. **Acesse Relatórios**
   - Vá para **Relatórios**
   - Selecione o template

2. **Visualize em Tabela**
   - Clique em **Tabela**
   - Veja todos os dados organizados
   - Ordene por coluna
   - Filtre por campo

3. **Ações Disponíveis**
   - **Visualizar**: Ver detalhes completos
   - **Editar**: Modificar dados
   - **Excluir**: Remover documento
   - **Exportar**: Baixar em CSV/Excel

### **Visualização em Cards**

1. **Clique em "Cards"**
   - Visualização mais visual
   - Ideal para poucos campos

2. **Navegue pelos Cards**
   - Scroll para ver mais
   - Clique para detalhes

### **Visualização Hierárquica**

1. **Acesse Documentos**
   - Vá para **Documentos**

2. **Visualize por Hierarquia**
   - Empresa → Contrato → Template → Documentos
   - Expanda/colapsa níveis
   - Navegue facilmente

### **Exportar Dados**

1. **Selecione Documentos**
   - Marque checkboxes
   - Ou selecione todos

2. **Clique em Exportar**
   - Escolha formato (CSV, Excel, PDF)
   - Aguarde download

---

## 🔌 Integrar com API

### **1. Obter Credenciais**

1. **Acesse Configurações**
   - Vá para **Configurações** → **API**

2. **Gere API Key**
   - Clique em **Gerar Nova Chave**
   - Copie API Key e API Secret
   - **Guarde em local seguro!**

### **2. Testar API**

#### **Usando cURL**

```bash
# 1. Obter Token
curl -X POST https://api.formflow.com.br/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "sua_api_key",
    "api_secret": "seu_api_secret"
  }'

# Response:
# {
#   "access_token": "eyJhbGc...",
#   "token_type": "Bearer",
#   "expires_in": 3600
# }

# 2. Listar Templates
curl -X GET https://api.formflow.com.br/v1/templates \
  -H "Authorization: Bearer eyJhbGc..."

# 3. Criar Response
curl -X POST https://api.formflow.com.br/v1/responses \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "uuid-do-template",
    "status": "submitted",
    "response_data": {
      "inspector_name": "João Silva",
      "inspection_date": "2024-01-20"
    }
  }'
```

#### **Usando JavaScript**

```javascript
// Instalar: npm install axios

const axios = require('axios');

const API_KEY = 'sua_api_key';
const API_SECRET = 'seu_api_secret';
const BASE_URL = 'https://api.formflow.com.br/v1';

async function main() {
  // 1. Autenticar
  const authResponse = await axios.post(`${BASE_URL}/auth/token`, {
    api_key: API_KEY,
    api_secret: API_SECRET
  });
  
  const token = authResponse.data.access_token;
  console.log('✅ Autenticado!');
  
  // 2. Listar Templates
  const templatesResponse = await axios.get(`${BASE_URL}/templates`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('📋 Templates:', templatesResponse.data);
  
  // 3. Criar Response
  const responseData = await axios.post(`${BASE_URL}/responses`, {
    template_id: 'uuid-do-template',
    status: 'submitted',
    response_data: {
      inspector_name: 'João Silva',
      inspection_date: '2024-01-20'
    }
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('✅ Response criada:', responseData.data);
}

main();
```

#### **Usando Python**

```python
# Instalar: pip install requests

import requests

API_KEY = 'sua_api_key'
API_SECRET = 'seu_api_secret'
BASE_URL = 'https://api.formflow.com.br/v1'

# 1. Autenticar
auth_response = requests.post(f'{BASE_URL}/auth/token', json={
    'api_key': API_KEY,
    'api_secret': API_SECRET
})

token = auth_response.json()['access_token']
print('✅ Autenticado!')

# 2. Listar Templates
templates_response = requests.get(
    f'{BASE_URL}/templates',
    headers={'Authorization': f'Bearer {token}'}
)

print('📋 Templates:', templates_response.json())

# 3. Criar Response
response_data = requests.post(
    f'{BASE_URL}/responses',
    json={
        'template_id': 'uuid-do-template',
        'status': 'submitted',
        'response_data': {
            'inspector_name': 'João Silva',
            'inspection_date': '2024-01-20'
        }
    },
    headers={'Authorization': f'Bearer {token}'}
)

print('✅ Response criada:', response_data.json())
```

### **3. Configurar Webhooks**

1. **Acesse Configurações → Webhooks**

2. **Adicione Novo Webhook**
   - URL: `https://seu-sistema.com/webhook`
   - Eventos: Selecione os eventos desejados
   - Secret: Gere um secret para validação

3. **Receba Notificações**
   - Quando um evento ocorrer, você receberá um POST

4. **Valide Webhook**
```javascript
const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-formflow-signature'];
  const payload = JSON.stringify(req.body);
  
  const hash = crypto
    .createHmac('sha256', 'seu_secret')
    .update(payload)
    .digest('hex');
  
  if (hash === signature) {
    console.log('✅ Webhook válido!');
    console.log('Evento:', req.body.event);
    console.log('Dados:', req.body.data);
    res.status(200).send('OK');
  } else {
    console.log('❌ Webhook inválido!');
    res.status(401).send('Unauthorized');
  }
});
```

---

## 🎓 Próximos Passos

### **Aprenda Mais**

1. **Documentação Completa**
   - https://docs.formflow.com.br

2. **Tutoriais em Vídeo**
   - https://youtube.com/formflow

3. **Casos de Uso**
   - https://formflow.com.br/casos-de-uso

4. **Blog**
   - https://blog.formflow.com.br

### **Recursos Avançados**

1. **Campos Condicionais**
   - Mostre/oculte campos baseado em respostas

2. **Cálculos Automáticos**
   - Calcule valores automaticamente

3. **Validações Customizadas**
   - Crie regras de validação complexas

4. **Assinatura Digital**
   - Colete assinaturas eletrônicas

5. **Geolocalização**
   - Capture localização automaticamente

6. **Fotos e Anexos**
   - Adicione fotos e arquivos

### **Comunidade**

1. **Discord**
   - https://discord.gg/formflow
   - Tire dúvidas em tempo real

2. **Fórum**
   - https://forum.formflow.com.br
   - Compartilhe experiências

3. **GitHub**
   - https://github.com/formflow
   - Exemplos de código

### **Suporte**

1. **Chat ao Vivo**
   - Disponível no canto inferior direito

2. **E-mail**
   - suporte@formflow.com.br
   - Resposta em até 24h

3. **WhatsApp**
   - (11) 99999-9999
   - Horário comercial

4. **Agendar Reunião**
   - https://calendly.com/formflow
   - Suporte personalizado

---

## ✅ Checklist de Sucesso

### **Configuração Inicial**
- [ ] Conta criada e e-mail confirmado
- [ ] Empresa cadastrada
- [ ] Contrato criado
- [ ] Primeiro template criado

### **Coleta de Dados**
- [ ] Primeiro formulário preenchido
- [ ] Link compartilhado com equipe
- [ ] Múltiplas respostas coletadas

### **Relatórios**
- [ ] Dados visualizados em tabela
- [ ] Filtros aplicados
- [ ] Dados exportados

### **Integração**
- [ ] API Key gerada
- [ ] Primeira chamada API bem-sucedida
- [ ] Webhook configurado (opcional)

---

## 🎉 Parabéns!

Você completou o guia de início rápido do FormFlow!

Agora você está pronto para:
- ✅ Digitalizar todos os seus formulários
- ✅ Coletar dados de forma organizada
- ✅ Gerar relatórios instantâneos
- ✅ Integrar com seus sistemas

**Precisa de ajuda?**
Nossa equipe está sempre disponível para te ajudar a ter sucesso!

---

## 📚 Recursos Adicionais

### **Templates Prontos**
- Baixe templates prontos para seu setor
- https://formflow.com.br/templates

### **Calculadora de ROI**
- Calcule quanto você vai economizar
- https://formflow.com.br/roi

### **Webinars**
- Participe de webinars ao vivo
- https://formflow.com.br/webinars

### **Certificação**
- Torne-se um especialista certificado
- https://formflow.com.br/certificacao

---

*Guia de Início Rápido v1.0 - Atualizado em 2024*
