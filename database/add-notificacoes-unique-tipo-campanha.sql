-- Índice opcional para dedupe de notificações por campanha + tipo
-- (campanha_iniciada, campanha_em_aquecimento, campanha_encerrada, etc.)
--
-- Tipos que usam mensagem distinta (ex.: campanha_encerrando 7/3/1)
-- NÃO devem entrar neste índice único global se a mensagem variar.
-- Aplique apenas se a política de dedupe for estritamente campanha_id + tipo
-- para os eventos “únicos” (iniciada / aquecimento / encerrada).
--
-- Alternativa segura: índice parcial só para tipos sem variação de mensagem.

CREATE UNIQUE INDEX IF NOT EXISTS uq_notificacoes_campanha_tipo_unicos
ON notificacoes (campanha_id, tipo)
WHERE tipo IN (
    'campanha_iniciada',
    'campanha_em_aquecimento',
    'campanha_encerrada'
);
