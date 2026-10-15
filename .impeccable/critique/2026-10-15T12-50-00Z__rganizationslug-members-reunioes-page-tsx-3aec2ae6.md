---
target: página reuniões
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:D:\\Projetos\\direccionesV3_5\\app\\(protected)\\org\\[organizationSlug]\\(members)\\reunioes\\page.tsx"
target_fingerprint: "sha256:2d5d8563af43ca391ef756305a65908dcce45b0840a099bd7bc9f3821c632484"
target_path: "D:\\Projetos\\direccionesV3_5\\app\\(protected)\\org\\[organizationSlug]\\(members)\\reunioes\\page.tsx"
timestamp: 2026-10-15T12-50-00Z
slug: rganizationslug-members-reunioes-page-tsx-3aec2ae6
---
# Critique — página Reuniões (reunioes/page.tsx + MeetingWeekView + componentes)

Method: dual-agent (A: ses_ec06543d8ffe95vycD3VZyehIw · B: ses_ec06543b2ffePVyQ0BvpiprQtw)

## Design Health Score

| # | Heurística | Nota | Achado-chave |
|---|-----------|------|--------------|
| 1 | Visibilidade do status | 3 | busy único no form admin mostra "saving" no refresh |
| 2 | Mundo real | 3 | Termos ok; sem jargão bloqueante |
| 3 | Controle e liberdade | 2 | window.confirm destrutivo; sem cancelar navegação |
| 4 | Consistência | 2 | Mix lucide + react-icons com pesos diferentes |
| 5 | Prevenção de erro | 2 | Sem validação inline/teste de conexão antes de salvar |
| 6 | Reconhecimento | 2 | truncate + title esconde nomes no touch |
| 7 | Flexibilidade | 1 | Só setas sequenciais, sem salto nem deep-link; estado morre no refresh |
| 8 | Estética minimalista | 3 | 3 camadas de controle antes do conteúdo; 3 linhas por parte |
| 9 | Recuperação de erro | 2 | navError sem retry, texto miúdo sobre azul |
| 10 | Ajuda | 1 | notConnected sem CTA; token sem "onde obter" |
| **Total** | | **22/40** | **Acceptable** |

## Veredito de especificidade

Núcleo autorado (espelho do impresso: numeração oficial, relógio +1min, framing sem número, cores por seção, fallback es), invólucro genérico (cards CRUD, form URL+token indistinguível). CORREÇÕES DE SÍNTESE (achados do agente descartados após verificação no código): (1) `/president/i` CASA com "presidente" — o substring "president" existe nas duas línguas, sem bug; (2) a aba ativa NÃO reseta ao trocar de semana — existe fallback `effectiveKind`; (3) `text-[#5b5b5b]` é tom pinado no DESIGN.md com override dark — exceção intencional documentada, não defeito.

## Scan determinístico

Detector: clean (0 findings). Browser: skipped (sem automação de browser nesta sessão).

## Impressão geral

" Achei minha semana" morno no header azul, vale de desconfiança no erro de navegação, fim burocrático no fetchedAt técnico. Maior oportunidade: abrir direto no "esta reunião" e tratar a semana como contexto, não como portão.

## Pontos fortes

1. Fidelidade ao impresso + relógio calculado (RowTime tabular escaneável).
2. Identidade meeting-blue com contraste cuidado, 44px, foco consistente, skeleton espelha layout.
3. Estados honestos (role=alert + retry na página; fallback mantém semana anterior).

## Priority Issues

- **[P1] Nomes e subtítulos amputados pelo truncate** — max-w-[45%] + truncate cortam "quem faz o quê", title não existe no touch. Fix: wrap em 2 linhas para nomes, subtítulo com wrap por padrão. (`/impeccable clarify`)
- **[P1] Navegação só sequencial e sem estado endereçável** — N taps para N semanas, selectedStart morre no refresh. Fix: seletor de semana + deep-link ?week=YYYY-MM-DD. (`/impeccable shape`)
- **[P1] Erro de navegação sem recuperação** — navError genérica miúda, sem retry, usuário pode achar que a semana errada é a certa. Fix: alert com Tentar de novo (goToWeek atual) + manter voltar visível. (`/impeccable harden`)
- **[P2] Form admin opaco + window.confirm** — sem "onde obter token", busy único mente, confirm quebra a11y/mobile. Fix: validação inline, estados separados, AlertDialog Radix. (`/impeccable onboard`)
- **[P2] Mix de ícones e offsets de sheet divergentes** — lucide + Fa* com pesos distintos; só uma variante de sheet tem offset da tab bar. Fix: unificar set e offsets. (`/impeccable colorize`)

## Persona red flags

- **Alex**: sem busca/deep-link no programa; 4 taps para 4 semanas atrás com tela esmaecida bloqueante.
- **Sam**: RowTime sem label; truncate+title invisível sem foco; tabs com aria-pressed dentro de fieldset (deveria ser tablist); navError text-xs branco sobre azul em risco de contraste.
- **Casey**: setas no topo fora da thumb-zone; pills lado a lado com gap apertado; interrupção perde selectedStart (sem persistência nem anúncio do fim do load).
- **Marta (membro em campo, Moto G, 3G, sol)**: "que horas + onde + quem" em 5s vs subtítulo cortado + hora miúda; sem sinal de frescor offline; nomes duplos da limpeza estouram.

## Observações menores

- Redirect silencioso do admin para non-owner. Normalização de baseUrl duplicada servidor/cliente. Título do sheet pode cortar sem clamp. `title=""` vazio possível em namesTitle. Lista de semanas vazia esconde setas sem feedback. "--:--" sem label acessível.

## Perguntas

- Se a tarefa em campo é "minha parte é quando/com quem?", por que o header da semana e as pills vêm antes do MeetingPanel em vez de abrir direto nesta reunião?
- O que tornaria a superfície inconfundivelmente "semana de reunião" — basta o número inline e o relógio, ou falta um pico editorial (tema, cântico de abertura) que justifique o azul como identidade?
