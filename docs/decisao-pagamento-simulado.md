# Decisão: pagamento SIMULADO na entrega

**Projeto:** Destrava · **Task:** SUB-01 · **Decisão de referência:** D-01 · **Autora:** Rebeca Batista · **Data:** 16/10/2026 · **Status:** Decidido

## 1. Contexto e decisão

A assinatura mensal do professor (R$ 29,90/mês, com 7 dias grátis) é a principal fonte de receita do Destrava (Business Model Canvas, RF13). Na entrega de **30/11/2026**, o fluxo de assinatura funciona de ponta a ponta, mas **a cobrança é simulada**: nenhum valor é cobrado de ninguém e nenhum gateway ou loja é acionado. A forma real de cobrar fica documentada aqui para o pós-entrega.

**Por que simular:** Apple e Google podem exigir que assinaturas digitais sejam compradas pela loja, o que muda tela e backend. Essa escolha depende de conta de desenvolvedor e publicação nas lojas, que ficam fora do escopo da entrega (somente APK Android). Simular permite entregar e demonstrar as regras de negócio sem esse bloqueio.

## 2. O que é simulado e o que é real

| Real na entrega                                                            | Simulado na entrega                                                                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Tela de assinatura com plano, "7 dias grátis" e data da 1ª cobrança        | Cobrança financeira (nenhum débito, nenhuma fatura)                                                                    |
| Início do trial (`start_trial`), idempotente                               | Confirmação de pagamento por gateway ou loja                                                                           |
| Estados da assinatura gravados no Supabase                                 | Eventos `active`, `past_due` e `canceled`, forçados pelo simulador de demonstração (SUB-05) ou por SQL manual (SUB-10) |
| Regra de visibilidade na busca conforme o estado (domínio testado, SUB-02) | —                                                                                                                      |

**Nenhum dado de cartão é coletado, exibido ou armazenado**, nem no app, nem no Supabase, nem em log. A tela de assinatura (SUB-03) não tem formulário de cartão e informa que se trata de ambiente de demonstração. _(O protótipo original previa um formulário de cartão na tela "07 - Assinatura / Pagamento". Esse campo é removido na atualização do Figma, task UI-06.)_

## 3. Como o trial e o status são controlados

O status vive na tabela `subscriptions` do Supabase, e a regra é uma função pura do domínio, com relógio injetável (SUB-02):

| Status                 | Significado                                                             | Professor visível na busca?                                   |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| `trial`                | 7 dias a partir de `started_at` (`trial_ends_at = started_at + 7 dias`) | Sim                                                           |
| `active`               | Assinatura paga em dia (simulada)                                       | Sim                                                           |
| `past_due`             | Pagamento em atraso (simulado)                                          | Sim, durante a carência; depois some (D-05, proposta: 3 dias) |
| `canceled` / `expired` | Cancelada pelo professor, ou trial encerrado sem conversão              | Não                                                           |

Somente o backend altera o status (RPC/Edge Function e RLS). O app apenas lê. Assim, o professor não consegue se auto-ativar.

## 4. Caminho pós-entrega (cobrança real)

O Supabase continua como **fonte da verdade** do status. Só a origem dos eventos muda, então o domínio e a regra de visibilidade não precisam ser reescritos.

- **Opção A, compra pela loja (recomendada para publicar no Google Play/App Store):** o app usa **RevenueCat** sobre as compras dentro do app das lojas (In-App Purchases). A loja cobra e guarda o cartão. O RevenueCat envia um _webhook_ a uma Edge Function, que valida o evento e atualiza `subscriptions`, de forma idempotente pelo ID do evento.
- **Opção B, gateway próprio (Stripe ou Asaas):** o professor paga em página hospedada pelo provedor (Checkout/link de pagamento). O gateway cobre cartão e, no caso do Asaas, Pix e boleto. O webhook assinado chama a mesma Edge Function. Como o cartão nunca passa pelo app, a conformidade PCI fica com o provedor. Vale confirmar com as regras das lojas antes de adotar.

**Pendências para depois de 30/11:** escolher A ou B (D-01), aviso de fim do trial (SUB-09) e reativação/cancelamento real. A carência de `past_due` (D-05) ainda precisa de validação do grupo.

## 5. Impacto no protótipo (Figma)

Na tela "Assinatura e pagamento": remover o formulário de cartão, trocar o benefício "Chat seguro dentro do app" por "contato via WhatsApp após o aceite" (UI-06) e incluir o aviso "ambiente de demonstração, sem cobrança".
