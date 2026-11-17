# Plano de Implementação - Financial Planner

> **Para workers agentic:** SUB-SKILL OBRIGATÓRIA: Use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. Passos usam sintaxe de checkbox (`- [ ]`) para rastreamento.

**Objetivo:** Construir um sistema de gestão financeira pessoal com visualizações separadas de Planejamento Mensal (Previsto) e Controle (Realizado), Caixinhas (metas com impacto automático no fluxo de caixa), hierarquia de categorias, e UI bonita pronta para PWA usando Next.js 15, Supabase, Prisma, Tailwind e Shadcn/UI.

**Arquitetura:** Next.js 15 App Router com Server Components para busca de dados, Server Actions para mutações, Supabase Auth + PostgreSQL com RLS para multi-tenancy nativo, Prisma ORM para acesso type-safe ao banco, TanStack Query para estado cliente, Recharts para visualizações. Design mobile-first responsivo com suporte PWA via next-pwa.

**Tech Stack:** Next.js 15.2+, TypeScript 5.6+, React 19, Tailwind CSS 3.4+, Shadcn/UI (Radix), Prisma 6+, Supabase JS 2+, TanStack Query 5+, Recharts 2+, date-fns 4+, Lucide React, next-pwa, Zod, React Hook Form, Vitest, Playwright.

**Spec:** `../specs/2026-11-17-financial-planner-design.md`

## Restrições Globais

