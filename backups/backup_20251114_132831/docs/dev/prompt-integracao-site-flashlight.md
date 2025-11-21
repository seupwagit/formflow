# 🤖 Prompt para IA - Integração FormFlow no Site Flashlight

## 📋 CONTEXTO

Você é um especialista em desenvolvimento web e copywriting que vai integrar o **FormFlow** ao site da **Flashlight**, empresa de tecnologia que desenvolve soluções da família **Flow**.

## ⚠️ REGRA FUNDAMENTAL DE DESIGN

**O SITE FLASHLIGHT JÁ POSSUI UM DESIGN SYSTEM COMPLETO E ESTABELECIDO.**

Sua missão é:
1. 🔍 **ANALISAR** todos os padrões de design existentes no site
2. 🎯 **REPLICAR** exatamente esses padrões para o FormFlow
3. 🚫 **NÃO CRIAR** novos estilos, cores ou componentes
4. ✅ **GARANTIR** que o FormFlow pareça nativo do site

**O FormFlow deve se integrar perfeitamente, como se sempre tivesse feito parte da família Flow.**

---

## 🎯 OBJETIVO

Adicionar o FormFlow como um novo produto da família Flow no site da Flashlight, mantendo consistência visual, arquitetura de informação e identidade da marca.

---

## 📦 INFORMAÇÕES DO PRODUTO

### **Nome:** FormFlow
### **Tagline:** "Transforme PDFs em Formulários Digitais Inteligentes"
### **Categoria:** Coleta de Dados e Digitalização de Formulários
### **Família:** Produtos Flow (Flashlight)

### **Descrição Curta (1 linha):**
Digitalize formulários em papel com IA, centralize dados e gere relatórios em tempo real.

### **Descrição Média (2-3 linhas):**
FormFlow transforma seus formulários em papel (PDFs) em formulários digitais interativos em minutos usando IA. Centralize toda a coleta de dados da sua empresa, elimine planilhas desorganizadas e gere relatórios instantâneos com rastreabilidade completa.

### **Descrição Longa (Parágrafo):**
FormFlow é a solução definitiva para empresas que precisam digitalizar processos de coleta de dados. Com inteligência artificial, a plataforma detecta automaticamente campos em PDFs e cria formulários digitais funcionais em minutos. Elimine planilhas Excel espalhadas, dados duplicados e horas de trabalho manual. Colete dados offline em qualquer dispositivo, centralize tudo em um banco de dados seguro e gere relatórios avançados em tempo real. Ideal para inspeções, auditorias, checklists, prontuários e qualquer processo que envolva coleta de dados estruturados.

---

## 🎨 DESIGN E IDENTIDADE VISUAL

**IMPORTANTE:** O site Flashlight já possui um design system completo e estabelecido. 

**INSTRUÇÃO PARA IA:**
- ✅ Analise e siga TODOS os padrões de design já existentes no site Flashlight
- ✅ Use as mesmas cores, tipografia, espaçamentos e componentes dos outros produtos Flow
- ✅ Mantenha consistência visual total com o restante do site
- ✅ Adapte apenas o conteúdo específico do FormFlow, não o design
- ✅ O FormFlow deve parecer nativo do site, não um elemento externo

**Ícone Sugerido:** 📋 Formulário com efeito de transformação digital (adapte ao estilo visual do site)

---

## 📐 ESTRUTURA DO SITE

### **1. HOMEPAGE - Seção "Produtos Flow"**

Adicione um card do FormFlow junto aos outros produtos da família Flow:

```html
<section class="produtos-flow">
  <h2>Família Flow - Soluções Integradas</h2>
  <p>Produtos que trabalham juntos para transformar sua operação</p>
  
  <div class="produtos-grid">
    <!-- Produtos existentes aqui -->
    
    <!-- NOVO: FormFlow -->
    <div class="produto-card formflow">
      <div class="produto-icon">
        <svg><!-- Ícone de formulário digital --></svg>
      </div>
      <h3>FormFlow</h3>
      <p class="tagline">Formulários Digitais Inteligentes</p>
      <p class="descricao">
        Transforme PDFs em formulários digitais com IA. 
        Centralize dados e elimine planilhas desorganizadas.
      </p>
      <ul class="features-list">
        <li>✓ Digitalização automática com IA</li>
        <li>✓ Coleta offline em qualquer dispositivo</li>
        <li>✓ Relatórios em tempo real</li>
        <li>✓ Dados centralizados e seguros</li>
      </ul>
      <div class="cta-buttons">
        <a href="/formflow" class="btn-primary">Conhecer FormFlow</a>
        <a href="/formflow/demo" class="btn-secondary">Ver Demo</a>
      </div>
    </div>
  </div>
</section>
```

