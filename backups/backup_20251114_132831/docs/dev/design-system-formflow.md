# 🎨 Design System - FormFlow

## 🎯 Identidade Visual Completa

### **Paleta de Cores**

#### **Cores Primárias**
```css
--formflow-primary: #6366F1;        /* Indigo - Cor principal */
--formflow-primary-dark: #4F46E5;   /* Indigo escuro - Hover */
--formflow-primary-light: #818CF8;  /* Indigo claro - Backgrounds */
--formflow-primary-50: #EEF2FF;     /* Indigo muito claro */
```

#### **Cores Secundárias**
```css
--formflow-secondary: #8B5CF6;      /* Roxo - Gradientes */
--formflow-secondary-dark: #7C3AED; /* Roxo escuro */
--formflow-secondary-light: #A78BFA;/* Roxo claro */
```

#### **Cores de Accent**
```css
--formflow-accent: #EC4899;         /* Rosa - CTAs especiais */
--formflow-accent-dark: #DB2777;    /* Rosa escuro */
--formflow-accent-light: #F472B6;   /* Rosa claro */
```

#### **Cores de Status**
```css
--formflow-success: #10B981;        /* Verde - Sucesso */
--formflow-warning: #F59E0B;        /* Amarelo - Aviso */
--formflow-error: #EF4444;          /* Vermelho - Erro */
--formflow-info: #3B82F6;           /* Azul - Informação */
```

#### **Cores Neutras**
```css
--formflow-dark: #1F2937;           /* Texto principal */
--formflow-gray-900: #111827;       /* Títulos */
--formflow-gray-700: #374151;       /* Texto secundário */
--formflow-gray-500: #6B7280;       /* Texto terciário */
--formflow-gray-300: #D1D5DB;       /* Bordas */
--formflow-gray-100: #F3F4F6;       /* Backgrounds */
--formflow-gray-50: #F9FAFB;        /* Backgrounds claros */
--formflow-white: #FFFFFF;          /* Branco */
```

#### **Gradientes**
```css
/* Gradiente Principal */
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);

/* Gradiente Accent */
background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%);

/* Gradiente Suave */
background: linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 100%);

/* Gradiente Overlay */
background: linear-gradient(180deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
```

---

## 📝 Tipografia

### **Fontes**
```css
/* Fonte Principal */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Fonte Alternativa (Títulos) */
font-family: 'Poppins', 'Inter', sans-serif;

/* Fonte Monospace (Código) */
font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
```

### **Escala Tipográfica**
```css
/* Display - Hero Titles */
--font-size-display: 4rem;      /* 64px */
--line-height-display: 1.1;
--font-weight-display: 800;

/* H1 - Page Titles */
--font-size-h1: 3rem;           /* 48px */
--line-height-h1: 1.2;
--font-weight-h1: 700;

/* H2 - Section Titles */
--font-size-h2: 2.5rem;         /* 40px */
--line-height-h2: 1.2;
--font-weight-h2: 700;

/* H3 - Subsection Titles */
--font-size-h3: 2rem;           /* 32px */
--line-height-h3: 1.3;
--font-weight-h3: 600;

/* H4 - Card Titles */
--font-size-h4: 1.5rem;         /* 24px */
--line-height-h4: 1.4;
--font-weight-h4: 600;

/* Body Large */
--font-size-body-lg: 1.25rem;   /* 20px */
--line-height-body-lg: 1.6;
--font-weight-body-lg: 400;

/* Body Regular */
--font-size-body: 1rem;         /* 16px */
--line-height-body: 1.6;
--font-weight-body: 400;

/* Body Small */
--font-size-body-sm: 0.875rem;  /* 14px */
--line-height-body-sm: 1.5;
--font-weight-body-sm: 400;

/* Caption */
--font-size-caption: 0.75rem;   /* 12px */
--line-height-caption: 1.4;
--font-weight-caption: 500;
```

### **Responsividade Tipográfica**
```css
/* Mobile */
@media (max-width: 768px) {
  --font-size-display: 2.5rem;  /* 40px */
  --font-size-h1: 2rem;         /* 32px */
  --font-size-h2: 1.75rem;      /* 28px */
  --font-size-h3: 1.5rem;       /* 24px */
}
```

---

## 🔲 Espaçamento

### **Sistema de Espaçamento (8px base)**
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## 🔘 Componentes

### **Botões**

#### **Botão Primary**
```css
.btn-primary {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### **Botão Secondary**
```css
.btn-secondary {
  background: white;
  color: #6366F1;
  padding: 1rem 2.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #6366F1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #6366F1;
  color: white;
}
```

#### **Botão Outline**
```css
.btn-outline {
  background: transparent;
  color: #6366F1;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 2px solid #6366F1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #EEF2FF;
}
```

#### **Botão Ghost**
```css
.btn-ghost {
  background: transparent;
  color: #6366F1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ghost:hover {
  background: #EEF2FF;
}
```

#### **Tamanhos**
```css
/* Large */
.btn-lg {
  padding: 1.25rem 3rem;
  font-size: 1.125rem;
}

/* Medium (padrão) */
.btn-md {
  padding: 1rem 2.5rem;
  font-size: 1rem;
}

