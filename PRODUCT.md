# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Usuário principal:** membro de congregação (organização religiosa) em atividade de campo, quase sempre em pé, no celular, com uma mão e conexão instável. Ele abre o app para ver a designação do dia, localizar os endereços no mapa, registrar o que encontrou e devolver o card ao final.

**Outros públicos confirmados:**

- **Líderes (owner/admin)** — organizam o trabalho de campo: cadastram e corrigem endereços, criam cards, agendam eventos, gerenciam territórios, aprovam exclusões pendentes, convidam membros e configuram o programa semanal.
- **Superusuário da plataforma** — opera fora da organização: cria organizações, gera tokens de onboarding de owner, administra usuários e bloqueios.

## Product Purpose

O Direcciones_V3 centraliza o cadastro, a distribuição e o acompanhamento de endereços dentro de uma organização, transformando uma lista de lugares em trabalho de campo executável. Cada organização opera isolada, com seus próprios membros, endereços, cards, mapa, agenda e programa de reuniões.

**Sucesso:** a cobertura de campo designada é concluída — os cards atribuídos são trabalhados, os endereços são atualizados ou corrigidos em campo e o card volta com o registro do que aconteceu.

## Positioning

Um CRM de endereços genérico guarda contatos; o Direcciones_V3 fecha o ciclo operacional em volta do endereço: cadastro com GPS e foto → card atribuído a uma pessoa → rota no mapa → registro da visita e dos convites entregues → devolução com histórico de quem trabalhou. O que um concorrente não copia facilmente é essa continuidade entre endereço, designação, mapa e rotina semanal da organização, dentro de um PWA que continua útil sem sinal.

## Operating Context

- Trabalho de campo real: visitas a endereços em ruas e bairros, deslocamento entre pontos, uso do mapa para se orientar e registrar posição, tudo em mobile (~98%: iPhone, Moto G, Galaxy S, ~420 dpi) e conexão frequentemente lenta.
- **Card** é uma lista ordenada de endereços compilada por um admin e atribuída a um membro: representa o trabalho de campo designado para um período (`startDate`/`endDate`), com número, dono, responsável e histórico de eventos (atribuído, devolvido, transferido).
- **Convites entregues** por endereço e por ano, com tipos `CELEBRATION`, `CONVENTION` e `OTHER`.
- **Levantamento (survey):** mapa colaborativo de pins com estados pendente, sugerido, confirmado e cancelado.
- **Agenda:** eventos com data, hora, condutor, saída, tipo e território, com opções reutilizáveis por organização.
- **Reuniões:** programa semanal (meio de semana e fim de semana) espelhado do app Meeting via conexão por organização com token AES usado apenas no servidor; partes numeradas no padrão do impresso, relógio do programa, designações, leitura da Bíblia e limpeza por setor.
- **Gestão de pessoas e textos salvos** completam a rotina administrativa da organização.
- **Demo público** em `/demo` apresenta o produto com dados sintéticos de museus; não é evidência de uso real.

## Capabilities and Constraints

**Funcionalidades confirmadas**

- Multi-tenant por slug de organização; todo dado é filtrado por `organizationId`.
- CRUD de endereços com tipo, rua, número, complemento, bairro, cidade, coordenadas GPS, foto, nome do comércio e observações.
- Extração de EXIF da foto para preencher coordenadas; compressão no cliente e conversão HEIC→JPEG.
- Exclusão pendente com motivo obrigatório (3–500 caracteres, validado no servidor) e aprovação por admin.
- Cards com seletor de endereços ordenado por proximidade, atribuição, reatribuição, devolução e trilha de eventos.
- **Meus Cards** com mapa Mapbox, marcadores e camada de rota; pool de instâncias de mapa reutilizadas.
- Agenda mensal com exportação em PDF, eventos passados colapsados e destaque ao clicar no dia.
- Programa de reuniões com cartão "Próxima reunião" na home e exportação em PDF.
- Convites por token de uso único (`/join/[token]`) com entrada via Google OAuth como `member`.
- Painel de superusuário para organizações, usuários, banimentos e tokens de owner.
- PWA instalável, com service worker desabilitado em desenvolvimento.