- Node.js ≥ 20.x, pnpm ≥ 9.x
- TypeScript strict mode, sem `any` em código de produção
- Todas as tabelas do banco têm `user_id` com política RLS `auth.uid() = user_id`
- Moeda: Real Brasileiro (BRL), armazenado como `DECIMAL(15,2)`, exibido com locale `pt-BR`
- Datas: `date-fns` com locale `pt-BR`, meses 1-12, anos 2025-2030
- Mobile-first: `< 640px` cards empilhados, bottom nav, forms modais; `> 1024px` dashboard 3 colunas, sidebar persistente
- PWA: `next-pwa` com Workbox, service worker, manifest, offline-first para leituras
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`), uma feature por commit

## Foco de Revisão

| # | Entrada/Condição | Comportamento Esperado | Local do Teste |
|---|------------------|------------------------|----------------|
| 1 | Limite de mês — transação no dia 31, próximo mês tem 30 dias | Tratar graciosamente `dayOfMonth > daysInMonth` (usar último dia) | `tasks/03-planning-copy-month.test.ts` |
| 2 | Aporte em caixinha → cria transação DESPESA | Transação aparece no Controle no mesmo mês, linkada à caixinha | `tasks/06-caixinha-contribution.test.ts` |
| 3 | Item planejado recorrente (mensal) copiado para meses futuros | Copia apenas para meses onde recorrência se aplica, respeita `endDate` | `tasks/03-planning-recurrence.test.ts` |
| 4 | Tentativa de bypass RLS — usuário A lê dados do usuário B | Retorna vazio/403, nenhum vazamento de dados | `tasks/01-auth-rls.test.ts` |
| 5 | PWA offline — usuário adiciona transação offline | Enfileirado localmente, sincronizado quando online, sem perda de dados | `tasks/10-pwa-offline.test.ts` |
| 6 | Precisão decimal — moeda brasileira (R$ 1.234,56) | Todos valores armazenados como `DECIMAL(15,2)`, exibidos com locale `pt-BR` | `tasks/00-utils-currency.test.ts` |
| 7 | Exclusão de categoria pai com filhas | Bloquear exclusão ou cascata (configurável), nunca deixar filhas órfãs | `tasks/02-category-delete.test.ts` |

---

### Tarefa 0: Setup & Configuração do Projeto

**Arquivos:**
- Criar: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Criar: `.env.example`, `.env.local` (gitignored)
- Criar: `prisma/schema.prisma`
- Criar: `.eslintrc.js`, `.prettierrc`, `.husky/pre-commit`
- Criar: `src/lib/utils.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`
- Criar: `src/lib/prisma.ts`, `src/lib/validators.ts`
- Criar: `src/types/index.ts`
- Testes: `tests/utils/currency.test.ts`, `tests/utils/date.test.ts`

**Interfaces:**
- Consome: Nenhuma (fundação)
- Produz: `cn()`, `formatCurrency()`, `formatDate()`, `prisma`, `supabaseServer`, `supabaseClient`, schemas Zod

- [ ] **Passo 1: Inicializar projeto Next.js 15 com TypeScript, Tailwind, ESLint**

```bash
pnpm create next-app@latest meu-planner-financeiro --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
cd meu-planner-financeiro
```

- [ ] **Passo 2: Instalar todas as dependências**

```bash
pnpm add @prisma/client @supabase/supabase-js @tanstack/react-query next-pwa recharts lucide-react react-hook-form @hookform/resolvers zod date-fns clsx tailwind-merge
pnpm add -D prisma @types/node vitest @vitest/ui playwright @playwright/test eslint-plugin-playwright husky lint-staged
```

- [ ] **Passo 3: Configurar schema Prisma**

```prisma
// prisma/schema.prisma - Copiar da Seção 5 do DESIGN.md
```

- [ ] **Passo 4: Configurar Tailwind com cores customizadas**

```typescript
// tailwind.config.ts - Estender com paletas primary, success, danger, warning do DESIGN.md
```

- [ ] **Passo 5: Configurar next-pwa**

```javascript
// next.config.js - withPWA({ dest: 'public', register: true, skipWaiting: true, disable: process.env.NODE_ENV === 'development' })
```

- [ ] **Passo 6: Criar clients Supabase (server & client)**

```typescript
// src/lib/supabase/server.ts - createServerClient() com cookies()
// src/lib/supabase/client.ts - createBrowserClient()
```

- [ ] **Passo 7: Criar singleton Prisma**

```typescript
// src/lib/prisma.ts - export const prisma = globalThis.prisma ?? new PrismaClient()
```

- [ ] **Passo 8: Criar funções utilitárias & validadores**

```typescript
// src/lib/utils.ts - cn(), formatCurrency(), formatDate(), getMonthName()
// src/lib/validators.ts - Schemas Zod para todos os forms
```

- [ ] **Passo 9: Escrever testes de utilitários moeda & data**

```typescript
// tests/utils/currency.test.ts - formatCurrency(1234.56) === "R$ 1.234,56"
// tests/utils/date.test.ts - getMonthName(11) === "Novembro"
```

- [ ] **Passo 10: Rodar testes & commit**

```bash
pnpm test tests/utils/
git add -A && git commit -m "chore: project setup com Next.js 15, Prisma, Supabase, Tailwind, PWA"
```

---

### Tarefa 1: Autenticação & Fundação RLS

**Arquivos:**
- Criar: `src/app/actions/auth/signIn.ts`, `src/app/actions/auth/signUp.ts`, `src/app/actions/auth/signOut.ts`
- Criar: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Criar: `src/middleware.ts` (proteção de auth)
- Criar: `src/components/auth/AuthForm.tsx`, `src/components/auth/ProtectedRoute.tsx`
- Criar: `supabase/migrations/001_enable_rls.sql`
- Testes: `tests/auth/signIn.test.ts`, `tests/auth/rls-policies.test.ts`

**Interfaces:**
- Consome: `supabaseServer`, `supabaseClient` da Tarefa 0
- Produz: `signIn()`, `signUp()`, `signOut()`, `getUser()` server actions, middleware auth check

- [ ] **Passo 1: Escrever testes de auth que falham**

```typescript
// tests/auth/signIn.test.ts
test('signIn com credenciais válidas retorna user', async () => { ... })
test('signIn com credenciais inválidas lança erro', async () => { ... })
test('RLS: usuário A não lê categorias do usuário B', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/auth/
# Esperado: FAIL - funções não definidas
```

- [ ] **Passo 3: Implementar server actions Supabase Auth**

```typescript
// src/app/actions/auth/signIn.ts
export async function signIn(email: string, password: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

// src/app/actions/auth/signUp.ts - similar com signUp
// src/app/actions/auth/signOut.ts - signOut()
```

- [ ] **Passo 4: Criar páginas de auth & middleware**

```typescript
// src/middleware.ts - proteger todas rotas exceto /login, /register, /api/auth
// src/app/(auth)/login/page.tsx - form com React Hook Form + Zod
// src/app/(auth)/register/page.tsx - form com nome, email, senha
```

- [ ] **Passo 5: Aplicar migração RLS**

```sql
-- supabase/migrations/001_enable_rls.sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixinhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_data" ON categories FOR ALL USING (auth.uid() = user_id);
-- repetir para todas tabelas
```

- [ ] **Passo 6: Rodar testes & commit**

```bash
pnpm test tests/auth/
git add -A && git commit -m "feat: autenticação com Supabase Auth e políticas RLS"
```

---

### Tarefa 2: CRUD Categorias & Instituições

**Arquivos:**
- Criar: `src/app/actions/categories/getCategories.ts`, `createCategory.ts`, `updateCategory.ts`, `deleteCategory.ts`
- Criar: `src/app/actions/institutions/getInstitutions.ts`, `createInstitution.ts`, `updateInstitution.ts`, `deleteInstitution.ts`
- Criar: `src/components/categories/CategoryForm.tsx`, `CategoryTree.tsx`, `CategorySelector.tsx`
- Criar: `src/app/(dashboard)/configuracoes/categorias/page.tsx`
- Criar: `src/app/(dashboard)/configuracoes/instituicoes/page.tsx`
- Testes: `tests/categories/crud.test.ts`, `tests/categories/hierarchy.test.ts`, `tests/categories/delete-cascade.test.ts`

**Interfaces:**
- Consome: `prisma`, `getUser()` da Tarefa 1
- Produz: `getCategories(): Promise<CategoryWithChildren[]>`, `createCategory(input)`, `updateCategory(id, input)`, `deleteCategory(id)`

- [ ] **Passo 1: Escrever testes de categoria que falham**

```typescript
// tests/categories/crud.test.ts
test('createCategory cria categoria com user_id', async () => { ... })
test('getCategories retorna árvore hierárquica', async () => { ... })
test('deleteCategory com filhas lança erro a menos que cascade', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/categories/
```

- [ ] **Passo 3: Implementar server actions de categoria**

```typescript
// src/app/actions/categories/getCategories.ts
export async function getCategories(): Promise<CategoryWithChildren[]> {
  const user = await getUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id, parentId: null },
    include: { children: { include: { children: true } } },
    orderBy: { name: 'asc' },
  });
  return categories;
}

