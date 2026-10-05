# 🪙 Aura Finanças

> **Sistema Completo e Inteligente de Gestão Financeira Pessoal e Familiar**  
> Desenvolvido com React 19, TypeScript, Tailwind CSS v4, Lucide Icons e Web Crypto API.

---

## 📌 Sobre o Projeto

O **Aura Finanças** é uma aplicação web moderna, rápida e privativa para gerenciamento financeiro de ponta a ponta. O sistema foi projetado para oferecer controle absoluto sobre receitas, despesas, cartões de crédito, orçamentos mensais, metas de economia e projeções patrimoniais, com interface fluida e suporte completo ao modo claro e escuro.

---

## 🚀 Principais Funcionalidades

### 1. 🔐 Autenticação & Segurança de Dados
- **Login e Cadastro de Usuários**: Acesso individual por email e senha com validações em tempo real.
- **Criptografia Segura**: Senhas protegidas com hashing criptográfico **SHA-256** com salt via *Web Crypto API*.
- **Medidor de Força de Senha**: Indicador dinâmico de complexidade (*Fraca*, *Média*, *Forte*).
- **Acesso Demo em 1 Clique**: Botão rápido com credenciais de demonstração pré-preenchidas para testes imediatos.
- **Bloqueio de Sessão (*Screen Lock*)**: Proteja seus números e extratos quando se afastar da tela sem precisar encerrar a sessão.
- **Gerenciamento de Perfil**: Edição de dados cadastrais e fluxo seguro de alteração de senha.

### 2. 📊 Painel Geral & Indicadores em Tempo Real
- **Patrimônio Líquido Consolidado**: Soma de saldos de contas correntes, dinheiro e investimentos, deduzidas as faturas de cartões de crédito.
- **Entradas e Saídas do Período**: Indicadores comparativos de fluxo financeiro.
- **Superávit / Balanço Líquido & Taxa de Poupança (%)**: Cálculo automático de quanto da sua renda líquida está sendo poupado.
- **Gráfico Interativo de Fluxo de Caixa**: Visualização temporal (semestral ou diária dos últimos 14 dias) com tooltips detalhados.
- **Gráfico Donut de Despesas por Categoria**: Visualização percentual e monetária com filtro direto ao clicar na categoria.
- **Seletor de Período**: *Este Mês*, *Mês Passado*, *Últimos 3 Meses*, *Este Ano* e *Todo o Período*.
- **Multimoeda**: Suporte visual a Real Brasileiro (**R$ BRL**), Dólar Americano (**$ USD**) e Euro (**€ EUR**).

### 3. 💸 Gestão Avançada de Transações
- **Classificação**: Despesas, Receitas e Transferências entre contas.
- **Parcelamento no Cartão**: Suporte a compras parceladas (ex: 1x a 24x) com geração automática do cronograma mensal.
- **Formas de Pagamento**: PIX, Cartão de Crédito, Débito, Boleto Bancário, Dinheiro em Espécie e Transferência bancária.
- **Status do Lançamento**: Alterne entre *Efetivado* e *Pendente* com apenas 1 clique.
- **Filtros e Busca Textual**: Pesquise instantaneamente por descrição, categoria, conta bancária, status ou tags.
- **Exportação CSV**: Baixe o extrato completo em formato `.csv` pronto para Excel, Google Planilhas ou importação contábil.

### 4. 🎯 Orçamentos Mensais por Categoria
- Definição de limites e tetos de gastos personalizados por categoria (Alimentação, Moradia, Transporte, Lazer, etc.).
- Barras de progresso com alertas automáticos de status:
  - 🟢 **Dentro do plano** (< 80%)
  - 🟡 **Atenção** (80% a 100%)
  - 🔴 **Excedeu o limite** (> 100%)
- Edição ágil de limites diretamente na listagem sem recarregar a página.

### 5. 🏆 Metas Financeiras & Caixinhas de Economia
- Definição de objetivos com valor alvo, data limite e estratégia de investimento.
- Cálculo automático do aporte mensal sugerido para atingir a meta no prazo estipulado.
- Botões de **Aporte Rápido (Guardar)** e **Resgate** com lançamento contábil automático associado à conta de origem.

### 6. 💳 Contas Bancárias & Cartões de Crédito
- Acompanhamento de contas correntes, contas poupança e carteiras de dinheiro físico.
- Gestão de cartões de crédito: fatura atual, limite total, limite disponível, dia de fechamento e dia de vencimento.
- Contas de corretora e investimentos (Tesouro, Ações, FIIs, Fundos).

### 7. 🔄 Contas Fixas & Recorrências
- Controle de boletos e assinaturas mensais (Aluguel, Condomínio, Internet, Streaming, Salário).
- Identificação de contas pendentes no mês atual e botão **Efetivar Agora** com 1 clique.