/* Small */
.btn-sm {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
}

/* Extra Small */
.btn-xs {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}
```

---

### **Cards**

```css
.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.1);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.card-subtitle {
  font-size: 1rem;
  color: #6B7280;
}

.card-body {
  margin-bottom: 1.5rem;
}

.card-footer {
  border-top: 1px solid #F3F4F6;
  padding-top: 1.5rem;
}
```

---

### **Badges**

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-primary {
  background: #EEF2FF;
  color: #6366F1;
}

.badge-success {
  background: #D1FAE5;
  color: #059669;
}

.badge-warning {
  background: #FEF3C7;
  color: #D97706;
}

.badge-error {
  background: #FEE2E2;
  color: #DC2626;
}

.badge-new {
  background: linear-gradient(135deg, #EC4899, #F59E0B);
  color: white;
}
```

---

### **Inputs**

```css
.input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  font-size: 1rem;
  color: #1F2937;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input:hover {
  border-color: #9CA3AF;
}

.input::placeholder {
  color: #9CA3AF;
}

.input-error {
  border-color: #EF4444;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

---

## 🎭 Ícones

### **Ícone Principal do FormFlow**

```svg
<!-- Versão Simples -->
<svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="12" fill="url(#gradient)"/>
  <path d="M20 16h24v4H20v-4z" fill="white" opacity="0.9"/>
  <path d="M20 26h24v4H20v-4z" fill="white" opacity="0.7"/>
  <path d="M20 36h16v4H20v-4z" fill="white" opacity="0.5"/>
  <circle cx="48" cy="48" r="8" fill="#EC4899"/>
  <path d="M45 48l2 2 4-4" stroke="white" stroke-width="2"/>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
</svg>

<!-- Versão com Transformação -->
<svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <!-- Papel (esquerda) -->
  <rect x="8" y="12" width="20" height="28" rx="2" fill="#E5E7EB"/>
  <line x1="12" y1="18" x2="24" y2="18" stroke="#9CA3AF" stroke-width="2"/>
  <line x1="12" y1="24" x2="24" y2="24" stroke="#9CA3AF" stroke-width="2"/>
  <line x1="12" y1="30" x2="20" y2="30" stroke="#9CA3AF" stroke-width="2"/>
  
  <!-- Seta de transformação -->
  <path d="M30 26h8l-2-2m2 2l-2 2" stroke="#6366F1" stroke-width="2"/>
  
  <!-- Digital (direita) -->
  <rect x="40" y="12" width="20" height="28" rx="2" fill="url(#gradient)"/>
  <line x1="44" y1="18" x2="56" y2="18" stroke="white" stroke-width="2" opacity="0.9"/>
  <line x1="44" y1="24" x2="56" y2="24" stroke="white" stroke-width="2" opacity="0.7"/>
  <line x1="44" y1="30" x2="52" y2="30" stroke="white" stroke-width="2" opacity="0.5"/>
  <circle cx="54" cy="36" r="4" fill="#EC4899"/>
  <path d="M52 36l1 1 2-2" stroke="white" stroke-width="1.5"/>
</svg>
```

### **Ícones de Features**

```
🤖 IA e Automação
📱 Mobile e Offline
📊 Relatórios e Analytics
🏢 Hierarquia Organizacional
🔐 Segurança e Compliance
🔄 Integrações e API
```

---

## 📐 Grid e Layout

### **Container**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}
```

### **Grid System**
```css
.grid {
  display: grid;
  gap: 2rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive */
@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 🎬 Animações

### **Transições Padrão**
```css
/* Rápida */
transition: all 0.15s ease;

/* Normal */
transition: all 0.3s ease;

/* Suave */
transition: all 0.5s ease;
```

### **Animações de Entrada**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### **Hover Effects**
```css
/* Elevação */
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* Escala */
.hover-scale:hover {
  transform: scale(1.05);
}

/* Brilho */
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}
```

---

## 📱 Breakpoints

```css
/* Mobile Small */
@media (max-width: 375px) { }

/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }

/* Large Desktop */
@media (min-width: 1400px) { }
```

---

## 🎨 Exemplos de Uso

### **Hero Section**
```css
.hero {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  padding: 120px 20px 80px;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.5rem;
  opacity: 0.95;
  margin-bottom: 2rem;
}
```

### **Feature Card**
```css
.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}
```

---

## ✅ Checklist de Implementação

### **Cores**
- [ ] Definir variáveis CSS
- [ ] Testar contraste (WCAG AA)
- [ ] Criar paleta de cores escuras (dark mode)

### **Tipografia**
- [ ] Importar fontes (Google Fonts)
- [ ] Definir escala tipográfica
- [ ] Testar legibilidade

### **Componentes**
- [ ] Criar biblioteca de componentes
- [ ] Documentar variações
- [ ] Testar responsividade

### **Ícones**
- [ ] Criar ícone principal
- [ ] Exportar em múltiplos tamanhos
- [ ] Criar favicon

### **Animações**
- [ ] Definir transições padrão
- [ ] Criar animações de entrada
- [ ] Testar performance

---

*Design System criado para garantir consistência visual em todo o ecossistema FormFlow*