---

### **2. PÁGINA DEDICADA - /formflow**

Crie uma landing page completa para o FormFlow:

#### **Hero Section:**
```
[HERO]
Título: "Pare de Perder Tempo com Planilhas Desorganizadas"
Subtítulo: "Transforme formulários em papel em digitais com IA em 10 minutos"
CTA Principal: "Começar Teste Grátis - 30 Dias"
CTA Secundário: "Ver Demonstração"
Imagem/Vídeo: Demo do produto em ação
```

#### **Problema (Pain Points):**
```
[SEÇÃO: Sua empresa ainda sofre com...]
- ❌ Dezenas de planilhas Excel espalhadas
- ❌ Dados duplicados e desatualizados
- ❌ Horas perdidas digitando manualmente
- ❌ Impossibilidade de rastrear origem dos dados
- ❌ Relatórios que levam dias para compilar
```

#### **Solução (Como Funciona):**
```
[SEÇÃO: Como o FormFlow Funciona]
1. 📄 Carregue seu PDF
   "Faça upload do formulário em papel"
   
2. 🤖 IA Detecta Campos
   "Reconhecimento automático de todos os campos"
   
3. ✏️ Ajuste e Publique
   "Personalize e compartilhe em minutos"
   
4. 📊 Colete e Analise
   "Dados centralizados e relatórios instantâneos"
```

#### **Funcionalidades Principais:**
```
[SEÇÃO: Funcionalidades]

🤖 Digitalização Automática com IA
- Reconhecimento inteligente de campos
- Detecção de tipos: texto, número, data, checkbox
- 95% de precisão na detecção

📱 Coleta de Dados Moderna
- Funciona offline em qualquer dispositivo
- Interface intuitiva e responsiva
- Validação em tempo real

📊 Relatórios Avançados
- Visualizações: tabela, cards, gráficos, árvore
- Filtros avançados e busca global
- Exportação para Excel/CSV

🏢 Hierarquia Organizacional
- Empresa → Contrato → Template → Documentos
- Controle de acesso por perfil
- Rastreabilidade completa

🔐 Segurança e Compliance
- Criptografia AES-256
- Compliance com LGPD
- Backup automático diário
- Auditoria completa

🔄 Integrações
- API REST completa
- Webhooks para automação
- Sincronização bidirecional
```

#### **Casos de Uso:**
```
[SEÇÃO: Quem Usa o FormFlow]

🏗️ Construção Civil
- Inspeções de obra
- Checklists de segurança
- Relatórios de medição

🏭 Indústria
- Ordens de serviço
- Controle de qualidade
- Inspeções de equipamentos

🏥 Saúde
- Prontuários digitais
- Anamneses
- Consentimentos

🏢 Facilities
- Inspeções prediais
- Manutenções preventivas
- Gestão de fornecedores

📋 Auditorias
- Checklists de auditoria
- Avaliações de conformidade
- Documentação de processos
```

#### **ROI e Benefícios:**
```
[SEÇÃO: Resultados Comprovados]

⏱️ Economia de Tempo
- 95% menos tempo criando formulários
- 80% menos tempo preenchendo dados
- 90% menos tempo gerando relatórios

💰 Redução de Custos
- R$ 15.000 economia média anual
- Elimine impressões e armazenamento físico
- Reduza erros e retrabalho em 85%

📈 Aumento de Produtividade
- 3x mais formulários preenchidos por dia
- Decisões 5x mais rápidas
- 100% de rastreabilidade
```

#### **Depoimentos:**
```
[SEÇÃO: O Que Nossos Clientes Dizem]

"Economizamos 20 horas por semana que gastávamos compilando planilhas. 
O FormFlow pagou por si mesmo no primeiro mês!"
— João Silva, Gerente de Operações, Construtora ABC

"Finalmente conseguimos rastrear todas as inspeções em tempo real. 
A produtividade da equipe aumentou 300%!"
— Maria Santos, Coordenadora de Qualidade, Indústria XYZ
```

