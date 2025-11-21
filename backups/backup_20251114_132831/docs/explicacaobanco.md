# 📊 ESTRUTURA DO BANCO DE DADOS - SISTEMA FORMFLOW

## 🎯 **VISÃO GERAL**

O sistema FormFlow utiliza um banco de dados PostgreSQL com **7 tabelas principais** organizadas de forma hierárquica para gerenciar templates de formulários, respostas dos usuários e processamento de arquivos.

---

## 📋 **TABELAS UTILIZADAS ATIVAMENTE**

### 1. **`form_templates`** - TABELA PRINCIPAL
**Função**: Armazena os modelos/templates de formulários criados no designer

**Estrutura**:
```sql
- id (UUID) - Chave primária
- name (VARCHAR) - Nome do template
- description (TEXT) - Descrição opcional
- pdf_url (TEXT) - URL do PDF de fundo
- pdf_pages (INTEGER) - Número de páginas do PDF
- fields (JSONB) - Configuração completa dos campos
- table_name (VARCHAR) - Nome da tabela dinâmica (não usado)
- version (INTEGER) - Versão do template
- is_active (BOOLEAN) - Se está ativo
- created_at/updated_at - Timestamps
- created_by (UUID) - Referência ao usuário
```

**Onde é usada**:
- ✅ **Tela Designer** (`/designer`) - Criar/editar templates
- ✅ **Tela Templates** (`/templates`) - Listar templates
- ✅ **Tela Preenchimento** (`/fill-form`) - Carregar template para preenchimento
- ✅ **Tela Relatórios** (`/reports`) - Selecionar template para relatórios

**Campo Crítico**: `fields (JSONB)` - Contém TODA a configuração dos campos:
- Posição (x, y, width, height, page)
- Tipo (text, number, calculated, etc.)
- Propriedades (label, placeholder, required)
- Alinhamento (horizontal, vertical)
- Estilo de fonte (family, size, weight, color)
- Configuração de cálculo (formula, formatType, etc.)

---

### 2. **`form_responses`** - RESPOSTAS DOS FORMULÁRIOS
**Função**: Armazena as respostas/dados preenchidos pelos usuários

**Estrutura**:
```sql
- id (UUID) - Chave primária
- template_id (UUID) - FK para form_templates
- response_data (JSONB) - Dados preenchidos pelo usuário
- status (VARCHAR) - draft, submitted, reviewed, approved
- created_at/updated_at - Timestamps
- submitted_at - Data de submissão
- created_by (UUID) - Usuário que preencheu
```

**Onde é usada**:
- ✅ **Tela Preenchimento** (`/fill-form`) - Salvar/carregar respostas
- ✅ **Tela Relatórios** (`/reports`) - Listar e analisar respostas
- ✅ **Tela Visualização** (`/responses/[id]`) - Ver resposta específica
- ✅ **Gerador de PDF** - Dados para relatórios

**Campo Crítico**: `response_data (JSONB)` - Contém os valores preenchidos:
```json
{
  "nome": "João Silva",
  "idade": 30,
  "salario": 5000,
  "total_calculado": 5500
}
```

---

### 3. **`file_uploads`** - UPLOADS DE ARQUIVOS
**Função**: Gerencia uploads de PDFs e processamento OCR

**Estrutura**:
```sql
- id (UUID) - Chave primária
- filename (VARCHAR) - Nome do arquivo no servidor
- original_filename (VARCHAR) - Nome original do arquivo
- file_path (TEXT) - Caminho no sistema de arquivos
- file_size (BIGINT) - Tamanho em bytes
- mime_type (VARCHAR) - Tipo MIME
- processing_status (VARCHAR) - pending, processing, completed, failed
- ocr_results (JSONB) - Resultados do OCR (não usado)
- detected_fields (JSONB) - Campos detectados (não usado)
- created_at - Timestamp
- created_by (UUID) - Usuário que fez upload
```

**Onde é usada**:
- ✅ **Tela Designer** (`/designer`) - Upload de PDFs de fundo
- ✅ **Sistema de Upload** - Gerenciar arquivos enviados

**Status**: Parcialmente utilizada - OCR não implementado

---

### 4. **`template_background_versions`** - VERSIONAMENTO DE IMAGENS
**Função**: Controla versões de imagens de fundo para consistência de relatórios

**Estrutura**:
```sql
- id (UUID) - Chave primária
- template_id (UUID) - FK para form_templates
- response_id (UUID) - FK para form_responses
- background_images (TEXT[]) - Array de URLs das imagens
- version_hash (VARCHAR) - Hash para identificar versão
- created_at - Timestamp
```

**Onde é usada**:
- ✅ **Gerador de PDF** - Garantir que relatórios usem a imagem correta
- ✅ **Sistema de Versionamento** - Manter consistência visual

**Função Crítica**: Evita que mudanças no template afetem relatórios já gerados

---

## 📋 **TABELAS NÃO UTILIZADAS ATIVAMENTE**

### 5. **`form_instances`** - ❌ NÃO USADA
**Função Original**: Era para ser uma versão alternativa de form_responses
**Status**: Substituída por `form_responses`
**Motivo**: Redundante - mesma funcionalidade que form_responses

