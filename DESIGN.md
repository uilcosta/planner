# Financial Planner - Documento de Design

> **Status:** Aprovado para implementação
> **Data:** 2026-11-17
> **Autor:** Requisitos do usuário + análise de referência do Meu Planner Financeiro

---

## 1. Intenção & Porquê

Construir um **sistema de gestão financeira pessoal** que separe **Planejamento (Previsto)** de **Controle (Realizado)** mês a mês, com uma funcionalidade única de **"Caixinhas" (caixas pessoais)** onde cada aporte em uma meta cria automaticamente uma saída correspondente no fluxo de caixa mensal.

**Por que agora:** Ferramentas existentes misturam planejado vs real, não modelam "caixinhas" como cidadãos de primeira classe com impacto no fluxo de caixa, e não têm experiência mobile-first PWA bonita.

**Usuário alvo:** Inicialmente uso pessoal, desenhado para futura comercialização (multi-tenant ready via RLS).

---

## 2. Metas, Não-Metas, Anti-Metas

### Metas (MVP)
- [ ] **Visualização Planejamento Mensal** — Criar/editar receitas/despesas planejadas por mês com recorrência
- [ ] **Visualização Controle Mensal** — Registrar transações reais, auto-comparar vs planejado (variação %, indicadores visuais)
- [ ] **Caixinhas/Metas** — Criar caixas nomeadas (valor alvo, prazo), aportes mensais → criam saída automática no Controle
- [ ] **Persistência PostgreSQL** — Todos dados no Supabase com Row Level Security por usuário
- [ ] **UI Bonita Responsiva** — Design system moderno, mobile-first, PWA instalável
- [ ] **Navegador de Mês** — Troca rápida mês/ano (Jan-Dez, 2025-2030)
- [ ] **Hierarquia Categorias** — Categorias + subcategorias para planejamento e controle

### Não-Metas (Pós-MVP)
- Multi-moeda
- Rastreamento portfólio investimentos (além de caixinhas)
- Sincronização bancária/Open Banking
- Orçamentos compartilhados/familiares
- Relatórios/exportações avançados (PDF, Excel)
- Notificações/lembretes

### Anti-Metas (NÃO DEVE)
- Misturar planejado e real na mesma visualização sem separação clara
- Caixinhas que não afetam fluxo de caixa mensal
- Armazenamento apenas local (deve ser PostgreSQL)
- UI apenas desktop
- Design genérico estilo bootstrap

---

## 3. Restrições

| Restrição | Valor |
|-----------|-------|
| **Framework** | Next.js 15 (App Router) + TypeScript strict |
| **Banco** | Supabase PostgreSQL + Prisma ORM |
| **Auth** | Supabase Auth (email/senha, magic link, OAuth ready) |
| **RLS** | Toda tabela tem `user_id` + política RLS `auth.uid() = user_id` |
| **Estilização** | Tailwind CSS + Shadcn/UI (primitivas Radix) |
| **Gráficos** | Recharts (responsivo, compatível SSR) |
| **Forms** | React Hook Form + validação Zod |
| **Estado** | TanStack Query v5 (server state) + React Context (UI state) |
| **PWA** | next-pwa (Workbox) — service worker, manifest, offline-first |
| **Ícones** | Lucide React |
| **Datas** | date-fns (locale pt-BR) |
| **Testes** | Vitest (unit) + Playwright (e2e) |
| **Lint/Format** | ESLint + Prettier + Husky |
| **Node** | ≥ 20.x |
| **Idioma** | pt-BR (UI, datas, moeda) |

---

## 4. Abordagens Consideradas

| Abordagem | Trade-offs | Decisão |
|-----------|------------|---------|
| **Next.js + Supabase** (escolhida) | ✅ Server Components, API Routes, auth/RLS zero-config, deploy Vercel, PWA fácil | ✅ Selecionada |
| Remix + Supabase | Bom DX, mas ecossistema menor, sem plugin PWA nativo | ❌ |
| Vite + Express + Supabase | Mais controle, mas sem SSR/SSG, setup PWA manual | ❌ |
| Next.js + Prisma + Auth própria (NextAuth) | Controle total, mas RLS manual, mais código auth | ❌ |
| App mobile (React Native/Expo) | Nativo real, mas codebase separado, sem web PWA | ❌ |

**Por que Next.js + Supabase vence:** Codebase único para web + PWA, Supabase cuida auth + RLS + Postgres + realtime, deploy Vercel zero-config, excelente story TypeScript.

---