#### **Preços:**
```
[SEÇÃO: Planos e Preços]

🆓 Starter - GRÁTIS
- 1 empresa
- 3 templates
- 100 documentos/mês
- Suporte por e-mail

💼 Professional - R$ 297/mês
- 5 empresas
- Templates ilimitados
- 1.000 documentos/mês
- Suporte prioritário
- API e integrações

🏢 Enterprise - Sob Consulta
- Empresas ilimitadas
- Documentos ilimitados
- Suporte 24/7
- Customizações
```

#### **CTA Final:**
```
[SEÇÃO: Comece Agora]

Título: "Transforme Sua Coleta de Dados Hoje"
Subtítulo: "Teste grátis por 30 dias - Sem cartão de crédito"

Benefícios do Teste:
✅ Acesso completo ao plano Professional
✅ Migração de dados gratuita
✅ Suporte prioritário
✅ Sem compromisso

[BOTÃO: COMEÇAR TESTE GRÁTIS]
```

---

### **3. MENU DE NAVEGAÇÃO**

Adicione o FormFlow ao menu principal:

```
Produtos ▼
  ├─ [Produto 1]
  ├─ [Produto 2]
  ├─ FormFlow (NOVO)
  └─ Ver Todos os Produtos
```

---

### **4. FOOTER**

Adicione links do FormFlow:

```
Produtos
  ├─ FormFlow
  ├─ FormFlow - Casos de Uso
  ├─ FormFlow - Preços
  └─ FormFlow - Documentação
```

---

### **5. PÁGINA "SOBRE A FLASHLIGHT"**

Adicione o FormFlow à descrição dos produtos:

```
A Flashlight desenvolve soluções da família Flow que transformam 
operações empresariais:

[...produtos existentes...]

• FormFlow: Digitalize formulários em papel com IA, centralize 
  dados e elimine planilhas desorganizadas. Ideal para inspeções, 
  auditorias e coleta de dados estruturados.
```

---

## 🔗 INTEGRAÇÃO COM OUTROS PRODUTOS FLOW

### **Cross-Selling:**

Na página de cada produto Flow, adicione uma seção:

```
[SEÇÃO: Funciona Melhor Junto]

"O FormFlow integra perfeitamente com [Produto X] para..."

Exemplo:
"Use FormFlow para coletar dados de inspeção e [Produto X] 
para gerenciar o workflow de aprovação."

[BOTÃO: Ver Integrações]
```

---

## 📱 RESPONSIVIDADE E INTERATIVIDADE

**INSTRUÇÃO PARA IA:**
- ✅ Use os mesmos breakpoints e comportamentos responsivos do site Flashlight
- ✅ Replique as animações e transições já existentes nos outros produtos Flow
- ✅ Mantenha a mesma biblioteca de animação (se houver GSAP, AOS, Framer Motion, etc.)
- ✅ Siga os padrões de hover, focus e estados interativos do site

---

## 📊 ANALYTICS E TRACKING

### **Eventos para Rastrear:**

```javascript
// Google Analytics / Mixpanel
trackEvent('formflow_page_view');
trackEvent('formflow_cta_click', { location: 'hero' });
trackEvent('formflow_demo_request');
trackEvent('formflow_trial_start');
trackEvent('formflow_pricing_view');
```

---

## 🔍 SEO

### **Meta Tags:**

```html
<title>FormFlow - Formulários Digitais Inteligentes | Flashlight</title>
<meta name="description" content="Transforme PDFs em formulários digitais com IA. Centralize dados, elimine planilhas Excel e gere relatórios em tempo real. Teste grátis 30 dias.">
<meta name="keywords" content="formulários digitais, digitalizar formulários, coleta de dados, planilhas excel, inspeção digital, checklist digital">

<!-- Open Graph -->
<meta property="og:title" content="FormFlow - Formulários Digitais Inteligentes">
<meta property="og:description" content="Digitalize formulários em 10 minutos com IA. Economize 95% do tempo e R$ 15.000/ano.">
<meta property="og:image" content="/images/formflow-og.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="FormFlow - Formulários Digitais Inteligentes">
```

