# 🎨 Personalização de Campos

## 🆕 Novas Funcionalidades

### 1. **Placeholder Inteligente**
- **No modo Canvas (Designer):** Se o placeholder estiver vazio, o campo não exibe nada dentro
- **No modo Edição:** Sempre mostra o placeholder ou um texto padrão
- **Benefício:** Facilita a visualização limpa do formulário no designer

### 2. **Valor Padrão**
- Campo para definir o valor inicial que aparece automaticamente
- Útil para campos que geralmente têm o mesmo valor
- Exemplos:
  - País: "Brasil"
  - Status: "Ativo"
  - Quantidade: "1"

### 3. **Dicas / Texto de Ajuda (helpText)**
- Aparece como **tooltip** ao passar o mouse sobre o campo
- Ajuda o usuário a entender o que deve preencher
- Ícone de lâmpada 💡 no painel de propriedades

## 📝 Como Usar

### No Designer:

1. **Selecione um campo**
2. **Clique em "Propriedades do Campo"** (⚙️)
3. **Configure:**

```
┌─────────────────────────────────────┐
│ Placeholder                         │
│ ┌─────────────────────────────────┐ │
│ │ Digite o nome completo...       │ │
│ └─────────────────────────────────┘ │
│ 💡 No modo canvas, se vazio,        │
│    não exibe nada dentro do campo   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Valor Padrão                        │
│ ┌─────────────────────────────────┐ │
│ │ Brasil                          │ │
│ └─────────────────────────────────┘ │
│ 📝 Valor que aparece                │
│    automaticamente quando o         │
│    formulário é aberto              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💡 Dicas / Texto de Ajuda           │
│ ┌─────────────────────────────────┐ │
│ │ Digite o nome completo sem      │ │
│ │ abreviações. Ex: João da Silva  │ │
│ └─────────────────────────────────┘ │
│ 💬 Aparece como tooltip ao passar   │
│    o mouse sobre o campo            │
└─────────────────────────────────────┘
```

## 🎯 Exemplos Práticos

### Campo: Nome Completo
```
Label: Nome Completo
Placeholder: (vazio - não mostra nada no canvas)
Valor Padrão: (vazio)
Dicas: Digite o nome completo sem abreviações
```

### Campo: País
```
Label: País
Placeholder: Selecione o país
Valor Padrão: Brasil
Dicas: País onde a empresa está registrada
```

### Campo: Status
```
Label: Status
Placeholder: (vazio)
Valor Padrão: Ativo
Dicas: Status atual do contrato
```

### Campo: Quantidade
```
Label: Quantidade
Placeholder: 0
Valor Padrão: 1
Dicas: Quantidade de itens (mínimo 1)
```

## 💡 Dicas de Uso

### Placeholder:
- ✅ Use para dar exemplos: "Ex: João da Silva"
- ✅ Use para instruções curtas: "Digite aqui..."
- ❌ Não use para informações importantes (use Dicas)
- 💡 Deixe vazio no canvas para visualização limpa

### Valor Padrão:
- ✅ Use para valores comuns: "Brasil", "Ativo", "1"
- ✅ Use para economizar tempo do usuário
- ❌ Não use para valores que variam muito
- 💡 O usuário pode sempre alterar

### Dicas (helpText):
- ✅ Use para explicar o que preencher
- ✅ Use para dar exemplos detalhados
- ✅ Use para regras de validação
- 💡 Aparece ao passar o mouse (não polui a tela)

## 🔄 Comportamento

### Ao Criar Novo Formulário:
1. Campos são inicializados com **valor padrão** (se definido)
2. Placeholder aparece se o campo estiver vazio
3. Tooltip com dicas aparece ao passar o mouse

### No Modo Canvas (Designer):
1. Se placeholder vazio → campo fica limpo
2. Se placeholder preenchido → mostra o texto
3. Facilita visualização do layout

### No Modo Edição (Preenchimento):
1. Sempre mostra placeholder (se definido)
2. Valor padrão já vem preenchido
3. Tooltip sempre disponível

## 🎨 Interface

### Ícones:
- 💡 **Lâmpada** = Dicas / Texto de Ajuda
- 📝 **Nota** = Valor Padrão
- 💬 **Balão** = Tooltip ativo

### Cores:
- **Amarelo** = Dicas (lâmpada)
- **Azul** = Informações
- **Verde** = Sucesso

## 🚀 Benefícios

1. **Formulários mais limpos** - Canvas sem poluição visual
2. **Usuários mais produtivos** - Valores padrão economizam tempo
3. **Menos erros** - Dicas ajudam a preencher corretamente
4. **Melhor UX** - Tooltips não poluem a interface
