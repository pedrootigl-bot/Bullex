const express = require("express");
const router = express.Router();
const archiver = require("archiver");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");
const supabase = require("../config/supabase");

const BUCKETS_PERMITIDOS = ["campanhas", "stories"];
const KIT_DOWNLOAD_CONCURRENCY = 6;

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

/**
 * Pastas do ZIP seguem o campo `formato` (stories|feed|videos|banners).
 * Fallback legado: tipo/nome só se forem categorias de postagem (não imagem/video).
 */
function pastaPorFormatoMaterial(item) {
    const formato = String(item?.formato || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (formato === "stories" || formato.includes("stor")) return "stories";
    if (formato === "feed" || formato.includes("feed")) return "feed";
    if (formato === "videos" || formato.includes("video")) return "videos";
    if (formato === "banners" || formato.includes("banner")) return "banners";

    const legado = String(
        item?.categoria
        || item?.tipo
        || item?.nome
        || item?.titulo
        || ""
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (
        legado === "imagem"
        || legado === "image"
        || legado === "video"
        || legado === "arquivo"
    ) {
        return "outros";
    }

    if (legado.includes("stor")) return "stories";
    if (legado.includes("feed")) return "feed";
    if (legado.includes("video")) return "videos";
    if (legado.includes("banner")) return "banners";

    return "outros";
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

function nomeArquivoSeguro(nome, fallback = "arquivo") {
    return String(nome || fallback)
        .replace(/[\\/]+/g, "_")
        .replace(/"/g, "")
        .slice(0, 180) || fallback;
}

/**
 * Executa mapper com concorrência limitada (ex.: até 6 downloads em paralelo).
 */
async function mapWithConcurrency(items, limit, mapper) {
    const lista = Array.isArray(items) ? items : [];
    const conc = Math.max(1, Math.min(Number(limit) || 1, lista.length || 1));
    const results = new Array(lista.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < lista.length) {
            const index = nextIndex;
            nextIndex += 1;
            results[index] = await mapper(lista[index], index);
        }
    }

    await Promise.all(
        Array.from({ length: Math.min(conc, lista.length) }, () => worker())
    );

    return results;
}

async function baixarBufferViaStorage(bucket, path) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
}

async function baixarBufferItem(item) {
    if (item.url) {
        const storage = extrairStorageDeUrl(item.url);

        if (storage && BUCKETS_PERMITIDOS.includes(storage.bucket)) {
            const viaSdk = await baixarBufferViaStorage(
                storage.bucket,
                storage.path
            );
            if (viaSdk) return viaSdk;
        }

        const resposta = await fetch(item.url);
        if (resposta.ok) {
            return Buffer.from(await resposta.arrayBuffer());
        }
    }

    if (item.arquivo) {
        const caminho = String(item.arquivo).replace(/^\/+/, "");

        for (const bucket of BUCKETS_PERMITIDOS) {
            const buffer = await baixarBufferViaStorage(bucket, caminho);
            if (buffer) return buffer;
        }
    }

    return null;
}

/**
 * Preferência: stream HTTP da URL pública (headers cedo → notificação do browser).
 * Fallback: Supabase Storage SDK (buffer completo).
 */
async function enviarArquivoComoStreamOuBuffer(res, { url, nomeSeguro }) {
    const storage = extrairStorageDeUrl(url);

    if (!storage || !BUCKETS_PERMITIDOS.includes(storage.bucket)) {
        const err = new Error("URL de arquivo inválida");
        err.status = 400;
        throw err;
    }

    // 1) Stream direto da URL pública
    try {
        const resposta = await fetch(url);

        if (resposta.ok && resposta.body) {
            const contentType =
                resposta.headers.get("content-type")
                || "application/octet-stream";
            const contentLength = resposta.headers.get("content-length");

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${nomeSeguro}"`
            );
            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "no-store");
            if (contentLength) {
                res.setHeader("Content-Length", contentLength);
            }

            const nodeStream = Readable.fromWeb(resposta.body);
            await pipeline(nodeStream, res);
            return;
        }
    } catch (erroStream) {
        console.warn(
            "Stream público falhou; tentando Storage SDK:",
            erroStream?.message || erroStream
        );
    }

    // 2) Fallback Storage SDK
    const buffer = await baixarBufferViaStorage(storage.bucket, storage.path);

    if (!buffer) {
        const viaFetch = await baixarBufferItem({ url });
        if (!viaFetch) {
            const err = new Error("Arquivo não encontrado");
            err.status = 404;
            throw err;
        }

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${nomeSeguro}"`
        );
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Length", viaFetch.length);
        res.send(viaFetch);
        return;
    }

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${nomeSeguro}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
}

