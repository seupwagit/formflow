# 📡 API Documentation - FormFlow

## 🎯 Visão Geral

A API REST do FormFlow permite integração completa com sistemas externos, automação de processos e sincronização bidirecional de dados.

**Base URL:** `https://api.formflow.com.br/v1`

**Autenticação:** Bearer Token (JWT)

**Formato:** JSON

**Rate Limit:** 1000 requisições/hora

---

## 🔐 Autenticação

### **Obter Token**

```http
POST /auth/token
Content-Type: application/json

{
  "api_key": "seu_api_key_aqui",
  "api_secret": "seu_api_secret_aqui"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### **Usar Token**

```http
GET /templates
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Endpoints

### **Templates**

#### **Listar Templates**
```http
GET /templates
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int): Número da página (padrão: 1)
- `limit` (int): Itens por página (padrão: 20, máx: 100)
- `contract_id` (uuid): Filtrar por contrato
- `is_active` (boolean): Filtrar por status

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Inspeção de Obra",
      "description": "Template para inspeções",
      "contract_id": "uuid",
      "is_active": true,
      "fields_count": 25,
      "responses_count": 150,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T15:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### **Obter Template**
```http
GET /templates/{template_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Inspeção de Obra",
  "description": "Template para inspeções",
  "contract_id": "uuid",
  "is_active": true,
  "fields": [
    {
      "id": "field_1",
      "name": "inspector_name",
      "type": "text",
      "label": "Nome do Inspetor",
      "required": true,
      "validation": {
        "min_length": 3,
        "max_length": 100
      },
      "position": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 30,
        "page": 0
      }
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T15:45:00Z"
}
```

#### **Criar Template**
```http
POST /templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Novo Template",
  "description": "Descrição do template",
  "contract_id": "uuid",
  "fields": [...]
}
```

#### **Atualizar Template**
```http
PUT /templates/{template_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Template Atualizado",
  "is_active": true
}
```

#### **Deletar Template**
```http
DELETE /templates/{template_id}
Authorization: Bearer {token}
```

---

### **Responses (Documentos Coletados)**

#### **Listar Responses**
```http
GET /responses
Authorization: Bearer {token}
```

**Query Parameters:**
- `template_id` (uuid): Filtrar por template
- `contract_id` (uuid): Filtrar por contrato
- `status` (string): draft, submitted, reviewed, approved
- `created_after` (datetime): Data mínima
- `created_before` (datetime): Data máxima
- `page` (int): Número da página
- `limit` (int): Itens por página

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "template_id": "uuid",
      "contract_id": "uuid",
      "status": "submitted",
      "response_data": {
        "inspector_name": "João Silva",
        "inspection_date": "2024-01-20",
        "temperature": 25.5
      },
      "metadata": {
        "device": "mobile",
        "location": {
          "lat": -23.5505,
          "lng": -46.6333
        },
        "user_agent": "Mozilla/5.0..."
      },
      "created_at": "2024-01-20T14:30:00Z",
      "updated_at": "2024-01-20T14:35:00Z",
      "submitted_at": "2024-01-20T14:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### **Obter Response**
```http
GET /responses/{response_id}
Authorization: Bearer {token}
```

#### **Criar Response**
```http
POST /responses
Authorization: Bearer {token}
Content-Type: application/json

{
  "template_id": "uuid",
  "status": "draft",
  "response_data": {
    "inspector_name": "João Silva",
    "inspection_date": "2024-01-20"
  }
}
```

#### **Atualizar Response**
```http
PUT /responses/{response_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "submitted",
  "response_data": {
    "inspector_name": "João Silva",
    "inspection_date": "2024-01-20",
    "temperature": 25.5
  }
}
```

#### **Deletar Response**
```http
DELETE /responses/{response_id}
Authorization: Bearer {token}
```

---

### **Contracts**

#### **Listar Contratos**
```http
GET /contracts
Authorization: Bearer {token}
```

#### **Obter Contrato**
```http
GET /contracts/{contract_id}
Authorization: Bearer {token}
```

---

### **Companies**

#### **Listar Empresas**
```http
GET /companies
Authorization: Bearer {token}
```

#### **Obter Empresa**
```http
GET /companies/{company_id}
Authorization: Bearer {token}
```

---

### **Export**

#### **Exportar Responses**
```http
POST /export/responses
Authorization: Bearer {token}
Content-Type: application/json

{
  "template_id": "uuid",
  "format": "csv",
  "filters": {
    "status": "submitted",
    "created_after": "2024-01-01"
  }
}
```

**Response:**
```json
{
  "export_id": "uuid",
  "status": "processing",
  "download_url": null,
  "expires_at": null
}
```

#### **Status da Exportação**
```http
GET /export/{export_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "export_id": "uuid",
  "status": "completed",
  "download_url": "https://api.formflow.com.br/downloads/export_123.csv",
  "expires_at": "2024-01-21T14:30:00Z"
}
```

---

## 🔔 Webhooks

### **Configurar Webhook**

```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://seu-sistema.com/webhook",
  "events": ["response.created", "response.updated", "response.submitted"],
  "secret": "seu_secret_para_validacao"
}
```

### **Eventos Disponíveis**

- `response.created` - Nova response criada
- `response.updated` - Response atualizada
- `response.submitted` - Response enviada
- `response.deleted` - Response deletada
- `template.created` - Novo template criado
- `template.updated` - Template atualizado
- `template.deleted` - Template deletado

### **Payload do Webhook**

```json
{
  "event": "response.submitted",
  "timestamp": "2024-01-20T14:35:00Z",
  "data": {
    "id": "uuid",
    "template_id": "uuid",
    "contract_id": "uuid",
    "status": "submitted",
    "response_data": {...},
    "submitted_at": "2024-01-20T14:35:00Z"
  }
}
```

### **Validar Webhook**

```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