### **Schema Markup:**

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "FormFlow",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "297",
    "priceCurrency": "BRL"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "500"
  }
}
```

---

## 🎨 ASSETS NECESSÁRIOS

### **Imagens:**
- [ ] Logo FormFlow (SVG, PNG)
- [ ] Ícone FormFlow (múltiplos tamanhos)
- [ ] Screenshots da plataforma (6-8 imagens)
- [ ] Mockups em dispositivos (mobile, tablet, desktop)
- [ ] Ilustrações de casos de uso
- [ ] Fotos de equipes usando o produto

### **Vídeos:**
- [ ] Demo de 30 segundos (hero)
- [ ] Tutorial completo de 2 minutos
- [ ] Depoimentos de clientes
- [ ] Comparativo antes/depois

### **Documentos:**
- [ ] Datasheet em PDF
- [ ] Guia de início rápido
- [ ] Documentação da API
- [ ] Casos de sucesso detalhados

---

## 🚀 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Estrutura (Semana 1)**
- [ ] Criar página /formflow
- [ ] Adicionar ao menu de navegação
- [ ] Adicionar card na homepage
- [ ] Configurar rotas e URLs

### **Fase 2: Conteúdo (Semana 2)**
- [ ] Escrever todos os textos
- [ ] Criar/otimizar imagens
- [ ] Produzir vídeos
- [ ] Revisar SEO

### **Fase 3: Funcionalidades (Semana 3)**
- [ ] Implementar formulário de teste grátis
- [ ] Integrar sistema de agendamento de demo
- [ ] Configurar analytics
- [ ] Testar responsividade

### **Fase 4: Lançamento (Semana 4)**
- [ ] Testes finais
- [ ] Deploy em produção
- [ ] Anunciar nas redes sociais
- [ ] Enviar e-mail para base de clientes

---

## 💡 PROMPT FINAL PARA IA

```
Você é um desenvolvedor web especialista que vai integrar o FormFlow 
ao site da Flashlight. 

TAREFA:
1. **ANALISE PROFUNDAMENTE** a estrutura atual do site da Flashlight
2. **IDENTIFIQUE E REPLIQUE** todos os padrões de design dos outros produtos Flow:
   - Classes CSS utilizadas
   - Estrutura HTML dos cards de produtos
   - Espaçamentos e grid system
   - Cores e tipografia
   - Animações e transições
   - Componentes reutilizáveis (botões, badges, cards, etc.)
   
3. **MANTENHA 100% DE CONSISTÊNCIA** visual:
   - Use EXATAMENTE as mesmas classes CSS
   - Siga EXATAMENTE a mesma estrutura HTML
   - Replique EXATAMENTE os mesmos estilos
   - O FormFlow deve ser INDISTINGUÍVEL dos outros produtos Flow em termos de design

4. Gere os seguintes arquivos:
   - /pages/formflow/index.html (landing page completa)
   - /components/formflow-card.html (card para homepage)
   - /styles/formflow.css (estilos específicos)
   - /scripts/formflow.js (interatividade)

5. Inclua:
   - Hero section impactante
   - Seção de problemas/soluções
   - Funcionalidades com ícones
   - Casos de uso por setor
   - Depoimentos de clientes
   - Tabela de preços
   - CTAs estratégicos
   - Formulário de teste grátis
   - Footer com links relevantes

6. Otimize para:
   - SEO (meta tags, schema markup)
   - Performance (lazy loading, minificação)
   - Conversão (CTAs claros, redução de fricção)
   - Mobile-first

REGRAS CRÍTICAS DE DESIGN:
❌ NÃO crie novos estilos CSS do zero
❌ NÃO invente novas cores ou tipografia
❌ NÃO crie novos componentes se já existirem similares
❌ NÃO use bibliotecas diferentes das já utilizadas no site

✅ SEMPRE analise o código existente primeiro
✅ SEMPRE reutilize classes e componentes existentes
✅ SEMPRE mantenha a mesma estrutura visual
✅ SEMPRE teste a consistência visual com outros produtos

REFERÊNCIAS DE CONTEÚDO:
- Use as informações deste documento para CONTEÚDO (textos, mensagens, benefícios)
- Mantenha tom de voz: profissional, confiável, inovador
- Foco em benefícios quantificáveis (95% economia, R$ 15.000/ano)
- Destaque: IA, offline, hierarquia organizacional, segurança

ENTREGUE:
Código completo que se integra perfeitamente ao site existente, 
como se sempre tivesse feito parte dele.
```

---

*Documento criado para garantir integração perfeita do FormFlow ao ecossistema Flashlight*
