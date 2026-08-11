/**
 * Post / Destaque do Dia
 * Seleciona automaticamente a campanha mais relevante para a data atual.
 */

function inicioDoDiaDestaque(data = new Date()) {
    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
    );
}

function parseDataDestaque(valor) {
    if (!valor) return null;

    if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor)) {
        const [ano, mes, dia] = valor.slice(0, 10).split("-").map(Number);
        return new Date(ano, mes - 1, dia);
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return null;
    return inicioDoDiaDestaque(data);
}

/**
 * Regras:
 * 1) Campanha com data_inicio <= hoje <= data_fim
 * 2) Senão, próxima futura (data_inicio mais próxima)
 * 3) Senão, null (usa fallback da API /destaque)
 */
function escolherCampanhaPostDoDia(campanhas = []) {
    const hoje = inicioDoDiaDestaque(new Date());
    const lista = Array.isArray(campanhas) ? campanhas : [];

    const vigentesHoje = lista.filter((campanha) => {
        const inicio = parseDataDestaque(campanha.data_inicio);
        const fim = parseDataDestaque(campanha.data_fim);
        if (!inicio || !fim) return false;

        const t = hoje.getTime();
        return t >= inicio.getTime() && t <= fim.getTime();
    });

    if (vigentesHoje.length > 0) {
        return (
            vigentesHoje.find((campanha) =>
                String(campanha.status || "").toLowerCase() === "ativa"
            )
            || vigentesHoje[0]
        );
    }

    const futuras = lista
        .filter((campanha) => {
            const inicio = parseDataDestaque(campanha.data_inicio);
            return inicio && inicio.getTime() > hoje.getTime();
        })
        .sort((a, b) => {
            const inicioA = parseDataDestaque(a.data_inicio)?.getTime() ?? 0;
            const inicioB = parseDataDestaque(b.data_inicio)?.getTime() ?? 0;
            return inicioA - inicioB;
        });

    if (futuras.length > 0) {
        return futuras[0];
    }

    return null;
}

async function buscarCopiesCampanha(campanhaId) {
    try {
        const resposta = await fetch(
            `http://localhost:3000/api/copies/${campanhaId}`
        );

        if (!resposta.ok) return [];

        const dados = await resposta.json();
        return Array.isArray(dados) ? dados : [];
    } catch (error) {
        console.error("Erro ao buscar copies do destaque:", error);
        return [];
    }
}

async function obterCampanhaParaDestaque() {
    const resposta = await fetch(
        "http://localhost:3000/api/campanhas"
    );

    if (!resposta.ok) {
        throw new Error("Erro ao buscar campanhas");
    }

    const dados = await resposta.json();
    const campanhas = Array.isArray(dados)
        ? dados
        : (dados.campanhas ?? []);

    return escolherCampanhaPostDoDia(campanhas);
}