## 5. Modelo de Dados (Schema Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  categories    Category[]
  institutions  Institution[]
  accounts      Account[]
  plannedItems  PlannedItem[]
  transactions  Transaction[]
  caixinhas     Caixinha[]
  contributions Contribution[]
  
  @@map("users")
}

model Category {
  id          String    @id @default(cuid())
  name        String
  icon        String?   // nome ícone Lucide
  color       String?   // cor hex
  type        CategoryType // INCOME | EXPENSE | TRANSFER
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  plannedItems PlannedItem[]
  transactions Transaction[]
  
  @@unique([name, userId, parentId])
  @@map("categories")
}

model Institution {
  id        String   @id @default(cuid())
  name      String
  type      InstitutionType // BANK | CREDIT_CARD | INVESTMENT | OTHER
  color     String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  accounts Account[]
  
  @@unique([name, userId])
  @@map("institutions")
}

model Account {
  id              String       @id @default(cuid())
  name            String
  type            AccountType  // CHECKING | SAVINGS | CREDIT_CARD | INVESTMENT | CASH
  institutionId   String
  institution     Institution  @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  initialBalance  Decimal      @default(0) @db.Decimal(15,2)
  currentBalance  Decimal      @default(0) @db.Decimal(15,2)
  creditLimit     Decimal?     @db.Decimal(15,2) // para cartões crédito
  closingDay      Int?         // 1-31
  dueDay          Int?         // 1-31
  isActive        Boolean      @default(true)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  transactions Transaction[]
  
  @@map("accounts")
}

model PlannedItem {
  id                   String         @id @default(cuid())
  description          String
  amount               Decimal        @db.Decimal(15,2)
  type                 TransactionType // INCOME | EXPENSE
  categoryId           String
  category             Category       @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  userId               String
  user                 User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  month                Int            // 1-12
  year                 Int            // ex: 2026
  recurrence           RecurrenceType @default(ONE_TIME) // ONE_TIME | MONTHLY | YEARLY | CUSTOM
  recurrenceEndDate    DateTime?      // para recorrência custom
  dayOfMonth           Int?           // 1-31, quando recorrência aplica
  isActive             Boolean        @default(true)
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  
  @@unique([userId, month, year, description, categoryId, dayOfMonth])
  @@index([userId, month, year])
  @@map("planned_items")
}

model Transaction {
  id                 String             @id @default(cuid())
  description        String
  amount             Decimal            @db.Decimal(15,2)
  type               TransactionType    // INCOME | EXPENSE | TRANSFER
  categoryId         String
  category           Category           @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  accountId          String
  account            Account            @relation(fields: [accountId], references: [id], onDelete: Restrict)
  userId             String
  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  date               DateTime           // data transação
  month              Int                // 1-12 (desnormalizado para queries)
  year               Int                // ex: 2026
  status             TransactionStatus  @default(PENDING) // PENDING | COMPLETED | CANCELLED
  isRecurring        Boolean            @default(false)
  recurringGroupId   String?            // agrupa transações recorrentes
  caixinhaId         String?            // link para caixinha se for aporte
  caixinha           Caixinha?          @relation(fields: [caixinhaId], references: [id], onDelete: SetNull)
  notes              String?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  
  @@index([userId, month, year])
  @@index([userId, date])
  @@index([userId, caixinhaId])
  @@map("transactions")
}

model Caixinha {
  id                   String   @id @default(cuid())
  name                 String
  description          String?
  icon                 String?  // nome ícone Lucide
  color                String?  // cor hex
  targetAmount         Decimal  @db.Decimal(15,2)
  currentAmount        Decimal  @default(0) @db.Decimal(15,2)
  targetDate           DateTime? // prazo
  monthlyContribution  Decimal  @default(0) @db.Decimal(15,2) // sugestão mensal
  accountId            String?  // onde dinheiro fica guardado
  account              Account? @relation(fields: [accountId], references: [id], onDelete: SetNull)
  userId               String
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isActive             Boolean  @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  contributions Contribution[]
  
  @@map("caixinhas")
}

model Contribution {
  id            String     @id @default(cuid())
  caixinhaId    String
  caixinha      Caixinha   @relation(fields: [caixinhaId], references: [id], onDelete: Cascade)
  transactionId String?    // a transação real (saída no controle)
  transaction   Transaction? @relation(fields: [transactionId], references: [id], onDelete: SetNull)
  amount        Decimal    @db.Decimal(15,2)
  date          DateTime
  month         Int        // 1-12
  year          Int
  notes         String?
  createdAt     DateTime   @default(now())
  
  @@index([caixinhaId, month, year])
  @@map("contributions")
}

enum CategoryType {
  INCOME
  EXPENSE
  TRANSFER
}