// src/app/actions/categories/createCategory.ts
export async function createCategory(input: CategoryInput) {
  const user = await getUser();
  return prisma.category.create({ data: { ...input, userId: user.id } });
}

// src/app/actions/categories/deleteCategory.ts
export async function deleteCategory(id: string, cascade = false) {
  const user = await getUser();
  const hasChildren = await prisma.category.count({ where: { parentId: id } });
  if (hasChildren && !cascade) throw new Error('Categoria tem filhas');
  return prisma.category.delete({ where: { id, userId: user.id } });
}
```

- [ ] **Passo 4: Criar componentes UI de categoria**

```typescript
// CategoryForm.tsx - React Hook Form + Zod, campos: name, type, icon, color, parentId
// CategoryTree.tsx - componente recursivo com drag-drop (opcional)
// CategorySelector.tsx - lista plana com indentação para hierarquia
```

- [ ] **Passo 5: Criar páginas de configurações**

```typescript
// /configuracoes/categorias - listar + modais create/edit/delete
// /configuracoes/instituicoes - similar para bancos/cartões
```

- [ ] **Passo 6: Rodar testes & commit**

```bash
pnpm test tests/categories/
git add -A && git commit -m "feat: CRUD categorias & instituições com hierarquia"
```

---

### Tarefa 3: Módulo Planejamento (Previsto)

**Arquivos:**
- Criar: `src/app/actions/planning/getPlannedItems.ts`, `createPlannedItem.ts`, `updatePlannedItem.ts`, `deletePlannedItem.ts`, `copyMonthPlanned.ts`, `importPlannedCsv.ts`
- Criar: `src/components/planning/PlannedItemForm.tsx`, `PlannedItemRow.tsx`, `PlannedList.tsx`, `MonthYearPicker.tsx`, `CopyMonthDialog.tsx`
- Criar: `src/app/(dashboard)/planejamento/[year]/[month]/page.tsx`
- Criar: `src/app/(dashboard)/planejamento/layout.tsx` (navegação mês)
- Testes: `tests/planning/crud.test.ts`, `tests/planning/recurrence.test.ts`, `tests/planning/copy-month.test.ts`

**Interfaces:**
- Consome: `prisma`, `getUser()`, `getCategories()` da Tarefa 2
- Produz: `getPlannedItems(month, year)`, `createPlannedItem(input)`, `copyMonthPlanned(fromMonth, fromYear, toMonth, toYear)`

- [ ] **Passo 1: Escrever testes de planejamento que falham**

```typescript
// tests/planning/crud.test.ts
test('createPlannedItem com recorrência MONTHLY cria registro único', async () => { ... })
test('getPlannedItems filtra por mês/ano', async () => { ... })

// tests/planning/recurrence.test.ts
test('recorrência mensal aplica a meses futuros dentro do endDate', async () => { ... })

