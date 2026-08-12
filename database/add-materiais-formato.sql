-- Coluna formato na tabela materiais
-- tipo  = tipo do arquivo (imagem | video | arquivo)
-- formato = categoria da postagem (stories | feed | videos | banners)

ALTER TABLE materiais
ADD COLUMN IF NOT EXISTS formato text;

COMMENT ON COLUMN materiais.tipo IS 'Tipo do arquivo: imagem, video ou arquivo';
COMMENT ON COLUMN materiais.formato IS 'Formato/categoria da postagem: stories, feed, videos, banners';

-- Opcional: índices para filtros futuros
-- CREATE INDEX IF NOT EXISTS idx_materiais_formato ON materiais (formato);