enum InstitutionType {
  BANK
  CREDIT_CARD
  INVESTMENT
  OTHER
}

enum AccountType {
  CHECKING
  SAVINGS
  CREDIT_CARD
  INVESTMENT
  CASH
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

enum TransactionStatus {
  PENDING
  COMPLETED
  CANCELLED
}

enum RecurrenceType {
  ONE_TIME
  MONTHLY
  YEARLY
  CUSTOM
}
```

---

## 6. Design da API (Server Actions + Route Handlers)

### Server Actions (Next.js 15)
```
/app/actions/
├── planning/
│   ├── getPlannedItems.ts           // GET: listar por mês/ano
│   ├── createPlannedItem.ts         // POST: criar item planejado
│   ├── updatePlannedItem.ts         // PATCH: atualizar item planejado
│   ├── deletePlannedItem.ts         // DELETE: deletar item planejado
│   ├── copyMonthPlanned.ts          // POST: copiar mês anterior para atual
│   └── importPlannedCsv.ts          // POST: importar CSV
├── control/
│   ├── getTransactions.ts           // GET: listar por mês/ano com filtros
│   ├── createTransaction.ts         // POST: criar transação
│   ├── updateTransaction.ts         // PATCH: atualizar transação
│   ├── deleteTransaction.ts         // DELETE: deletar transação
│   ├── markTransactionPaid.ts       // PATCH: alternar status
│   └── importTransactionsCsv.ts     // POST: importar CSV
├── caixinhas/
│   ├── getCaixinhas.ts              // GET: listar todas
│   ├── createCaixinha.ts            // POST: criar caixinha
│   ├── updateCaixinha.ts            // PATCH: atualizar caixinha
│   ├── deleteCaixinha.ts            // DELETE: deletar caixinha
│   ├── addContribution.ts           // POST: adicionar aporte (cria transação)
│   └── getContributions.ts          // GET: listar aportes por caixinha/mês
├── categories/
│   ├── getCategories.ts             // GET: listar (hierárquico)
│   ├── createCategory.ts            // POST: criar
│   ├── updateCategory.ts            // PATCH: atualizar
│   └── deleteCategory.ts            // DELETE: deletar
├── accounts/
│   ├── getAccounts.ts               // GET: listar
│   ├── createAccount.ts             // POST: criar
│   ├── updateAccount.ts             // PATCH: atualizar
│   └── deleteAccount.ts             // DELETE: deletar
├── dashboard/
│   ├── getDashboardSummary.ts       // GET: KPIs do mês
│   ├── getMonthlyComparison.ts      // GET: dados gráfico planejado vs real
│   └── getUpcomingBills.ts          // GET: faturas cartão vencendo
└── auth/
    ├── signUp.ts
    ├── signIn.ts
    └── signOut.ts
```

### Route Handlers (para webhooks, exports)
```
/app/api/
├── webhooks/
│   └── stripe/route.ts              // Futuro: webhooks assinatura
└── export/
    └── monthly-report/route.ts      // GET: gerar relatório PDF/Excel
```

---

## 7. Design System UI/UX

### Paleta de Cores (Tailwind Config)
```js
// tailwind.config.ts
colors: {
  primary: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
    400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
    800: '#9a3412', 900: '#7c2d12', 950: '#431407',
  },
  // Verde para receita, Vermelho para despesa, Laranja para avisos
  success: { 500: '#22c55e', 600: '#16a34a' },
  danger: { 500: '#ef4444', 600: '#dc2626' },
  warning: { 500: '#f59e0b', 600: '#d97706' },
}
```

### Componentes-chave (Shadcn/UI + Custom)
| Componente | Propósito |
|------------|-----------|
| `MonthYearPicker` | Dropdown com ano + grade meses (como app referência) |
| `KPICard` | Receitas / Despesas / Saldo / Variação % |
| `VarianceBadge` | Badge verde/vermelho com % diff planejado vs real |
| `TransactionRow` | Swipe actions (editar, deletar, marcar pago) |
| `CaixinhaCard` | Progresso circular + botão aporte mensal |
| `CategorySelector` | Dropdown hierárquico com ícones |
| `AccountSelector` | Cards com saldo, badge tipo |
| `ComparisonChart` | Recharts barra/linha: planejado vs real por categoria |
| `EmptyState` | Ilustrações + CTA para usuários first-time |

### Breakpoints Responsivos
| Breakpoint | Layout |
|------------|--------|
| `< 640px` (mobile) | Cards empilhados, bottom nav, forms modais, tabelas swipeáveis |
| `640-1024px` (tablet) | Grid 2 colunas, side drawer nav |
| `> 1024px` (desktop) | Dashboard 3 colunas, sidebar persistente, hover states |

### Manifest PWA
```json
{
  "name": "Meu Planner Financeiro",
  "short_name": "Planner",
  "description": "Planejamento e controle financeiro mensal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f97316",
  "icons": [...]
}
```

---

## 8. Fluxos Principais do Usuário

### Fluxo 1: Planejamento Mensal (Previsto)
1. Usuário seleciona mês/ano → `/planejamento/2026/11`
2. Vê lista itens planejados agrupados por categoria (Receita/Despesa)
3. Clica "Nova Receita" ou "Nova Despesa" → modal form
4. Preenche: descrição, valor, categoria, recorrência, dia do mês
5. Salva → aparece na lista com badge recorrência
6. Pode "Copiar do mês anterior" para duplicar

### Fluxo 2: Controle Mensal (Realizado)
1. Usuário seleciona mês/ano → `/controle/2026/11`
2. Vê lista transações com **coluna Variação** (planejado vs real)
2. Color coding: 🟢 Abaixo orçamento, 🔴 Acima orçamento, ⚪ No planejado
3. Clica "Novo Lançamento" → modal: tipo, descrição, valor, categoria, conta, data, status
4. Pode marcar PENDING → COMPLETED (swipe ou botão)
5. Filtros por: categoria, conta, status, tipo

### Fluxo 3: Caixinhas (Metas)
1. Usuário vai em `/caixinhas`
2. Vê grid cards: cada um mostra nome, ícone, progresso circular (atual/alvo), aporte mensal
3. Clica "Nova Caixinha" → modal: nome, valor alvo, prazo, sugestão mensal, ícone, cor, conta
4. Clica "Aportar" em um card → modal: valor, data, notas
5. **Mágica:** Cria registro Contribution + **auto-cria Transaction (EXPENSE)** no mês atual do Controle
6. Progresso da caixinha atualiza em tempo real

### Fluxo 4: Dashboard
1. Usuário acessa `/` → mês atual auto-selecionado
2. Cards KPI: Receitas (planejado vs real), Despesas (planejado vs real), Saldo, Variação %
3. Gráfico: Planejado vs Real por categoria (bar chart)
4. Próximos: Faturas cartão vencendo, transações pendentes
5. Ações rápidas: +Receita, +Despesa, +Caixinha

---

## 9. Segurança & Políticas RLS

```sql
-- Todas tabelas: habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ... repetir para todas tabelas