// tests/planning/copy-month.test.ts
test('copyMonthPlanned copia apenas itens ativos, ajusta dayOfMonth para meses curtos', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/planning/
```

- [ ] **Passo 3: Implementar server actions de planejamento**

```typescript
// src/app/actions/planning/getPlannedItems.ts
export async function getPlannedItems(month: number, year: number) {
  const user = await getUser();
  return prisma.plannedItem.findMany({
    where: { userId: user.id, month, year, isActive: true },
    include: { category: true },
    orderBy: [{ type: 'asc' }, { category: { name: 'asc' } }],
  });
}

// src/app/actions/planning/createPlannedItem.ts
export async function createPlannedItem(input: PlannedItemInput) {
  const user = await getUser();
  // Validar dayOfMonth para mês/ano
  const maxDay = new Date(input.year, input.month, 0).getDate();
  const day = Math.min(input.dayOfMonth ?? 1, maxDay);
  return prisma.plannedItem.create({ data: { ...input, dayOfMonth: day, userId: user.id } });
}

// src/app/actions/planning/copyMonthPlanned.ts
export async function copyMonthPlanned(fromMonth: number, fromYear: number, toMonth: number, toYear: number) {
  const user = await getUser();
  const items = await prisma.plannedItem.findMany({
    where: { userId: user.id, month: fromMonth, year: fromYear, isActive: true },
  });
  const maxDay = new Date(toYear, toMonth, 0).getDate();
  return prisma.$transaction(
    items.map(item => prisma.plannedItem.create({
      data: {
        ...item,
        id: undefined,
        month: toMonth,
        year: toYear,
        dayOfMonth: Math.min(item.dayOfMonth ?? 1, maxDay),
      },
    }))
  );
}
```

- [ ] **Passo 4: Criar UI de Planejamento**

```typescript
// MonthYearPicker.tsx - dropdown com seletor ano + grade meses (como app referência)
// PlannedItemForm.tsx - descrição, valor, tipo (receita/despesa), categoria, recorrência, dayOfMonth
// PlannedList.tsx - agrupado por categoria, mostra badge recorrência, preview variação (opcional)
// CopyMonthDialog.tsx - seletores mês origem/destino, preview itens a copiar
```

- [ ] **Passo 5: Criar página Planejamento com navegação mês**

```typescript
// /planejamento/[year]/[month]/page.tsx - Server Component, busca dados, renderiza lista
// layout.tsx - MonthYearPicker no header, setas navegação (mês anterior/próximo)
```

- [ ] **Passo 6: Rodar testes & commit**

```bash
pnpm test tests/planning/
git add -A && git commit -m "feat: módulo planejamento com recorrência e cópia de mês"
```

---

### Tarefa 4: Módulo Controle (Realizado)

**Arquivos:**
- Criar: `src/app/actions/control/getTransactions.ts`, `createTransaction.ts`, `updateTransaction.ts`, `deleteTransaction.ts`, `markTransactionPaid.ts`, `importTransactionsCsv.ts`
- Criar: `src/components/control/TransactionForm.tsx`, `TransactionRow.tsx`, `TransactionList.tsx`, `TransactionFilters.tsx`, `VarianceBadge.tsx`
- Criar: `src/app/(dashboard)/controle/[year]/[month]/page.tsx`
- Criar: `src/app/(dashboard)/controle/layout.tsx`
- Testes: `tests/control/crud.test.ts`, `tests/control/variance.test.ts`, `tests/control/filters.test.ts`

**Interfaces:**
- Consome: `prisma`, `getUser()`, `getCategories()`, `getAccounts()` das Tarefas 1-2
- Produz: `getTransactions(month, year, filters)`, `createTransaction(input)`, `markTransactionPaid(id)`

- [ ] **Passo 1: Escrever testes de controle que falham**

```typescript
// tests/control/crud.test.ts
test('createTransaction com status PENDING', async () => { ... })
test('markTransactionPaid alterna status', async () => { ... })

// tests/control/variance.test.ts
test('getTransactions inclui comparação planejado para variação', async () => { ... })
test('cálculo variação: atual > planejado = estourou orçamento (vermelho)', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/control/
```

- [ ] **Passo 3: Implementar server actions de controle**

```typescript
// src/app/actions/control/getTransactions.ts
export async function getTransactions(month: number, year: number, filters?: TransactionFilters) {
  const user = await getUser();
  const where: Prisma.TransactionWhereInput = { userId: user.id, month, year };
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.accountId) where.accountId = filters.accountId;
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;

  const [transactions, planned] = await Promise.all([
    prisma.transaction.findMany({ where, include: { category: true, account: true }, orderBy: { date: 'desc' } }),
    prisma.plannedItem.findMany({ where: { userId: user.id, month, year, isActive: true } }),
  ]);

  // Calcular variação por categoria
  const plannedByCategory = planned.reduce((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] || 0) + Number(p.amount);
    return acc;
  }, {} as Record<string, number>);

  const actualByCategory = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  return transactions.map(t => ({
    ...t,
    variance: plannedByCategory[t.categoryId]
      ? ((Number(t.amount) - plannedByCategory[t.categoryId]) / plannedByCategory[t.categoryId]) * 100
      : null,
  }));
}

// src/app/actions/control/createTransaction.ts
export async function createTransaction(input: TransactionInput) {
  const user = await getUser();
  const month = input.date.getMonth() + 1;
  const year = input.date.getFullYear();
  return prisma.transaction.create({ data: { ...input, userId: user.id, month, year } });
}