function deduplicarNomesZip(entradas) {
    const nomesUsados = new Set();

    for (const entrada of entradas) {
        let nomeFinal = entrada.name;
        let contador = 2;

        while (nomesUsados.has(nomeFinal.toLowerCase())) {
            const ponto = entrada.name.lastIndexOf(".");
            if (ponto > entrada.name.lastIndexOf("/")) {
                nomeFinal =
                    `${entrada.name.slice(0, ponto)}-${contador}`
                    + entrada.name.slice(ponto);
            } else {
                nomeFinal = `${entrada.name}-${contador}`;
            }
            contador += 1;
        }

        nomesUsados.add(nomeFinal.toLowerCase());
        entrada.name = nomeFinal;
    }
}

// Download do kit completo da campanha
router.get("/kit/:campanha_id", async (req, res) => {
    try {
        const campanhaId = Number(req.params.campanha_id);

        if (!campanhaId) {
            return res.status(400).json({
                erro: "campanha_id inválido"
            });
        }

        const { data: materiais, error: erroMateriais } = await supabase
            .from("materiais")
            .select("*")
            .eq("campanha_id", campanhaId);

        const { data: kits, error: erroKits } = await supabase
            .from("kits")
            .select("*")
            .eq("campanha_id", campanhaId);

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

        // Baixa buffers em paralelo (concorrência limitada) ANTES de abrir o ZIP
        const baixados = await mapWithConcurrency(
            arquivos,
            KIT_DOWNLOAD_CONCURRENCY,
            async (item, i) => {
                const buffer = await baixarBufferItem(item);

                if (!buffer) {
                    console.log(
                        "Erro ao baixar item do kit:",
                        item.url || item.arquivo
                    );
                    return null;
                }

                const pasta = pastaPorFormatoMaterial(item);
                const nomeBase = nomeArquivoItem(item, i + 1);

                return {
                    buffer,
                    name: `${pasta}/${nomeBase}`
                };
            }
        );

        const entradas = baixados.filter(Boolean);

        if (!entradas.length) {
            return res.status(404).json({
                erro: "Nenhum arquivo pôde ser baixado"
            });
        }

        deduplicarNomesZip(entradas);

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=kit-${campanhaId}.zip`
        );
        res.setHeader("Cache-Control", "no-store");

        // Mídia quase não comprime; level 1 é bem mais rápido que 9
        const zip = archiver("zip", {
            zlib: { level: 1 }
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
                erro: "Erro interno do servidor"
            });
        }
    }
});

/**
 * Download de um arquivo pela URL pública do Storage.
 * GET /api/download/file?url=...&nome=opcional
 * Prefere stream (headers cedo); fallback Storage SDK.
 */
router.get("/file", async (req, res) => {
    try {
        const url = String(req.query.url || "").trim();
        const nomeQuery = String(req.query.nome || "").trim();

        if (!url) {
            return res.status(400).json({
                erro: "url é obrigatória"
            });
        }

        const storage = extrairStorageDeUrl(url);

        if (!storage) {
            return res.status(400).json({
                erro: "URL de arquivo inválida"
            });
        }

        if (!BUCKETS_PERMITIDOS.includes(storage.bucket)) {
            return res.status(400).json({
                erro: "Bucket não permitido"
            });
        }

        const nomeSeguro = nomeArquivoSeguro(
            nomeQuery || nomeArquivoItem({ url }, 1),
            "arquivo"
        );

        await enviarArquivoComoStreamOuBuffer(res, { url, nomeSeguro });
    } catch (error) {
        console.error("Erro download file:", error);

        if (res.headersSent) return;

        const status = Number(error?.status) || 500;
        return res.status(status).json({
            erro: error?.message || "Erro ao baixar arquivo"
        });
    }
});

// Download de arquivo individual (legado)
router.get("/:arquivo", async (req, res) => {
    try {
        const arquivo = req.params.arquivo;

        if (
            !arquivo
            || arquivo.includes("..")
            || arquivo.includes("\\")
            || arquivo.includes("/")
        ) {
            return res.status(400).json({
                erro: "Nome de arquivo inválido"
            });
        }

        let data = null;
        let error = null;

        for (const bucket of BUCKETS_PERMITIDOS) {
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
        res.setHeader("Cache-Control", "no-store");
        res.send(buffer);
    } catch (error) {
        console.error("Erro download arquivo:", error);
        res.status(500).json({
            erro: "Erro ao baixar arquivo"
        });
    }
});

module.exports = router;