-- Template política (todas tabelas têm user_id)
CREATE POLICY "Users can only access own data" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Especial: tabela users
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

## 10. Foco de Revisão (Casos Críticos)

| Entrada/Condição | Comportamento Esperado | Local Teste |
|------------------|------------------------|-------------|
| **Limite mês** — transação dia 31, próximo mês tem 30 dias | Tratar graciosamente `dayOfMonth > daysInMonth` (usar último dia) | `planning/copyMonthPlanned.test.ts` |
| **Aporte caixinha** → cria transação DESPESA | Transação aparece no Controle mesmo mês, linkada à caixinha | `caixinhas/addContribution.test.ts` |
| **Item planejado recorrente** (mensal) copiado para meses futuros | Copia apenas para meses onde recorrência se aplica, respeita `endDate` | `planning/createPlannedItem.test.ts` |
| **Tentativa bypass RLS** — usuário A lê dados usuário B | Retorna vazio/403, nenhum vazamento dados | `auth/rls-policies.test.ts` |
| **PWA offline** — usuário adiciona transação offline | Enfileirado localmente, sincronizado quando online, sem perda dados | `pwa/offline-sync.test.ts` |
| **Precisão decimal** — moeda brasileira (R$ 1.234,56) | Todos valores armazenados `DECIMAL(15,2)`, exibidos locale pt-BR | `utils/currency.test.ts` |
| **Exclusão categoria hierárquica** — pai com filhas | Bloquear exclusão ou cascata (configurável), nunca órfãs filhas | `categories/deleteCategory.test.ts` |

---

## 11. O Que Fica Para o Builder

- Customização exata componentes Shadcn/UI (cores, border radius)
- Escolhas animação (Framer Motion vs CSS transitions)
- Configurações específicas gráficos (tooltips, legends, comportamento responsivo)
- Copy mensagens erro (Português, user-friendly)
- Ilustrações empty states (usar unDraw ou SVG custom)
- Flow onboarding (tutorial first-time como app referência)
- Formatos export (layout PDF, colunas Excel)

---

**Próximo Passo:** Plano de Implementação → `docs/superpowers/plans/2026-11-17-financial-planner.md`