// src/app/actions/control/markTransactionPaid.ts
export async function markTransactionPaid(id: string, status: TransactionStatus) {
  const user = await getUser();
  return prisma.transaction.update({ where: { id, userId: user.id }, data: { status } });
}
```

- [ ] **Passo 4: Criar UI de Controle**

```typescript
// TransactionForm.tsx - tipo, descrição, valor, categoria, conta, data, status, notas
// TransactionRow.tsx - swipe actions (editar, deletar, marcar pago), mostra badge variação
// VarianceBadge.tsx - badge verde "Economizou 15%", vermelho "Estourou 23%", cinza "No planejado"
// TransactionFilters.tsx - multi-select categoria, conta, status, tipo
```

- [ ] **Passo 5: Criar página Controle**

```typescript
// /controle/[year]/[month]/page.tsx - Server Component com TransactionList + Filters
// layout.tsx - MonthYearPicker compartilhado com planejamento
```

- [ ] **Passo 6: Rodar testes & commit**

```bash
pnpm test tests/control/
git add -A && git commit -m "feat: módulo controle com variação vs planejado"
```

---

### Tarefa 5: Contas & Cartões de Crédito

**Arquivos:**
- Criar: `src/app/actions/accounts/getAccounts.ts`, `createAccount.ts`, `updateAccount.ts`, `deleteAccount.ts`
- Criar: `src/components/accounts/AccountForm.tsx`, `AccountCard.tsx`, `AccountSelector.tsx`
- Criar: `src/app/(dashboard)/configuracoes/contas/page.tsx`
- Testes: `tests/accounts/crud.test.ts`, `tests/accounts/credit-card.test.ts`

**Interfaces:**
- Consome: `prisma`, `getUser()`, `getInstitutions()` da Tarefa 2
- Produz: `getAccounts()`, `createAccount(input)`, `updateAccount(id, input)`

- [ ] **Passo 1: Escrever testes de conta que falham**

```typescript
test('createAccount com tipo credit card exige closingDay/dueDay', async () => { ... })
test('getAccounts retorna currentBalance', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/accounts/
```

- [ ] **Passo 3: Implementar server actions de conta**

```typescript
// src/app/actions/accounts/getAccounts.ts
export async function getAccounts() {
  const user = await getUser();
  return prisma.account.findMany({
    where: { userId: user.id, isActive: true },
    include: { institution: true },
    orderBy: { type: 'asc' },
  });
}

// src/app/actions/accounts/createAccount.ts
export async function createAccount(input: AccountInput) {
  const user = await getUser();
  if (input.type === 'CREDIT_CARD' && (!input.closingDay || !input.dueDay)) {
    throw new Error('Cartão de crédito exige closingDay e dueDay');
  }
  return prisma.account.create({ data: { ...input, userId: user.id, currentBalance: input.initialBalance } });
}
```

- [ ] **Passo 4: Criar UI de Conta & página configurações**

```typescript
// AccountForm.tsx - campos dinâmicos baseados no tipo (cartão mostra closing/due day)
// AccountCard.tsx - mostra saldo, badge tipo, logo instituição
// /configuracoes/contas/page.tsx
```

- [ ] **Passo 5: Rodar testes & commit**

```bash
pnpm test tests/accounts/
git add -A && git commit -m "feat: contas & cartões de crédito com rastreamento saldo"
```

---

### Tarefa 6: Módulo Caixinhas (Metas)

**Arquivos:**
- Criar: `src/app/actions/caixinhas/getCaixinhas.ts`, `createCaixinha.ts`, `updateCaixinha.ts`, `deleteCaixinha.ts`, `addContribution.ts`, `getContributions.ts`
- Criar: `src/components/caixinhas/CaixinhaCard.tsx`, `CaixinhaForm.tsx`, `ContributionForm.tsx`, `CaixinhaProgress.tsx`
- Criar: `src/app/(dashboard)/caixinhas/page.tsx`, `src/app/(dashboard)/caixinhas/[id]/page.tsx`
- Testes: `tests/caixinhas/crud.test.ts`, `tests/caixinhas/contribution-auto-transaction.test.ts`, `tests/caixinhas/progress.test.ts`

**Interfaces:**
- Consome: `prisma`, `getUser()`, `getAccounts()`, `createTransaction()` das Tarefas 1, 4, 5
- Produz: `getCaixinhas()`, `createCaixinha(input)`, `addContribution(caixinhaId, amount, date)` → cria Contribution + Transaction(EXPENSE)

- [ ] **Passo 1: Escrever testes de caixinha que falham**

```typescript
// tests/caixinhas/crud.test.ts
test('createCaixinha com targetAmount e monthlyContribution', async () => { ... })

// tests/caixinhas/contribution-auto-transaction.test.ts
test('addContribution cria Contribution E Transaction(EXPENSE) no mês atual', async () => {
  const result = await addContribution(caixinhaId, 100, new Date());
  expect(result.contribution).toBeDefined();
  expect(result.transaction.type).toBe('EXPENSE');
  expect(result.transaction.caixinhaId).toBe(caixinhaId);
});

// tests/caixinhas/progress.test.ts
test('getCaixinhas retorna porcentagem progresso', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/caixinhas/
```

- [ ] **Passo 3: Implementar server actions de caixinha**

```typescript
// src/app/actions/caixinhas/addContribution.ts
export async function addContribution(caixinhaId: string, amount: number, date: Date, notes?: string) {
  const user = await getUser();
  const caixinha = await prisma.caixinha.findFirst({ where: { id: caixinhaId, userId: user.id } });
  if (!caixinha) throw new Error('Caixinha não encontrada');

  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return prisma.$transaction(async (tx) => {
    // 1. Criar Contribution
    const contribution = await tx.contribution.create({
      data: { caixinhaId, amount, date, month, year, notes },
    });

    // 2. Criar transação DESPESA (saída no controle)
    const transaction = await tx.transaction.create({
      data: {
        description: `Aporte: ${caixinha.name}`,
        amount,
        type: 'EXPENSE',
        categoryId: caixinha.categoryId, // precisa categoria para caixinhas ou usar default
        accountId: caixinha.accountId!,
        userId: user.id,
        date,
        month,
        year,
        status: 'COMPLETED',
        caixinhaId,
      },
    });

    // 3. Atualizar currentAmount da caixinha
    await tx.caixinha.update({
      where: { id: caixinhaId },
      data: { currentAmount: { increment: amount } },
    });

    return { contribution, transaction };
  });
}

// src/app/actions/caixinhas/getCaixinhas.ts
export async function getCaixinhas() {
  const user = await getUser();
  return prisma.caixinha.findMany({
    where: { userId: user.id, isActive: true },
    include: { account: true, contributions: { orderBy: { date: 'desc' }, take: 5 } },
    orderBy: { createdAt: 'desc' },
  });
}
```

- [ ] **Passo 4: Criar UI de Caixinha**

```typescript
// CaixinhaCard.tsx - progresso circular (atual/meta), botão aporte mensal, ícone, cor
// CaixinhaForm.tsx - nome, targetAmount, targetDate, monthlyContribution, ícone, cor, conta
// ContributionForm.tsx - valor, data, notas
// CaixinhaProgress.tsx - Recharts radial bar ou SVG customizado
```

- [ ] **Passo 5: Criar páginas Caixinha**

```typescript
// /caixinhas/page.tsx - grid de CaixinhaCards, FAB para nova
// /caixinhas/[id]/page.tsx - detalhe com histórico aportes, gráfico progresso
```

- [ ] **Passo 6: Rodar testes & commit**

```bash
pnpm test tests/caixinhas/
git add -A && git commit -m "feat: caixinhas com criação automática transação no aporte"
```

---

### Tarefa 7: Dashboard com Gráficos

**Arquivos:**
- Criar: `src/app/actions/dashboard/getDashboardSummary.ts`, `getMonthlyComparison.ts`, `getUpcomingBills.ts`
- Criar: `src/components/dashboard/KPICard.tsx`, `ComparisonChart.tsx`, `UpcomingBills.tsx`, `QuickActions.tsx`
- Criar: `src/app/(dashboard)/page.tsx` (raiz)
- Testes: `tests/dashboard/kpi.test.ts`, `tests/dashboard/chart-data.test.ts`

**Interfaces:**
- Consome: `prisma`, `getUser()`, `getPlannedItems()`, `getTransactions()`, `getAccounts()` das Tarefas 1-5
- Produz: `getDashboardSummary(month, year)`, `getMonthlyComparison(month, year)`

- [ ] **Passo 1: Escrever testes de dashboard que falham**

```typescript
test('getDashboardSummary calcula receita/despesa/saldo/variação', async () => { ... })
test('getMonthlyComparison retorna dados para Recharts', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/dashboard/
```

- [ ] **Passo 3: Implementar server actions de dashboard**

```typescript
// src/app/actions/dashboard/getDashboardSummary.ts
export async function getDashboardSummary(month: number, year: number) {
  const user = await getUser();
  const [planned, transactions, accounts] = await Promise.all([
    prisma.plannedItem.findMany({ where: { userId: user.id, month, year, isActive: true } }),
    prisma.transaction.findMany({ where: { userId: user.id, month, year, status: 'COMPLETED' } }),
    prisma.account.findMany({ where: { userId: user.id, isActive: true } }),
  ]);

  const plannedIncome = planned.filter(p => p.type === 'INCOME').reduce((s, p) => s + Number(p.amount), 0);
  const plannedExpense = planned.filter(p => p.type === 'EXPENSE').reduce((s, p) => s + Number(p.amount), 0);
  const actualIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const actualExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

  return {
    planned: { income: plannedIncome, expense: plannedExpense, balance: plannedIncome - plannedExpense },
    actual: { income: actualIncome, expense: actualExpense, balance: actualIncome - actualExpense },
    variance: {
      income: plannedIncome ? ((actualIncome - plannedIncome) / plannedIncome) * 100 : 0,
      expense: plannedExpense ? ((actualExpense - plannedExpense) / plannedExpense) * 100 : 0,
    },
    accounts: accounts.map(a => ({ id: a.id, name: a.name, balance: Number(a.currentBalance), type: a.type })),
  };
}

// src/app/actions/dashboard/getMonthlyComparison.ts
export async function getMonthlyComparison(month: number, year: number) {
  const user = await getUser();
  const categories = await prisma.category.findMany({ where: { userId: user.id } });
  const [planned, transactions] = await Promise.all([
    prisma.plannedItem.findMany({ where: { userId: user.id, month, year, isActive: true }, include: { category: true } }),
    prisma.transaction.findMany({ where: { userId: user.id, month, year, status: 'COMPLETED' }, include: { category: true } }),
  ]);

  return categories.map(cat => {
    const plannedCat = planned.filter(p => p.categoryId === cat.id).reduce((s, p) => s + Number(p.amount), 0);
    const actualCat = transactions.filter(t => t.categoryId === cat.id).reduce((s, t) => s + Number(t.amount), 0);
    return { category: cat.name, planned: plannedCat, actual: actualCat, variance: plannedCat ? ((actualCat - plannedCat) / plannedCat) * 100 : 0 };
  });
}
```

- [ ] **Passo 4: Criar UI Dashboard**

```typescript
// KPICard.tsx - label, valor, badge variação, ícone tendência
// ComparisonChart.tsx - Recharts BarChart com planejado vs atual agrupado por categoria
// UpcomingBills.tsx - cartões com data vencimento, valor (de accounts + transactions)
// QuickActions.tsx - botões: +Receita, +Despesa, +Caixinha (navegam para forms)
```

- [ ] **Passo 5: Criar página raiz**

```typescript
// /page.tsx - Server Component com MonthYearPicker, busca summary, renderiza grid
```

- [ ] **Passo 6: Rodar testes & commit**

```bash
pnpm test tests/dashboard/
git add -A && git commit -m "feat: dashboard com KPIs, gráfico comparação, contas a vencer"
```

---

### Tarefa 8: Navegação, Layout & Design Responsivo

**Arquivos:**
- Criar: `src/components/layout/Sidebar.tsx`, `MobileBottomNav.tsx`, `Header.tsx`, `MonthYearPicker.tsx`
- Criar: `src/app/(dashboard)/layout.tsx` (layout raiz com providers)
- Criar: `src/providers/QueryProvider.tsx`, `ThemeProvider.tsx`
- Criar: `src/app/globals.css` (Tailwind + estilos customizados)
- Testes: `tests/layout/responsive.test.ts` (Playwright)

**Interfaces:**
- Consome: Todas tarefas anteriores
- Produz: Layout responsivo com sidebar (desktop) / bottom nav (mobile), MonthYearPicker compartilhado

- [ ] **Passo 1: Escrever testes de layout que falham (Playwright)**

```typescript
// tests/layout/responsive.test.ts
test('mobile mostra bottom nav, desktop mostra sidebar', async ({ page }) => { ... })
test('MonthYearPicker muda mês na URL', async ({ page }) => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test:e2e tests/layout/
```

- [ ] **Passo 3: Implementar componentes de layout**

```typescript
// Sidebar.tsx - links navegação: Início, Planejamento, Controle, Caixinhas, Configurações
// MobileBottomNav.tsx - 5 ícones com labels, estado ativo
// Header.tsx - avatar usuário, MonthYearPicker, notificações
// MonthYearPicker.tsx - Popover com dropdown ano + grade 12 botões meses
```

- [ ] **Passo 4: Criar layout raiz com providers**

```typescript
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-base-100">
          <Sidebar />
          <main className="lg:ml-64 p-4">{children}</main>
          <MobileBottomNav />
        </div>
      </ThemeProvider>
    </QueryProvider>
  );
}
```

- [ ] **Passo 5: Rodar testes & commit**

```bash
pnpm test:e2e tests/layout/
git add -A && git commit -m "feat: layout responsivo com sidebar, bottom nav, seletor mês"
```

---

### Tarefa 9: Configuração PWA & Suporte Offline

**Arquivos:**
- Modificar: `next.config.js` (add next-pwa config)
- Criar: `public/manifest.json`, `public/sw.js` (custom se necessário), `public/icons/*`
- Criar: `src/components/pwa/InstallPrompt.tsx`, `OfflineIndicator.tsx`
- Criar: `src/lib/offline-queue.ts` (fila IndexedDB para mutações)
- Testes: `tests/pwa/offline-sync.test.ts`, `tests/pwa/manifest.test.ts`

**Interfaces:**
- Consome: Todas tarefas anteriores
- Produz: PWA instalável, service worker caching, fila mutações offline

- [ ] **Passo 1: Escrever testes PWA que falham**

```typescript
// tests/pwa/manifest.test.ts
test('manifest.json tem name, icons, display: standalone corretos', async () => { ... })
test('service worker registra em produção', async () => { ... })
```

- [ ] **Passo 2: Rodar testes para verificar falha**

```bash
pnpm test tests/pwa/
```

- [ ] **Passo 3: Configurar next-pwa & manifest**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    { urlPattern: /^https:\/\/.*\.supabase\.co\/.*/, handler: 'NetworkFirst', options: { cacheName: 'supabase-api' } },
    { urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/, handler: 'CacheFirst', options: { cacheName: 'images' } },
  ],
});
module.exports = withPWA(nextConfig);
```

```json
// public/manifest.json
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