### 8. 📈 Relatórios & Diagnóstico Inteligente
- Tabela analítica comparativa dos últimos 6 meses com total de receitas, despesas, balanço e taxas de poupança.
- Distribuição de despesas por forma de pagamento (PIX vs Cartão vs Boleto).
- Top 5 maiores despesas registradas.
- **Diagnóstico de Saúde Financeira**:
  - Análise da **Regra 50/30/20** (Necessidades Essenciais vs Desejos vs Poupança).
  - Cobertura da **Reserva de Emergência** em meses de custo de vida.
  - Taxa de endividamento da renda no cartão de crédito.
  - Parecer financeiro estruturado com recomendações práticas.

### 9. 💾 Backup & Gestão de Dados
- **Exportação JSON**: Backup completo de todos os lançamentos, contas, categorias e orçamentos.
- **Importação JSON**: Restaure backups anteriores com validação de esquema.
- **Restauração de Demonstração**: Carregue o conjunto de dados modelo com um clique.

---

## 🗄️ Banco de Dados & Semeadura Automática (*Auto-Seed*)

A aplicação conta com uma arquitetura de banco de dados híbrida e robusta (**Cloud Database + Cache Local Offline-First**):

1. **Auto-Criação de Tabelas/Coleções e Semeadura Inicial (*Auto-Seed*)**:
   - Assim que um novo usuário se cadastra ou faz login pela primeira vez, o serviço `dbService.ts` verifica a existência das coleções no banco de dados em nuvem.
   - **Se o banco estiver vazio**: O sistema cria automaticamente todas as estruturas necessárias (`categories`, `accounts`, `transactions`, `goals`, `recurring`) e **já executa a semeadura (*seed*) completa** com categorias brasileiras, contas correntes e carteiras de investimento, metas e lançamentos realistas de exemplo.
   - Dessa forma, o usuário nunca encontra uma tela estéril ou com erros de tabela inexistente.
2. **Sincronização em Nuvem em Tempo Real**:
   - Todas as transações criadas, contas modificadas, limites de orçamento, metas e contas a pagar são salvas no banco de dados na nuvem associadas ao `userId` do usuário autenticado.
   - Os usuários e credenciais de login (com hash seguro **SHA-256**) também são persistidos na coleção `/users`.
3. **Resiliência e Cache Offline**:
   - Em caso de falha de conexão de rede ou lentidão temporária, o sistema possui cache em `localStorage`, permitindo continuar navegando e operando sem travamentos.
4. **Exportação & Backup Manual**:
   - Você pode exportar backups completos em **JSON** ou extratos tabulares em **CSV** diretamente pelo painel a qualquer momento.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Banco de Dados em Nuvem**: [Firebase Cloud Firestore](https://firebase.google.com/products/firestore) (com regras de segurança e auto-seeding)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) com suporte a classes customizadas para Dark Mode
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Animações**: [Motion](https://motion.dev/)
- **Criptografia**: Web Crypto API nativa (`crypto.subtle`) com SHA-256

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js versão 18.0 ou superior
- Gerenciador de pacotes npm ou yarn

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/aura-financas.git
   cd aura-financas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:3000`.

4. **Para gerar o build de produção:**
   ```bash
   npm run build
   ```

---

## 📂 Estrutura de Diretórios

```
├── src/
│   ├── components/
│   │   ├── accounts/          # Gestão de contas bancárias e cartões
│   │   ├── ai/                # Diagnóstico financeiro e regra 50/30/20
│   │   ├── auth/              # Telas de login, cadastro, bloqueio e perfil
│   │   ├── budgets/           # Orçamentos mensais e tetos de gastos
│   │   ├── common/            # Ícones e modais de backup
│   │   ├── dashboard/         # StatCards, Fluxo de Caixa e Donut
│   │   ├── goals/             # Metas financeiras e caixinhas
│   │   ├── layout/            # Topbar e navegação principal
│   │   ├── recurring/         # Contas fixas e despesas recorrentes
│   │   ├── reports/           # Histórico semestral e relatórios
│   │   └── transactions/      # Extrato, filtros e modal de lançamento
│   ├── context/
│   │   ├── AuthContext.tsx    # Contexto de autenticação e sessão
│   │   └── FinanceContext.tsx # Contexto de transações, contas e orçamentos
│   ├── types/
│   │   ├── auth.ts            # Tipagens de usuário e sessão
│   │   └── finance.ts         # Tipagens de lançamentos e contas
│   ├── utils/
│   │   ├── crypto.ts          # Hashing SHA-256 de senhas
│   │   ├── formatters.ts      # Formatadores BRL, datas e porcentagens
│   │   └── initialData.ts     # Massa inicial de dados demonstrativos
│   ├── App.tsx                # Componente raiz e roteamento de abas
│   ├── index.css              # Configurações do Tailwind CSS v4 e fontes
│   └── main.tsx               # Ponto de entrada da aplicação
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 Licença

Distribuído sob a licença **Apache 2.0**. Consulte o arquivo de licença para mais informações.
