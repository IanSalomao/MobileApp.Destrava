<!--
Preencha a descrição e marque os itens da Definition of Done (DoD).
Deixe marcado só o que realmente foi feito; use "N/A" nos itens que não se aplicam a este PR.
-->

## O que muda

<!-- Resumo objetivo da mudança e do porquê. -->

## Requisitos atendidos

<!-- Cite os códigos do README, ex.: RF09, RNF01. "N/A" se for infra/chore. -->

## Como testar

<!-- Passos para validar manualmente (telas, fluxo, dados de seed usados). -->

## Tipo de mudança

- [ ] Feature
- [ ] Correção de bug
- [ ] Refatoração / chore
- [ ] Mudança de banco (migração)
- [ ] Documentação

---

## Definition of Done

### Qualidade (roda na CI)

- [ ] `npm run lint` passa
- [ ] `npm run typecheck` passa
- [ ] `npm run format:check` passa (ou rodei `npm run format`)
- [ ] `npm run test` passa
- [ ] Cobri a mudança com teste (api/hook/componente ou função pura), ou justifiquei a ausência

### Arquitetura e convenções

- [ ] Segui a organização por feature: só `features/*/api.ts` fala com o Supabase; regra de tela no hook; a tela (`app/`) só compõe
- [ ] Usei tokens de `@/theme` nos estilos (sem cor/espaçamento solto) e o alias `@/` nos imports
- [ ] Código, nomes de tabela/coluna, rotas e commits em inglês; UI, comentários e docs em pt-BR
- [ ] Nenhuma lib nova com código nativo fora do Expo Go (ou abri como development build e justifiquei)

### Banco de dados (se houve mudança de schema)

- [ ] A mudança foi por migração (`npm run db:migration`), nunca pelo painel
- [ ] Rodei `npm run db:reset` (valida do zero) e `npm run db:types`; commitei a migração e o `database.types.ts` juntos
- [ ] Tabela nova nasce com RLS habilitado e políticas explícitas na mesma migração
- [ ] Rodei `npx supabase db advisors --local` e `npx supabase db lint --local --schema public,private` sem alertas novos

### Segurança e LGPD

- [ ] Regras de acesso estão no backend (RLS/Edge Function), não só escondidas na UI
- [ ] Não commitei `.env` nem segredos; no app, só variáveis `EXPO_PUBLIC_*` com chaves públicas
- [ ] Dados sensíveis respeitados: documentos em bucket privado, dados de menores restritos ao responsável, localização arredondada, CPF só para o dono
- [ ] Permissões do sistema pedidas só quando necessárias, com o motivo explicado antes (RNF07)