- [ ] **Passo 4: Implementar fila offline**

```typescript
// src/lib/offline-queue.ts - IndexedDB com biblioteca idb
// Enfileira mutações (createTransaction, addContribution) quando offline
// Sincroniza no evento online, reprocessa fila, limpa no sucesso
```

- [ ] **Passo 5: Criar componentes PWA UI**

```typescript
// InstallPrompt.tsx - mostra banner "Instalar App" (evento beforeinstallprompt)
// OfflineIndicator.tsx - banner sutil "Você está offline. Alterações serão sincronizadas."
```

- [ ] **Passo 6: Rodar testes & commit**

```bash
pnpm test tests/pwa/
git add -A && git commit -m "feat: PWA com suporte offline, prompt instalação, background sync"
```

---

### Tarefa 10: Polimento, Acessibilidade & Preparação Deploy

**Arquivos:**
- Modificar: Todos componentes para ARIA, focus management, contraste cores
- Criar: `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/loading.tsx`
- Criar: `.github/workflows/ci.yml` (lint, typecheck, test, build)
- Criar: `vercel.json` (se necessário), `README.md`
- Testes: `tests/a11y/accessibility.test.ts` (axe-core), suite e2e completa

**Interfaces:**
- Consome: Todas tarefas anteriores
- Produz: App pronto produção com a11y, error boundaries, CI/CD

