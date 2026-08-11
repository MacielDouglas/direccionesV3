# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Membros de uma congregação (organização religiosa) e seus líderes/administradores:

- **Líderes (owner/admin)** — organizam o trabalho de campo: cadastram endereços, criam cards atribuídos a membros, agendam eventos, gerenciam territórios e convidam novos membros.
- **Membros** — executam o trabalho de campo: visualizam seus cards, registram endereços visitados, marcam pins no levantamento e acompanham a agenda.

Uso primariamente em campo, fora do escritório, via celular.

## Product Purpose

Plataforma multi-tenant para registro, distribuição e acompanhamento de endereços dentro de organizações (congregações). Cada organização opera em contexto isolado: membros cadastram endereços com GPS e fotos, recebem listas curadas (cards) e contribuem em um levantamento de campo compartilhado. Sucesso = o membro em campo encontra o endereço certo, com a rota certa, mesmo com conexão ruim.

## Positioning

Trabalho de campo compartilhado: um só lugar onde a organização registra endereços, distribui o trabalho em cards atribuídos, planeja rotas no mapa e mantém um levantamento colaborativo — em vez de planilhas espalhadas ou mapas pessoais não sincronizados.

## Operating Context

- Quase todo o uso acontece em **mobile** (~98%: iPhone, Motorola Moto G, Samsung Galaxy S, densidade média ~420 dpi) com conexões frequentemente lentas.
- Trabalho em campo: captura de GPS no dispositivo, fotos de endereço, consulta de rota no mapa Mapbox, marcação de pins de visita.
- O app é PWA instalável e funcional offline, com cache agressivo de imagens R2 e tiles do mapa.
- Modo escuro segue a preferência do sistema, com alternância manual.

## Capabilities and Constraints

- **Idiomas** — aplicação com suporte padrão a **português (Brasil)** e **espanhol**; o usuário escolhe o idioma preferido.
- **Endereços** — CRUD com rua, número, complemento, bairro, cidade, tipo, GPS, fotos (R2 com compressão/HEIC→JPEG), extração de EXIF e fluxo de exclusão pendente (membro sinaliza, admin confirma).
- **Cards** — listas ordenadas de endereços criadas por admin e atribuídas a membros, com camada de rota no mapa; reatribuíveis e revogáveis.
- **Mapa** — Mapbox GL com pin de localização do usuário, seleção de GPS, marcadores de card e rota.
- **Agenda** — calendário mensal com eventos (data, hora, condutor, saída, tipo, território, info) e exportação PDF; criação/edição/exclusão por admin.
- **Levantamento (Survey)** — mapa colaborativo de pins com status (pendente, sugerido, confirmado, cancelado).
- **Convites** — tokens de uso único via link `/join/[token]`; novo usuário entra via Google OAuth como member.
- **Perfis** — owner, admin e member, com escopo por organização; validação de permissão no servidor em toda Server Action.
- **Multi-tenant** — isolamento de dados por organização com roteamento por slug.
- **Stack** — Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, Radix/Shadcn, Better Auth + Google OAuth, Prisma 7 + PostgreSQL, Mapbox GL 3, R2, PWA (Workbox), jsPDF, Fuse.js.
- Sem rotas de API para mutações internas — tudo via Server Actions tipadas; fluxo unidirecional UI → Action → Service → Prisma.

## Brand Commitments

- Nome **Direcciones_V3** e logo existente (`public/Logo.svg`).
- **Cor de destaque obrigatória `#ff6828`** — todas as outras cores devem combinar e contrastar com ela.
- **Termos de domínio específicos são obrigatórios** e devem permanecer na UI: `levantamento`, `card`, `saída`, `tipo`, `território`, `condutor`.
- Idioma da interface: **português (Brasil) e espanhol** — usuário escolhe o preferido.
- Conforto visual em modo claro e escuro; tema segue o sistema.

## Evidence on Hand

- `README.md` — visão geral, stack, arquitetura, módulos, permissões, PWA.
- `prisma/schema.prisma` — modelo de dados real (user, organization, member, address, card, agenda, survey, invite_token).
- `app/` e `features/` — implementação existente das rotas e módulos.
- `AGENTS.md` — diretrizes de stack, arquitetura e segurança do repositório.
- Não há testemunhos, casos de cliente, press ou benchmarks reais; não fabricar.

## Product Principles

1. **Campo primeiro**: a experiência é projetada para uso em campo no celular, sob conexão lenta — leveza, cache e offline são prioridade de produto.
2. **Distribuição clara do trabalho**: cards e atribuição definem quem visita o quê; a UI deve deixar o trabalho do membro óbvio.
3. **Dados confiáveis e auditáveis**: endereços, pins e eventos têm autor, data e fluxo de confirmação — a confiança no registro é o valor do produto.
4. **Colaboração por organização**: cada congregação tem contexto isolado; ninguém fora da organização vê os dados.
5. **Segurança no servidor**: sessão e permissão são sempre revalidadas no servidor; o cliente nunca é fonte de verdade.

## Accessibility & Inclusion

- Mobile-first: alvos de toque de pelo menos 44px, gestos simples.
- Responsivo do mobile (~420 dpi) até desktop full-HD (1920px+).
- Respeita preferência de tema (modo escuro) e safe-area insets.
