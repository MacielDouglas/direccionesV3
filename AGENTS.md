# AGENTS.md — Direcciones_V3

Diretrizes obrigatórias para qualquer agente que ler, criar ou modificar código neste repositório.

## Stack e Ferramentas

- **Runtime**: [Bun](https://bun.sh) — substitui o npm em 100% dos fluxos.
  - NUNCA use `npm`, `npx` ou `node` para instalar/rodar/gerenciar o projeto. Use `bun` e `bunx`.
  - Exemplos: `bun install`, `bun run dev`, `bunx prisma`, `bunx biome check`.
  - **Nunca gere, gaste ou comite `package-lock.json`**. O lockfile oficial é `bun.lock`.
- **Qualidade de código**: [Biome](https://biomejs.dev) — faz o papel de ESLint + Prettier.
  - NUNCA adicione ESLint, Prettier ou `eslint.config.*` no projeto.
  - Lint, formatação e organização de imports são feitos via Biome: `bunx biome check` e `bunx biome check --write`.
  - Todo código novo DEVE passar no Biome sem erros antes de ser considerado pronto.
- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions).

## Arquitetura — Domain-Driven Design (DDD)

Layout oficial orientado a bounded contexts. Cada feature é um contexto autossuficiente com camadas:

```
features/<feature>/
  ├─ domain/        # Entidades, regras de negócio, schemas Zod, constantes, tipos de domínio
  ├─ application/   # Use cases, Server Actions, serviços de aplicação (orquestração)
  ├─ infrastructure/# Persistência, integrações externas da feature
  ├─ ui/            # Componentes e telas React (presentation)
  ├─ hooks/         # Hooks de cliente da feature
  ├─ utils/         # Funções puras auxiliares
  └─ types/         # Tipos TypeScript de fronteira (DTOs)
```

- `features/` → contexts por modulo (addresses, agenda, cards, map, surveys, invitations, user, navigation).
- `domains/` → lógica transversal compartilhada (auth, member, organization).
- `infrastructure/` → integrações externas globais (auth, storage R2).
- `server/` → queries e actions exclusivas do servidor.
- `lib/` → singletons compartilhados (Prisma, auth, utilitários).
- `prisma/` → schema e migrações.

Regras:
- Fluxo de dados unidirecional: **UI → Server Action → Application → Domain/Infrastructure → Prisma → PostgreSQL**.
- Dependências apontam para dentro: `ui` → `application` → `domain`. `domain` não depende de mais nada.
- Regra de negócio vive em `domain/`, nunca no componente.
- Nenhuma rota de API para mutações internas — tudo via Server Actions tipadas.
- Nunca importe diretamente `lib/prisma` fora das camadas `application`/`infrastructure`/`server`.

## Segurança (prioridade crítica)

- **`.env` é proibido**: nunca leia, abra, imprima ou inclua variáveis de ambiente em resposta, log ou commit.
- Nunca exponha secrets em código, logs, console ou resposta ao usuário.
- Toda Server Action DEVE validar sessão e permissão (via `lib/autorize.ts`). Validação no servidor é a barreira definitiva — o `RoleGuard` no cliente é só UX.
- Valide TODA entrada com Zod antes de persistir.
- Nunca confie em dados vindos do cliente (IDs, slugs, role) sem revalidar no servidor.
- `NEXT_PUBLIC_*` é público por definição; demais variáveis ficam exclusivamente no servidor.
- Use URLs pré-assinadas para upload (R2) — nunca receba upload direto.

## Desempenho

- **Público de 98% mobile** (iPhone, Motorola Moto G, Samsung Galaxy S), densidade média **~420 dpi**, conexões frequentemente lentas. Lógica de listagem e carregamento deve ser assumida como lenta.
- Otimizar para **mobile-first**:
  - Lazy-load de código pesado (ex.: bundle do Mapbox só quando necessário).
  - Cache agressivo de imagens R2 e tiles Mapbox (via PWA/Workbox configurado em `next.config.ts`).
  - Compressão automática de uploads de imagem (R2) e conversão HEIC→JPEG.
  - Preferir componentes do servidor; hidratar apenas o necessário.
  - Evitar re-renders e bundles grandes; monitorar tamanho.
- Deve ser responsivo e agradável também em desktop full-HD: use breakpoints progressivos do Tailwind (mobile-first) — o alvo base é por volta de 420dpi, mas a UI precisa escalar bem até 1920px+.

## Mobile-first e UI

- Desenhar e validar primeiro em viewport móvel (base), depois melhorar em desktop com breakpoints `md`/`lg`/`xl`.
- Componentes de toque: alvos de pelo menos 44px, gestos simples.
- Respeitar preferência de tema (modo escuro via `next-themes`) e `safe-area-insets` quando relevante.
- Tailwind CSS 4, Radix UI, Shadcn UI. Não adicionar libs de UI sem necessidade.

## Comandos Padrão

| Comando                          | Descrição                              |
| -------------------------------- | -------------------------------------- |
| `bun install`                    | Instala dependências (gera `bun.lock`) |
| `bun run dev`                    | Dev server (Turbopack)                 |
| `bun run build`                  | Build de produção                      |
| `bun run start`                  | Servidor de produção                   |
| `bun run lint`                   | Biome check (lint + format)            |
| `bun run lint:fix`               | Biome check --write (auto-fix)         |
| `bunx prisma generate`           | Regenera o cliente Prisma              |
| `bunx prisma migrate dev`        | Cria e aplica migração                 |
| `bunx prisma migrate deploy`     | Aplica migrações em ambiente novo      |
| `bunx prisma studio`             | Interface do banco                     |
| `bun run typecheck`              | `tsc --noEmit`                         |

## Restrições de Ambiente

- **Nunca acessar a unidade `C:`** do sistema.
- **Nunca ler `.env`**.
- Qualquer decisão não coberta por este documento deve ser perguntada ao usuário antes de executar.