- [ ] **Passo 1: Auditoria acessibilidade & correções**

```bash
# Rodar axe-core em todas páginas
pnpm test:a11y
# Corrigir: focus outlines, aria-labels, contraste cores (WCAG AA), HTML semântico
```

- [ ] **Passo 2: Error boundaries & loading states**

```typescript
// src/app/error.tsx - UI erro graciosa com botão retry
// src/app/loading.tsx - skeleton loaders para cada página
// src/app/not-found.tsx - 404 amigável
```

- [ ] **Passo 3: Pipeline CI/CD**

```yaml
# .github/workflows/ci.yml
jobs:
  lint: pnpm lint
  typecheck: pnpm tsc --noEmit
  test: pnpm test
  test:e2e: pnpm test:e2e
  build: pnpm build
```

- [ ] **Passo 4: Suite e2e completa**

```bash
pnpm test:e2e
# Cobre: auth → planejamento → controle → caixinhas → dashboard → navegação mês → offline
```

- [ ] **Passo 5: Deploy Vercel + Supabase**

```bash
# Vercel: conectar repo, add env vars (DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
# Supabase: rodar migrações, habilitar RLS
```

- [ ] **Passo 6: Commit final & tag**

```bash
git add -A && git commit -m "chore: polimento, a11y, CI/CD, deploy ready"
git tag -a v1.0.0 -m "MVP release"
```

---

## Recomendação de Execução

**Recomendado: Subagent-driven development**

Porque:
- 10 tarefas com interfaces claras entre elas
- Schema banco (Tarefa 0) → Auth/RLS (Tarefa 1) → Categorias (Tarefa 2) → Planejamento (Tarefa 3) → Controle (Tarefa 4) → Contas (Tarefa 5) → Caixinhas (Tarefa 6) → Dashboard (Tarefa 7) → Layout (Tarefa 8) → PWA (Tarefa 9) → Polimento (Tarefa 10)
- Cada tarefa tem suite de testes independente
- Erro enviado em RLS ou cálculos financeiros custaria confiança/integridade dados
- Reviewer fresco por tarefa pega mismatches de interface cedo

**Total estimado tarefas:** 10 | **Commits estimados:** ~50+ | **Pronto para implementação**