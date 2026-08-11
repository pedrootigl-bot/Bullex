-- ============================================================
-- Camada 2 — Storage: restringir upload do bucket "campanhas"
-- ============================================================
-- Problema comprovado: upload anônimo (sem login) era permitido
-- no bucket público "campanhas".
--
-- Execute no SQL Editor do Supabase.
-- Não remove SELECT público (necessário para exibir imagens).
-- ============================================================

-- Remover policies permissivas de escrita anônima (ajuste os nomes
-- se forem diferentes no seu projeto):
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public upload campanhas" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
DROP POLICY IF EXISTS "campanhas upload" ON storage.objects;

-- Upload/update/delete somente para usuários autenticados
CREATE POLICY "campanhas_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campanhas');

CREATE POLICY "campanhas_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'campanhas')
WITH CHECK (bucket_id = 'campanhas');

CREATE POLICY "campanhas_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'campanhas');

-- Leitura pública (bucket público de mídia)
DROP POLICY IF EXISTS "campanhas_public_select" ON storage.objects;
CREATE POLICY "campanhas_public_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'campanhas');
