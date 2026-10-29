-- Adiciona 'cancelled' ao ciclo da solicitação: o responsável pode desistir de um
-- pedido que ainda está pendente, liberando o par para pedir de novo.
--
-- Migração separada da que usa o valor porque o PostgreSQL não permite usar um
-- valor recém-adicionado ao enum na mesma transação que o adiciona.
alter type public.contact_request_status add value if not exists 'cancelled';
