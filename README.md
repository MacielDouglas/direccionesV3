# Plataforma multi-tenant de gerenciamento de endereços para organizações
<div align="center">

<img src="public/Logo.svg" alt="Direcciones_V3 Logo" width="80" />

# Direcciones_V3

**Plataforma multi-tenant de gerenciamento de endereços para organizações**

</div>

---

## Visão Geral

**Direcciones_V3** é uma aplicação web full-stack multi-tenant para cadastro e compartilhamento de endereços dentro de organizações. Foi desenvolvida para grupos de pessoas — equipes, comunidades ou qualquer organização — que precisam de uma forma centralizada e estruturada de registrar, distribuir e acompanhar endereços relevantes para o seu trabalho.

Cada organização opera em seu próprio contexto isolado. Os membros pertencem a uma organização, podem cadastrar endereços com coordenadas GPS e fotos, e recebem listas curadas de endereços chamadas **cards**. Um módulo de mapa interativo, agenda e levantamento de campo complementam o cadastro principal, tornando o Direcciones_V3 uma plataforma completa de operações em campo, acessível de qualquer dispositivo.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Perfis e Permissões](#perfis-e-permissões)
- [Módulos Principais](#módulos-principais)
- [PWA e Suporte Offline](#pwa-e-suporte-offline)
- [Banco de Dados e Migrações](#banco-de-dados-e-migrações)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Executar](#como-executar)
- [Deploy](#deploy)
- [Licença](#licença)

---

## Funcionalidades

- **Organizações multi-tenant** — dados isolados por organização com roteamento baseado em slug
- **Cadastro de endereços** — CRUD completo com GPS, fotos, tipo de endereço e fluxo de exclusão pendente
- **Cards** — listas curadas de endereços criadas por admins e atribuídas a membros
- **Mapas interativos** — integração com Mapbox GL para visualização de endereços, captura de GPS e camadas de rota
- **Agenda** — calendário compartilhado para agendamento de eventos dentro da organização
- **Levantamento de campo (Survey)** — mapa colaborativo onde membros marcam com pins os locais visitados
- **Sistema de convites** — links de convite baseados em tokens para admitir novos membros
- **Controle de acesso por perfil** — níveis owner, admin e member com permissões granulares
- **Login com Google** — autenticação em um clique via Better Auth
- **Armazenamento de imagens** — R2 (compatível com S3 da Cloudflare) com URLs de upload pré-assinadas e compressão automática
- **PWA** — instalável e funcional offline com estratégias de cache agressivas para imagens e tiles de mapa
- **Modo escuro** — segue a preferência do sistema com alternância manual
- **Exportação em PDF** — dados de agenda e endereços exportáveis via jsPDF
- **Busca inteligente** — pesquisa de endereços no lado cliente com Fuse.js

---

## Arquitetura

O Direcciones_V3 adota uma arquitetura **feature-sliced** sobre o App Router do Next.js. Cada domínio é autossuficiente, com seu próprio schema, serviço, actions, hooks e componentes de UI.

```
app/                  → Segmentos de rota do Next.js (público / protegido)
features/             → Módulos de domínio (addresses, agenda, cards, map, surveys…)
  └─ <feature>/
       ├─ application/   Server Actions e serviços
       ├─ domain/        Schemas Zod e constantes
       ├─ hooks/         Hooks React no lado cliente
       ├─ types/         Tipos TypeScript
       ├─ ui/            Componentes React e telas
       └─ utils/         Funções utilitárias puras
domains/              → Lógica de domínio transversal (auth, member, organization)
infrastructure/       → Integrações externas (auth, armazenamento R2)
server/               → Queries e actions exclusivas do servidor
lib/                  → Singletons compartilhados (Prisma, auth, utilitários)
prisma/               → Schema e migrações
```

O fluxo de dados é estritamente unidirecional: **UI → Server Action → Service → Prisma → PostgreSQL**. Nenhuma rota de API é usada para mutações internas — tudo passa por Server Actions tipadas do Next.js.

---

## Stack Tecnológica

| Camada         | Tecnologia                                    |
| -------------- | --------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)            |
| Linguagem      | TypeScript 5                                  |
| Interface      | React 19, Tailwind CSS 4, Radix UI, Shadcn UI |
| Autenticação   | Better Auth 1.4 + Google OAuth                |
| Banco de Dados | PostgreSQL (via driver `pg`)                  |
| ORM            | Prisma 7 com `@prisma/adapter-pg`             |
| Mapas          | Mapbox GL 3                                   |
| Armazenamento  | Cloudflare R2 (compatível com AWS S3)         |
| Formulários    | React Hook Form + Zod 4                       |
| PWA            | `@ducanh2912/next-pwa` (Workbox)              |
| PDF            | jsPDF 4                                       |
| Busca          | Fuse.js 7                                     |
| Hospedagem     | Vercel                                        |

---

## Estrutura do Projeto

```
direcciones-v3/
├── app/
│   ├── (protected)/              # Rotas autenticadas
│   │   ├── org/[organizationSlug]/
│   │   │   ├── (admin)/admin/    # Páginas exclusivas para owner/admin
│   │   │   │   ├── agenda/
│   │   │   │   ├── cards/
│   │   │   │   ├── invitations/
│   │   │   │   ├── organizations/
│   │   │   │   └── users/
│   │   │   └── (members)/        # Páginas para todos os membros
│   │   │       ├── addresses/
│   │   │       ├── agenda/
│   │   │       ├── my-cards/
│   │   │       ├── surveys/
│   │   │       └── user/
│   │   └── organizations/        # Seletor de organização
│   ├── (public)/login/           # Página de autenticação pública
│   ├── api/                      # Upload/exclusão de arquivos + handler do Better Auth
│   └── join/[token]/             # Aceitação de convite
│
├── features/
│   ├── addresses/                # CRUD de endereços, GPS, upload de imagem
│   ├── agenda/                   # Eventos do calendário
│   ├── cards/                    # Listas de endereços (cards)
│   ├── map/                      # Componentes e provedores Mapbox
│   ├── surveys/                  # Mapa compartilhado de pins
│   ├── invitations/              # Sistema de convite por token
│   └── user/                     # Gerenciamento de perfil
│
├── domains/
│   ├── auth/
│   ├── member/
│   └── organization/
│
├── infrastructure/
│   ├── auth/                     # Sessão e mapeamento de perfis
│   └── storage/                  # Serviço R2 (URLs pré-assinadas)
│
├── lib/
│   ├── auth.ts                   # Instância servidor do Better Auth
│   ├── auth-client.ts            # Instância cliente do Better Auth
│   ├── prisma.ts                 # Singleton do Prisma
│   └── autorize.ts               # Helpers de autorização
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── public/
    ├── Logo.svg
    └── …arquivos estáticos
```

---

## Perfis e Permissões

O Direcciones_V3 utiliza um sistema de três perfis com escopo por organização.

| Capacidade                             | Owner | Admin | Membro |
| -------------------------------------- | :---: | :---: | :----: |
| Criar / excluir organização            |  ✅   |  ❌   |   ❌   |
| Gerenciar configurações da organização |  ✅   |  ✅   |   ❌   |
| Convidar e remover membros             |  ✅   |  ✅   |   ❌   |
| Criar / editar / excluir cards         |  ✅   |  ✅   |   ❌   |
| Atribuir cards a membros               |  ✅   |  ✅   |   ❌   |
| Criar / editar eventos na agenda       |  ✅   |  ✅   |   ❌   |
| Excluir eventos da agenda              |  ✅   |  ✅   |   ❌   |
| Visualizar todos os endereços          |  ✅   |  ✅   |   ✅   |
| Criar / editar próprios endereços      |  ✅   |  ✅   |   ✅   |
| Solicitar exclusão de endereço         |  ✅   |  ✅   |   ✅   |
| Visualizar próprios cards              |  ✅   |  ✅   |   ✅   |
| Visualizar agenda                      |  ✅   |  ✅   |   ✅   |
| Adicionar pins no levantamento         |  ✅   |  ✅   |   ✅   |

A validação de perfis ocorre no lado servidor em cada Server Action via `lib/autorize.ts`. Componentes `<RoleGuard>` no lado cliente ocultam elementos da interface, mas as verificações no servidor são a barreira definitiva de segurança.

---

## Módulos Principais

### Endereços

A entidade central da aplicação. Cada endereço pertence a uma organização e pode conter:

- Rua, número, apartamento, cidade e observações em texto livre
- Tipo de endereço (residencial, comercial, etc.) com ícone representativo
- Coordenadas GPS capturadas pelo dispositivo ou selecionadas no mapa Mapbox
- Uma ou mais fotos armazenadas no R2 com compressão automática e conversão de HEIC para JPEG via `browser-image-compression` e `heic2any`
- Extração de metadados EXIF (`exifr`) para preencher automaticamente as coordenadas a partir da foto
- Fluxo de **exclusão pendente** — membros sinalizam endereços para exclusão e admins confirmam

As páginas de endereços suportam busca inteligente no cliente (Fuse.js) e paginação no servidor.

### Cards

Um **card** é uma lista ordenada de endereços compilada por um admin e atribuída a um ou mais membros. Os cards representam o trabalho de campo designado a um membro para um determinado período.

- Admins criam cards, adicionam endereços usando um seletor ordenado por proximidade e os atribuem a membros
- Membros visualizam seus cards ativos em **Meus Cards**, com um mapa Mapbox interativo mostrando todos os endereços e uma camada de rota
- Admins podem reatribuir ou revogar um card a qualquer momento

### Mapa

O módulo de mapa é construído em torno de um provedor `MapboxMap` baseado em pool (`mapPool.ts`) que reutiliza instâncias de mapa para evitar custos de reinicialização durante a navegação. As principais camadas incluem:

- `UserLocationLayer` — ponto de GPS ao vivo com anel de precisão
- `SelectLocationLayer` — pin arrastável para captura de GPS de endereço
- `CardAddressesLayer` — marcadores de endereços de um card
- `RouteLayer` — polilinha de rota ordenada conectando os endereços do card
- `SelectableAddressesLayer` — seleção múltipla para criação de cards

O `GlobalMapProvider` garante um único carregamento do CSS do Mapbox em toda a aplicação e carrega o bundle GL pesado de forma lazy apenas quando um mapa é renderizado pela primeira vez.

### Agenda

Um calendário com visão mensal para agendamento de eventos da organização. Funcionalidades:

- Navegação entre meses com `useTransition` para feedback imediato
- Clique no dia para destaque — clicar em um dia no calendário rola e destaca o evento correspondente na lista
- Eventos passados colapsados por padrão com prévia em chips
- Criação e exclusão de eventos exclusiva para admins
- Exportação da lista mensal de eventos em PDF via jsPDF

### Levantamento de Campo (Survey)

Um mapa Mapbox compartilhado e colaborativo onde todos os membros da organização podem adicionar pins para marcar locais que já visitaram pessoalmente. Os pins são armazenados por organização e visíveis para todos os membros. Admins podem cancelar ou remover pins. O módulo usa uma declaração de tipo personalizada `survey.window.d.ts` para bindings de eventos do mapa.

### Convites

Admins geram tokens de convite que produzem URLs únicas de entrada (`/join/[token]`). Quando um novo usuário acessa o link, ele se autentica via Google OAuth e é automaticamente adicionado à organização com o perfil `member`. Os tokens são de uso único e excluídos em cascata quando o membro associado sai da organização.

---

## PWA e Suporte Offline

O Direcciones_V3 é distribuído como Progressive Web App em produção. O service worker é gerado pelo Workbox via `@ducanh2912/next-pwa` e está **desabilitado em desenvolvimento** para evitar problemas de cache desatualizado durante o desenvolvimento.

### Estratégia de Cache

| Recurso                          | Estratégia     | Validade               |
| -------------------------------- | -------------- | ---------------------- |
| Imagens R2 (`pub-…r2.dev`)       | `CacheFirst`   | 30 dias / 200 entradas |
| Tiles Mapbox (`api.mapbox.com`)  | `CacheFirst`   | 7 dias / 500 entradas  |
| Rotas de API internas (`/api/*`) | `NetworkFirst` | 1 hora / 100 entradas  |

A estratégia `CacheFirst` agressiva para imagens R2 e tiles do Mapbox garante que o app permaneça utilizável em condições de baixa conectividade em campo, sem precisar baixar novamente os assets já armazenados.

---

## Banco de Dados e Migrações

O Direcciones_V3 usa **PostgreSQL** acessado via Prisma com o adaptador edge-compatível `@prisma/adapter-pg`.

As migrações são gerenciadas com `prisma migrate` e versionadas em `prisma/migrations/`. O histórico reflete a evolução do produto:

| Migração   | Alteração                                                   |
| ---------- | ----------------------------------------------------------- |
| `20260129` | Schema inicial (usuários, organizações, endereços, membros) |
| `20260224` | Adição do campo `city` nos endereços                        |
| `20260304` | Adição de `lastActiveAt` nos membros                        |
| `20260304` | Adição da flag `pendingDeletion` nos endereços              |
| `20260305` | Adição de número do card e relacionamento com organização   |
| `20260312` | Adição de pins de levantamento com status                   |
| `20260318` | Adição de eventos de agenda e campos estendidos             |
| `20260319` | Adição de usuários convidados e cascade do token de convite |

Para aplicar as migrações em um ambiente novo:

```bash
npx prisma migrate deploy
```

Para regenerar o cliente Prisma após alterações no schema:

```bash
npx prisma generate
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto. **Nunca comite secrets no repositório.**

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@host:5432/nome_do_banco"

# Better Auth
BETTER_AUTH_SECRET="seu-secret-aqui"
BETTER_AUTH_URL="https://seu-dominio.com"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# Cloudflare R2 (compatível com S3)
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="sua-access-key"
R2_SECRET_ACCESS_KEY="seu-secret-key"
R2_BUCKET_NAME="nome-do-bucket"
R2_PUBLIC_URL="https://pub-<hash>.r2.dev"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk.seu-token-publico-mapbox"
```

> Todas as variáveis `NEXT_PUBLIC_*` são expostas no bundle do navegador. Mantenha todas as outras variáveis exclusivamente no servidor.

---

## Como Executar

### Pré-requisitos

- **Node.js** ≥ 20.x
- Instância **PostgreSQL** (local ou remota)
- Bucket no Cloudflare R2
- Conta no Mapbox (o plano gratuito é suficiente para desenvolvimento)
- Projeto no Google Cloud com credenciais OAuth 2.0

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/sua-org/direcciones.git
cd direcciones

# 2. Instale as dependências (o cliente Prisma é gerado automaticamente via postinstall)
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Execute as migrações do banco de dados
npx prisma migrate deploy

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

### Scripts Disponíveis

| Comando                  | Descrição                                          |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`            | Inicia o servidor de desenvolvimento com Turbopack |
| `npm run build`          | Build de produção                                  |
| `npm run start`          | Inicia o servidor de produção                      |
| `npm run lint`           | Executa o ESLint                                   |
| `npx prisma studio`      | Abre a interface gráfica do banco de dados         |
| `npx prisma migrate dev` | Cria e aplica uma nova migração                    |

---

## Deploy

O Direcciones_V3 está hospedado na **Vercel**.

### Configuração na Vercel

1. Importe o repositório no painel da Vercel
2. Defina todas as variáveis de ambiente da seção [Variáveis de Ambiente](#variáveis-de-ambiente) em **Project Settings → Environment Variables**
3. Certifique-se de que o banco de dados PostgreSQL está acessível pelas funções serverless da Vercel — use um connection pooler como **PgBouncer** ou o **pooler do Supabase** em produção
4. Faça o deploy — a Vercel executa automaticamente `npm run build` e `prisma generate` via o script `postinstall`

### Observações de Build

- O service worker da PWA é registrado apenas em `NODE_ENV=production`
- A otimização de imagens está configurada para AVIF e WebP com TTL mínimo de cache de 60 segundos
- `compress: true` habilita gzip/brotli na camada do Next.js
- `poweredByHeader: false` remove o header `X-Powered-By` das respostas por segurança

---

## Licença

Distribuído sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais informações.
