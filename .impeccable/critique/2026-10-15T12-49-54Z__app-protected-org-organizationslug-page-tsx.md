---
target: página home
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:D:\\Projetos\\direccionesV3_5\\app\\(protected)\\org\\[organizationSlug]\\page.tsx"
target_fingerprint: "sha256:3ec268e85c9a277bc9c6802a3c38744795f54295c31f20c0798bfa6a8e9b1783"
target_path: "D:\\Projetos\\direccionesV3_5\\app\\(protected)\\org\\[organizationSlug]\\page.tsx"
timestamp: 2026-10-15T12-49-54Z
slug: app-protected-org-organizationslug-page-tsx
---
# Critique — página Home (app/(protected)/org/[organizationSlug]/page.tsx + HomeDashboard + NextMeetingSection)

Method: dual-agent (A: ses_ec0654426ffeq6Y0FnEpv14utj · B: ses_ec06543f7ffewysOEfVco4UycV)

## Design Health Score

| # | Heurística | Nota | Achado-chave |
|---|-----------|------|--------------|
| 1 | Visibilidade do status | 2 | NextMeetingCard retorna null silencioso se !connected/erro |
| 2 | Mundo real | 3 | Rótulo de evento truncado e críptico (tipo ?? territorio ?? saida) |
| 3 | Controle e liberdade | 3 | Modal depende de um único X customizado |
| 4 | Consistência | 2 | Preto + laranja + azul competem na mesma coluna |
| 5 | Prevenção de erro | 2 | Falha de reunião some; eventos linkam para /agenda genérico |
| 6 | Reconhecimento | 2 | cardCount sem explicação; outra reunião escondida no modal |
| 7 | Flexibilidade | 1 | Sem atalho, busca, recentes ou lote |
| 8 | Estética minimalista | 2 | Hero text-5xl empurra "hoje" para baixo da dobra (~420dpi) |
| 9 | Recuperação de erro | 2 | Erro do Meeting vira null, sem mensagem nem ação |
| 10 | Ajuda | 1 | Zero ajuda contextual sobre card/território/saída |
| **Total** | | **20/40** | **Acceptable** |

## Veredito de especificidade

Parcialmente intercambiável. Vocabulário de domínio correto e Suspense isolado da reunião (decisão autoral para rede lenta). Composição genérica fintech. NOTA DE SÍNTESE: o hero preto + text-5xl + text-neutral-400 é linguagem incumbente cross-feature (agenda, addresses, my-cards usam o mesmo padrão) — mexer só na home cria inconsistência; eventual mudança deve ser sistêmica.

## Scan determinístico

Detector: clean (0 findings). Browser: skipped (sem automação de browser nesta sessão). O detector nada achou que a revisão perdeu e vice-versa em mecânica; hierarquia e IA estão fora do alcance dele.

## Impressão geral

Chegada que reconhece mas não orienta para a rua; meio ansioso (agenda genérica, reunião invisível); fim administrativo. Maior oportunidade: inverter a hierarquia para "onde preciso estar hoje".

## Pontos fortes

1. Streaming isolado da reunião (Suspense não bloqueia hero/agenda em rede lenta).
2. Domínio + i18n corretos (termos obrigatórios, plural, datas por locale).
3. Alvos 44px e foco visível nos CTAs principais.

## Priority Issues

- **[P1] Hierarquia invertida: campo abaixo da dobra** — agenda de hoje depois do hero de contagem. Fix: resumo de 1–3 próximos no topo, hero vira faixa compacta. (`/impeccable layout`)
- **[P1] Três sistemas visuais numa coluna** — bg-black + bg-brand + bg-meeting quebram Orange Action Rule e Flat-By-Default. Fix: unificar em bg-card/border/shadow-xs, uma única ação primária. (`/impeccable colorize`)
- **[P1] Linhas da agenda indistinguíveis e sem destino** — todo evento linka para /agenda genérico, duplo truncate colapsa território · saída · condutor. Fix: deep-link por evento, hora tabular fixa, subtítulo priorizando saída + hora. (`/impeccable clarify`)
- **[P2] Reunião falha em silêncio** — null quando !connected/erro. Fix: vazio explícito em vez de null. (`/impeccable harden`)

## Persona red flags

- **Alex**: sem atalho/busca/bulk; toggle midweek/weekend com aria-pressed em buttons soltos, verboso de teclado.
- **Sam**: links de evento sem focus-visible explícito; duplo truncate sem contexto no leitor; text-neutral-400 sobre bg-black e micro text-xs penalizam baixa visão/zoom.
- **Casey**: ação urgente (detalhe do evento) é linha fina no meio da tela; ver programação exige rolar até o fim; skeleton só na reunião.
- **Rafa (membro em campo, Moto G, 3G, sol)**: contagem não diz para onde ir; truncado + link genérico obriga carregar agenda inteira; micro text-[0.625rem] ilegível sob sol.

## Observações menores

- Welcome sem contexto da congregação (multi-tenant). Rótulo de hora duplica ruído. `· {partsLabel}` mistura duração/contagem na linha da hora. Cascata de 3 fetches no HomeDashboard (agregar no servidor).

## Perguntas

- O que justificaria manter a contagem de cartões como elemento mais pesado se a pergunta da rua é "onde preciso estar hoje e com quem saio?"
- Quanta identidade Direcciones (mapa, território, saída) a home precisa emprestar sem virar ruído para o membro apressado?
