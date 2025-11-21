# Requirements Document

## Introduction

Sistema de gestão hierárquica que estabelece a relação obrigatória entre Empresas, Contratos, Templates de Formulários e Documentos Coletados. O sistema deve garantir que todos os templates estejam vinculados a um contrato específico, e que os documentos coletados herdem automaticamente essas informações hierárquicas.

## Glossary

- **Sistema**: Sistema de gestão de contratos e formulários
- **Empresa**: Entidade jurídica (pessoa física ou jurídica) que possui contratos
- **Contrato**: Acordo formal entre a empresa e o sistema, ao qual templates são vinculados
- **Template**: Modelo de formulário que deve estar obrigatoriamente vinculado a um contrato
- **Documento_Coletado**: Resposta/submissão de um template que herda informações do contrato
- **Usuário**: Pessoa que utiliza o sistema para gerenciar a hierarquia

## Requirements

### Requirement 1

**User Story:** Como administrador do sistema, eu quero cadastrar empresas com suas informações completas, para que eu possa estabelecer a base da hierarquia contratual.

#### Acceptance Criteria

1. WHEN o Usuário acessa a tela de empresas, THE Sistema SHALL exibir uma lista de todas as empresas cadastradas
2. WHEN o Usuário clica em "Nova Empresa", THE Sistema SHALL abrir um formulário de cadastro de empresa
3. THE Sistema SHALL validar que o documento (CNPJ/CPF) seja único no cadastro
4. THE Sistema SHALL permitir cadastrar informações básicas da empresa (nome, documento, contato, endereço)
5. THE Sistema SHALL permitir definir o status da empresa (ativo, inativo, suspenso)

### Requirement 2

**User Story:** Como administrador do sistema, eu quero cadastrar contratos vinculados às empresas, para que eu possa organizar os templates por contexto contratual.

#### Acceptance Criteria

1. WHEN o Usuário acessa a tela de contratos, THE Sistema SHALL exibir uma lista de contratos com informações da empresa
2. WHEN o Usuário cria um novo contrato, THE Sistema SHALL exigir a seleção de uma empresa existente
3. THE Sistema SHALL validar que o número do contrato seja único
4. THE Sistema SHALL permitir definir informações do contrato (título, tipo, vigência, valor)
5. THE Sistema SHALL permitir definir o status do contrato (rascunho, ativo, suspenso, expirado, cancelado)

### Requirement 3

**User Story:** Como usuário do sistema, eu quero que todos os templates sejam obrigatoriamente vinculados a um contrato, para que a hierarquia seja respeitada.

#### Acceptance Criteria

1. WHEN o Usuário cria um novo template, THE Sistema SHALL exigir a seleção de um contrato ativo
2. THE Sistema SHALL exibir apenas contratos ativos na seleção de templates
3. WHEN o Usuário acessa o designer de formulários, THE Sistema SHALL mostrar o contrato selecionado
4. THE Sistema SHALL impedir a criação de templates sem vinculação contratual
5. THE Sistema SHALL permitir filtrar templates por contrato

### Requirement 4

**User Story:** Como usuário do sistema, eu quero que os documentos coletados herdem automaticamente as informações do contrato, para que a rastreabilidade seja mantida.

#### Acceptance Criteria

1. WHEN um Documento_Coletado é criado, THE Sistema SHALL herdar automaticamente o contract_id do template
2. WHEN um Documento_Coletado é criado, THE Sistema SHALL herdar automaticamente o company_id do contrato
3. THE Sistema SHALL exibir informações da empresa e contrato nas listagens de documentos
4. THE Sistema SHALL permitir filtrar documentos por empresa ou contrato
5. THE Sistema SHALL manter a integridade referencial da hierarquia

### Requirement 5

**User Story:** Como usuário do sistema, eu quero navegar pela hierarquia de forma intuitiva, para que eu possa acessar facilmente os dados relacionados.

#### Acceptance Criteria

1. WHEN o Usuário visualiza uma empresa, THE Sistema SHALL mostrar todos os contratos relacionados
2. WHEN o Usuário visualiza um contrato, THE Sistema SHALL mostrar todos os templates vinculados
3. WHEN o Usuário visualiza um template, THE Sistema SHALL mostrar todos os documentos coletados
4. THE Sistema SHALL permitir navegação drill-down através da hierarquia
5. THE Sistema SHALL exibir breadcrumbs indicando a posição na hierarquia

### Requirement 6

**User Story:** Como administrador do sistema, eu quero ter controles de integridade referencial, para que a exclusão de registros não quebre a hierarquia.

#### Acceptance Criteria

1. WHEN o Usuário tenta excluir uma empresa, THE Sistema SHALL verificar se existem contratos ativos vinculados
2. WHEN o Usuário tenta excluir um contrato, THE Sistema SHALL verificar se existem templates vinculados
3. IF existem dependências ativas, THEN THE Sistema SHALL impedir a exclusão e exibir mensagem explicativa
4. THE Sistema SHALL permitir exclusão em cascata apenas para registros inativos
5. THE Sistema SHALL manter logs de auditoria para exclusões

### Requirement 7

**User Story:** Como usuário do sistema, eu quero ter dashboards e relatórios que respeitem a hierarquia, para que eu possa ter visibilidade completa dos dados.

#### Acceptance Criteria

1. THE Sistema SHALL exibir estatísticas de empresas (total, ativas, por tipo de documento)
2. THE Sistema SHALL exibir estatísticas de contratos (total, ativos, valor total, por tipo)
3. THE Sistema SHALL permitir relatórios filtrados por empresa ou contrato
4. THE Sistema SHALL exibir contadores de templates e documentos por contrato
5. THE Sistema SHALL alertar sobre contratos próximos ao vencimento

### Requirement 8

**User Story:** Como usuário do sistema, eu quero ter validações e controles de qualidade, para que os dados sejam consistentes e confiáveis.

#### Acceptance Criteria

1. THE Sistema SHALL validar formato de CNPJ e CPF no cadastro de empresas
2. THE Sistema SHALL validar datas de vigência de contratos (início < fim)
3. THE Sistema SHALL impedir alteração de contrato em templates com documentos coletados
4. THE Sistema SHALL validar que apenas contratos ativos possam receber novos templates
5. THE Sistema SHALL manter histórico de alterações em registros críticos