**Restrições técnicas**

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Radix UI e Shadcn UI.
- Bun é o único gerenciador/runtime de pacotes; Biome é o único linter/formatter. Sem npm, ESLint ou Prettier.
- Arquitetura DDD por feature (`domain`, `application`, `infrastructure`, `ui`, `hooks`, `utils`, `types`).
- Mutações internas só via Server Actions tipadas; nenhuma rota de API para CRUD.
- Toda Server Action valida sessão e permissão em `lib/autorize.ts`; o `RoleGuard` no cliente é apenas UX.
- Upload de imagem só por URL pré-assinada no Cloudflare R2.
- PostgreSQL via Prisma 7; deploy na Vercel com pooler de conexão.

**Fatos explicitamente não decididos**

- Modelo comercial além do multi-tenant (planos, cobrança, limites por organização) não foi estabelecido.
- Nenhum padrão formal de acessibilidade (WCAG) foi acordado; existem apenas as exigências de uso real descritas abaixo.

## Brand Commitments

- Nome do produto: **Direcciones_V3** (interface e PWA usam "Direcciones"). Logo em `public/Logo.svg`.
- **Cor de destaque obrigatória `#ff6828`** — todas as outras cores devem combinar e contrastar com ela. O azul `#1c69d4` é reservado à identidade do módulo Reuniões.
- **Termos de domínio obrigatórios na UI:** `levantamento`, `card`, `saída`, `tipo`, `território`, `condutor`.
- Idioma padrão `pt` com interface completa em pt-BR e es, escolhida pelo usuário e persistida no perfil.
- Conforto visual em modo claro e escuro; o tema segue a preferência do sistema, com alternância manual.
- A sincronização com o app Meeting é funcionalidade real, mas **não** foi confirmada como compromisso durável de produto — pode ser revista sem violar o posicionamento.

## Evidence on Hand

- Código-fonte completo e funcional, com histórico de migrações de janeiro a outubro de 2026.
- Produto em produção com **poucas organizações reais** usando em campo.
- `README.md` (visão geral, stack, módulos, permissões), `prisma/schema.prisma` (modelo de dados real) e `AGENTS.md` (stack, arquitetura e segurança).
- `DESIGN.md` registrado no commit `ce84c35` — atualmente removido da árvore de trabalho — documenta os tokens do sistema visual vigente (acento `#ff6828`, azul de reuniões `#1c69d4`, tipografia Outfit, raios e espaçamento).
- Demo pública em `/demo` com dados sintéticos (museus brasileiros) — serve para demonstração, nunca como prova social.
- **Ausências que o trabalho futuro não pode preencher por invenção:** não há depoimentos, logos de clientes, números de uso, benchmarks, estudos de caso, prêmios ou preços documentados no repositório.

## Product Principles

1. **Campo primeiro.** Toda tela é usada em pé, no celular, com uma mão e conexão ruim; leveza, cache e offline são prioridade de produto. Se não funciona assim, não funciona.
2. **O trabalho é a unidade, não o registro.** O valor está no card trabalhado e devolvido; a interface deve mostrar progresso e pendências, não apenas dados.
3. **Dados confiáveis e auditáveis.** Endereços, pins e eventos têm autor, data e fluxo de confirmação — a confiança no registro é o valor do produto.
4. **Cada organização é um mundo fechado.** Isolamento de dados e permissões são produto, não detalhe técnico — e devem ser visíveis e tranquilizadores.
5. **Segurança no servidor.** Sessão e permissão são sempre revalidadas no servidor; o cliente nunca é fonte de verdade.

## Accessibility & Inclusion

- Público de aproximadamente 98% mobile, em aparelhos de densidade média (~420 dpi, iPhone, Moto G, Galaxy S).
- Alvos de toque de pelo menos 44px; gestos simples; uso com uma mão.
- Layout responsivo do mobile (~420 dpi) até desktop full-HD (1920px+).
- Suporte a tema claro/escuro seguindo a preferência do sistema, com alternância manual.
- Respeito a `safe-area-inset` (notch, ilha dinâmica, barra de gestos).
- Leitura confortável sob luz do dia e em movimento; contraste e tamanho de texto não podem depender de zoom.