// No header da requisição:
// X-FormFlow-Signature: {hash}
```

---

## 📊 Exemplos de Integração

### **Node.js**

```javascript
const axios = require('axios');

class FormFlowAPI {
  constructor(apiKey, apiSecret) {
    this.baseURL = 'https://api.formflow.com.br/v1';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.token = null;
  }

  async authenticate() {
    const response = await axios.post(`${this.baseURL}/auth/token`, {
      api_key: this.apiKey,
      api_secret: this.apiSecret
    });
    this.token = response.data.access_token;
  }

  async getTemplates() {
    if (!this.token) await this.authenticate();
    
    const response = await axios.get(`${this.baseURL}/templates`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.data;
  }

  async createResponse(templateId, data) {
    if (!this.token) await this.authenticate();
    
    const response = await axios.post(`${this.baseURL}/responses`, {
      template_id: templateId,
      status: 'draft',
      response_data: data
    }, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.data;
  }
}

// Uso
const api = new FormFlowAPI('seu_api_key', 'seu_api_secret');

// Listar templates
const templates = await api.getTemplates();
console.log(templates);

// Criar response
const response = await api.createResponse('template_uuid', {
  inspector_name: 'João Silva',
  inspection_date: '2024-01-20'
});
console.log(response);
```

### **Python**

```python
import requests
import json

class FormFlowAPI:
    def __init__(self, api_key, api_secret):
        self.base_url = 'https://api.formflow.com.br/v1'
        self.api_key = api_key
        self.api_secret = api_secret
        self.token = None
    
    def authenticate(self):
        response = requests.post(
            f'{self.base_url}/auth/token',
            json={
                'api_key': self.api_key,
                'api_secret': self.api_secret
            }
        )
        self.token = response.json()['access_token']
    
    def get_templates(self):
        if not self.token:
            self.authenticate()
        
        response = requests.get(
            f'{self.base_url}/templates',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        return response.json()
    
    def create_response(self, template_id, data):
        if not self.token:
            self.authenticate()
        
        response = requests.post(
            f'{self.base_url}/responses',
            json={
                'template_id': template_id,
                'status': 'draft',
                'response_data': data
            },
            headers={'Authorization': f'Bearer {self.token}'}
        )
        return response.json()

# Uso
api = FormFlowAPI('seu_api_key', 'seu_api_secret')

# Listar templates
templates = api.get_templates()
print(templates)

# Criar response
response = api.create_response('template_uuid', {
    'inspector_name': 'João Silva',
    'inspection_date': '2024-01-20'
})
print(response)
```

### **PHP**

```php
<?php

class FormFlowAPI {
    private $baseURL = 'https://api.formflow.com.br/v1';
    private $apiKey;
    private $apiSecret;
    private $token;
    
    public function __construct($apiKey, $apiSecret) {
        $this->apiKey = $apiKey;
        $this->apiSecret = $apiSecret;
    }
    
    public function authenticate() {
        $ch = curl_init($this->baseURL . '/auth/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'api_key' => $this->apiKey,
            'api_secret' => $this->apiSecret
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode($response, true);
        $this->token = $data['access_token'];
    }
    
    public function getTemplates() {
        if (!$this->token) {
            $this->authenticate();
        }
        
        $ch = curl_init($this->baseURL . '/templates');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->token
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}

// Uso
$api = new FormFlowAPI('seu_api_key', 'seu_api_secret');
$templates = $api->getTemplates();
print_r($templates);
?>
```

---

## 🔒 Segurança

### **Boas Práticas**

1. **Nunca exponha suas credenciais**
   - Use variáveis de ambiente
   - Não commite no Git

2. **Valide webhooks**
   - Sempre verifique a assinatura
   - Use HTTPS

3. **Rate Limiting**
   - Implemente retry com backoff exponencial
   - Cache quando possível

4. **Tokens**
   - Renove tokens antes de expirar
   - Armazene de forma segura

---

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

### **Formato de Erro**

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "O campo 'template_id' é obrigatório",
    "details": {
      "field": "template_id",
      "reason": "required"
    }
  }
}
```

---

## 📚 SDKs Oficiais

### **JavaScript/TypeScript**
```bash
npm install @formflow/sdk
```

### **Python**
```bash
pip install formflow-sdk
```

### **PHP**
```bash
composer require formflow/sdk
```

### **Ruby**
```bash
gem install formflow
```

---

## 🆘 Suporte

- **Documentação:** https://docs.formflow.com.br
- **Status da API:** https://status.formflow.com.br
- **Suporte:** api@formflow.com.br
- **Discord:** https://discord.gg/formflow

---

*API Documentation v1.0 - Atualizado em 2024*