### 6. **`inspection_solda`** - ❌ NÃO USADA
**Função Original**: Tabela específica para inspeções de solda
**Status**: Não implementada
**Motivo**: Sistema evoluiu para ser genérico, não específico para solda

### 7. **`pdf_processing_log`** - ❌ NÃO USADA
**Função Original**: Log de processamento de PDFs
**Status**: Não implementada
**Motivo**: Logs são feitos via console/aplicação

---

## 🔗 **RELACIONAMENTOS ENTRE TABELAS**

### **Relacionamento Principal**:
```
form_templates (1) ←→ (N) form_responses
    ↓
template_background_versions (N)
```

### **Fluxo de Dados**:
1. **Designer cria template** → `form_templates`
2. **Usuário preenche formulário** → `form_responses`
3. **Sistema gera PDF** → `template_background_versions` (versionamento)
4. **Upload de arquivos** → `file_uploads` (independente)

---

## 🖥️ **MAPEAMENTO TELA → TABELA**

### **`/designer` - Designer de Formulários**
- **Lê**: `form_templates` (carregar template existente)
- **Escreve**: `form_templates` (salvar/atualizar template)
- **Usa**: `file_uploads` (upload de PDF de fundo)

### **`/templates` - Lista de Templates**
- **Lê**: `form_templates` (listar todos os templates)
- **Lê**: `form_responses` (contar respostas por template)

### **`/fill-form` - Preenchimento de Formulário**
- **Lê**: `form_templates` (carregar estrutura do formulário)
- **Lê/Escreve**: `form_responses` (salvar/carregar respostas)

### **`/reports` - Relatórios e Análises**
- **Lê**: `form_templates` (selecionar template)
- **Lê**: `form_responses` (dados para análise)
- **Usa**: `template_background_versions` (gerar PDFs consistentes)

### **`/responses/[id]` - Visualização de Resposta**
- **Lê**: `form_responses` (dados da resposta)
- **Lê**: `form_templates` (estrutura para exibição)

---

## 💾 **CAMPOS JSONB CRÍTICOS**

### **`form_templates.fields`** - Configuração Completa dos Campos
```json
[
  {
    "id": "campo1",
    "name": "nome",
    "type": "text",
    "label": "Nome Completo",
    "position": { "x": 100, "y": 150, "width": 200, "height": 35, "page": 0 },
    "alignment": { "horizontal": "left", "vertical": "middle" },
    "fontStyle": {
      "family": "Arial",
      "size": 12,
      "weight": "normal",
      "color": "#000000"
    },
    "calculatedConfig": {
      "formula": "{salario} * 1.1",
      "formatType": "currency",
      "decimalPlaces": 2
    }
  }
]
```

### **`form_responses.response_data`** - Dados Preenchidos
```json
{
  "nome": "João Silva",
  "idade": 30,
  "salario": 5000,
  "total_com_bonus": 5500
}
```

---

## 🔧 **FUNÇÕES E TRIGGERS**

### **Funções Utilitárias**:
- `execute_sql()` - Execução de SQL dinâmico (não usada)
- `update_updated_at_column()` - Atualiza timestamp automaticamente

### **Triggers Ativos**:
- `update_form_templates_updated_at` - Atualiza `updated_at` em form_templates
- `update_form_instances_updated_at` - Atualiza `updated_at` em form_instances

---

## 📈 **ÍNDICES PARA PERFORMANCE**

### **Índices Críticos**:
- `idx_form_templates_is_active` - Filtrar templates ativos
- `idx_form_instances_template_id` - Relacionamento template→responses
- `idx_form_instances_status` - Filtrar por status de resposta

### **Índices de Auditoria**:
- `idx_form_templates_created_by` - Filtrar por usuário criador
- `idx_form_templates_created_at` - Ordenação por data

---

## 🎯 **RESUMO DE USO**

### **✅ TABELAS ATIVAS (4)**:
1. **`form_templates`** - Templates de formulários (PRINCIPAL)
2. **`form_responses`** - Respostas dos usuários (PRINCIPAL)
3. **`file_uploads`** - Uploads de arquivos (SUPORTE)
4. **`template_background_versions`** - Versionamento (SUPORTE)

### **❌ TABELAS INATIVAS (3)**:
1. **`form_instances`** - Redundante
2. **`inspection_solda`** - Não implementada
3. **`pdf_processing_log`** - Não implementada

### **🔥 CAMPOS MAIS IMPORTANTES**:
- `form_templates.fields` - Toda configuração dos campos
- `form_responses.response_data` - Dados preenchidos pelos usuários
- `template_background_versions.background_images` - Versionamento de PDFs

---

## 🚀 **FLUXO COMPLETO DO SISTEMA**

1. **Designer** cria template → `form_templates.fields` (JSONB)
2. **Usuário** preenche formulário → `form_responses.response_data` (JSONB)
3. **Sistema** gera PDF → `template_background_versions` (versionamento)
4. **Relatórios** analisam dados → Consultas em `form_responses`

**O sistema é centrado em 2 tabelas principais com dados JSONB flexíveis!**