async function preencherDestaqueComCampanha(campanha) {
    const tag = document.querySelector("#highlightTag");
    const titulo = document.querySelector("#highlightTitle");
    const descricao = document.querySelector("#highlightDescription");
    const imagem = document.querySelector("#highlightImage");
    const copy = document.querySelector("#highlightCopy");
    const downloadStory = document.querySelector("#highlightDownloadStory");
    const mediaLabel = document.querySelector("#highlightMediaLabel");
    const mediaCaption = document.querySelector("#highlightMediaCaption");
    const openKitBtn =
        document.querySelector("#openKitModal")
        || document.querySelector("#highlightOpenKit");
    const openModalBtn = document.querySelector("#openModal");

    const copies = await buscarCopiesCampanha(campanha.id);
    const copyPrincipal = copies
        .slice()
        .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))[0];

    const imagemSrc =
        campanha.imagem_card
        || campanha.banner
        || "";

    if (tag) {
        tag.textContent =
            campanha.cupom
            || String(campanha.categoria || "").split(",")[0]?.trim()
            || "DESTAQUE DO DIA";
    }

    if (titulo) {
        titulo.textContent = campanha.titulo || "";
    }

    if (descricao) {
        descricao.textContent = campanha.descricao || "";
    }

    if (imagem) {
        if (imagemSrc) {
            imagem.hidden = false;
            imagem.src = imagemSrc;
            imagem.alt = campanha.titulo || "Campanha em destaque";
        } else {
            imagem.removeAttribute("src");
            imagem.hidden = true;
            imagem.alt = "";
        }
    }

    if (copy) {
        copy.textContent =
            copyPrincipal?.texto
            || campanha.objetivo
            || campanha.descricao
            || "";
    }

    if (downloadStory) {
        downloadStory.href = imagemSrc
            ? `${imagemSrc}`
            : "#";
    }

    if (mediaLabel) {
        mediaLabel.textContent =
            campanha.cupom || campanha.titulo || "Campanha";
    }

    if (mediaCaption) {
        mediaCaption.textContent = "Material recomendado pronto para uso";
    }

    if (openKitBtn) {
        openKitBtn.dataset.campanhaId = String(campanha.id);
    }

    if (openModalBtn) {
        openModalBtn.dataset.campanhaId = String(campanha.id);
    }

    // Mantém referência global para modal/kit/materiais/copies/regras
    window.campanhaDestaqueAtual = campanha;
}

async function carregarDestaqueFallbackApi() {
    const resposta = await fetch(
        "http://localhost:3000/api/destaque"
    );

    if (!resposta.ok) {
        throw new Error("Erro ao buscar destaque");
    }

    const destaque = await resposta.json();

    if (!destaque) {
        console.warn("Nenhum destaque encontrado");
        return;
    }

    const tag = document.querySelector("#highlightTag");
    const titulo = document.querySelector("#highlightTitle");
    const descricao = document.querySelector("#highlightDescription");
    const imagem = document.querySelector("#highlightImage");
    const copy = document.querySelector("#highlightCopy");
    const downloadStory = document.querySelector("#highlightDownloadStory");

    if (tag) tag.textContent = "DESTAQUE DO DIA";
    if (titulo) titulo.textContent = destaque.titulo || "";
    if (descricao) descricao.textContent = destaque.descricao || "";

    if (imagem) {
        imagem.src = destaque.imagem || "";
        imagem.alt = destaque.titulo || "Destaque";
    }

    if (copy) copy.textContent = destaque.copy || "";

    if (downloadStory && destaque.story_url) {
        downloadStory.href = destaque.story_url;
    }
}

/**
 * Carrega o Post do Dia pela campanha mais relevante.
 * Fallback: API /api/destaque
 */
async function carregarDestaque() {
    try {
        const campanha = await obterCampanhaParaDestaque();

        if (campanha) {
            await preencherDestaqueComCampanha(campanha);
            return;
        }

        await carregarDestaqueFallbackApi();
    } catch (error) {
        console.error("Erro ao carregar destaque:", error);

        try {
            await carregarDestaqueFallbackApi();
        } catch (fallbackError) {
            console.error(
                "Erro no fallback do destaque:",
                fallbackError
            );
        }
    }
}

/**
 * Ações dos botões do destaque
 */
function iniciarAcoesDestaque() {
    const botaoCopiar = document.querySelector("#highlightCopyBtn");
    const campoCopy = document.querySelector("#highlightCopy");

    if (botaoCopiar && campoCopy) {
        botaoCopiar.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(
                    campoCopy.textContent || ""
                );

                botaoCopiar.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Copiado!
                `;

                setTimeout(() => {
                    botaoCopiar.innerHTML = `
                        <i class="fa-regular fa-copy"></i>
                        Copiar texto
                    `;
                }, 2000);
            } catch (error) {
                console.error("Erro ao copiar texto:", error);
            }
        });
    }

    // #openKitModal é controlado em modal.js e já usa campanhaDestaqueAtual
}
