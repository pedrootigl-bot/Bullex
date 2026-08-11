const express = require("express");
const router = express.Router();
const archiver = require("archiver");
const supabase = require("../config/supabase");

/**
 * Extrai bucket + path de URL pública do Supabase Storage.
 * Ex.: .../object/public/campanhas/materiais/imagens/x.png
 */
function extrairStorageDeUrl(url) {
    try {
        const texto = String(url || "");
        const match = texto.match(
            /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
        );

        if (!match) return null;

        return {
            bucket: match[1],
            path: decodeURIComponent(match[2].split("?")[0])
        };
    } catch {
        return null;
    }
}

function nomeArquivoItem(item, fallbackIndex) {
    const origem =
        item.nome
        || item.titulo
        || item.arquivo
        || item.url
        || `arquivo-${fallbackIndex}`;

    const base = String(origem).split("?")[0];
    const nome = base.substring(base.lastIndexOf("/") + 1);
    return nome || `arquivo-${fallbackIndex}`;
}

async function baixarBufferItem(item) {
    // 1) URL pública (campo atual de materiais.url)
    if (item.url) {
        const storage = extrairStorageDeUrl(item.url);

        if (storage) {
            const { data, error } = await supabase.storage
                .from(storage.bucket)
                .download(storage.path);

            if (!error && data) {
                return Buffer.from(await data.arrayBuffer());
            }
        }

        // Fallback: fetch direto da URL
        const resposta = await fetch(item.url);
        if (resposta.ok) {
            return Buffer.from(await resposta.arrayBuffer());
        }
    }

    // 2) Campo legado arquivo (kits / stories)
    if (item.arquivo) {
        const caminho = String(item.arquivo).replace(/^\/+/, "");

        for (const bucket of ["campanhas", "stories"]) {
            const { data, error } = await supabase.storage
                .from(bucket)
                .download(caminho);

            if (!error && data) {
                return Buffer.from(await data.arrayBuffer());
            }
        }
    }

    return null;
}

// Download do kit completo da campanha
router.get("/kit/:campanha_id", async (req, res) => {
    try {
        const { campanha_id } = req.params;

        const { data: materiais, error: erroMateriais } = await supabase
            .from("materiais")
            .select("*")
            .eq("campanha_id", campanha_id);

        const { data: kits, error: erroKits } = await supabase
            .from("kits")
            .select("*")
            .eq("campanha_id", campanha_id);

        if (erroMateriais || erroKits) {
            console.log("Erro materiais:", erroMateriais);
            console.log("Erro kits:", erroKits);
            throw new Error("Erro ao buscar arquivos");
        }

        const arquivos = [
            ...(materiais || []),
            ...(kits || [])
        ].filter((item) => item.url || item.arquivo);

        console.log("Arquivos encontrados:", arquivos.length);

        if (!arquivos.length) {
            return res.status(404).json({
                erro: "Nenhum arquivo encontrado"
            });
        }

        // Baixa buffers ANTES de abrir a resposta ZIP
        // (evita Content-Type application/zip com corpo vazio/corrompido)
        const entradas = [];

        for (let i = 0; i < arquivos.length; i++) {
            const item = arquivos[i];
            const buffer = await baixarBufferItem(item);

            if (!buffer) {
                console.log(
                    "Erro ao baixar item do kit:",
                    item.url || item.arquivo
                );
                continue;
            }

            entradas.push({
                buffer,
                name: nomeArquivoItem(item, i + 1)
            });
        }

        if (!entradas.length) {
            return res.status(404).json({
                erro: "Nenhum arquivo pôde ser baixado"
            });
        }

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=kit-${campanha_id}.zip`
        );

        const zip = archiver("zip", {
            zlib: { level: 9 }
        });

        zip.on("error", (error) => {
            console.error("Erro ZIP:", error);
            if (!res.headersSent) {
                res.status(500).end();
            }
        });

        zip.pipe(res);

        for (const entrada of entradas) {
            zip.append(entrada.buffer, {
                name: entrada.name
            });
        }

        await zip.finalize();
    } catch (error) {
        console.error("Erro download kit:", error);

        if (!res.headersSent) {
            res.status(500).json({
                erro: error.message
            });
        }
    }
});

// Download de arquivo individual (legado)
router.get("/:arquivo", async (req, res) => {
    try {
        const arquivo = req.params.arquivo;

        let data = null;
        let error = null;

        for (const bucket of ["campanhas", "stories"]) {
            const resultado = await supabase.storage
                .from(bucket)
                .download(arquivo);

            if (!resultado.error && resultado.data) {
                data = resultado.data;
                error = null;
                break;
            }

            error = resultado.error;
        }

        if (error || !data) {
            throw error || new Error("Arquivo não encontrado");
        }

        const buffer = Buffer.from(await data.arrayBuffer());

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${arquivo}"`
        );
        res.setHeader(
            "Content-Type",
            "application/octet-stream"
        );
        res.send(buffer);
    } catch (error) {
        res.status(500).json({
            erro: error.message
        });
    }
});

module.exports = router;
