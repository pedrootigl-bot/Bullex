/* ==================================================
   MODAL — Materiais da campanha
   Estrutura pronta para integração com banco/API
================================================== */

const modal = document.getElementById("modalMateriais");
const openModalBtn = document.getElementById("openModal");
const modalLoading = document.getElementById("modalLoading");
const modalError = document.getElementById("modalError");
const modalErrorMessage = document.getElementById("modalErrorMessage");
const modalBody = document.getElementById("modalBody");
const modalRetry = document.getElementById("modalRetry");
let campanhaModalAtualId = null;

/**
 * Resolve o ID da campanha do destaque ("O que divulgar hoje").
 * Prioridade: id informado → campanhaDestaqueAtual → obterCampanhaParaDestaque → campanhaExibida
 */
async function resolverCampanhaModalId(idOpcional) {
    const idDireto = Number(idOpcional);
    if (Number.isFinite(idDireto) && idDireto > 0) {
        return idDireto;
    }

    const idDestaque = Number(window.campanhaDestaqueAtual?.id);
    if (Number.isFinite(idDestaque) && idDestaque > 0) {
        return idDestaque;
    }

    if (typeof obterCampanhaParaDestaque === "function") {
        try {
            const campanha = await obterCampanhaParaDestaque();
            if (campanha?.id != null) {
                window.campanhaDestaqueAtual = campanha;
                return Number(campanha.id);
            }
        } catch (error) {
            console.error("Erro ao obter campanha do destaque:", error);
        }
    }

    if (
        typeof campanhaExibida !== "undefined"
        && campanhaExibida
        && campanhaExibida.id != null
    ) {
        return Number(campanhaExibida.id);
    }

    return null;
}

function formatarPeriodoCampanha(campanha) {
    const inicio = String(campanha?.data_inicio || "").slice(0, 10);
    const fim = String(campanha?.data_fim || "").slice(0, 10);

    const formatar = (valor) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor || "";
        const [, mes, dia] = valor.split("-");
        return `${dia}/${mes}`;
    };

    const ini = formatar(inicio);
    const end = formatar(fim);

    if (ini && end) return `${ini} — ${end}`;
    return ini || end || "";
}

async function fetchJsonLista(url) {
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) return [];
        const dados = await resposta.json();
        return Array.isArray(dados) ? dados : [];
    } catch (error) {
        console.error(`Erro ao buscar ${url}:`, error);
        return [];
    }
}

/**
 * Busca campanha + materiais + copies + regras da campanha ativa do destaque.
 */
async function obterCampanha(id) {
    const campanhaId = await resolverCampanhaModalId(id);

    if (!campanhaId) {
        throw new Error("Nenhuma campanha disponível para o destaque.");
    }

    const resposta = await fetch(
        `http://localhost:3000/api/campanhas/${campanhaId}`
    );

    if (!resposta.ok) {
        throw new Error("Campanha não encontrada.");
    }

    const campanha = await resposta.json();

    const [materiais, copies, regras, angulos] = await Promise.all([
        fetchJsonLista(`http://localhost:3000/api/materiais/${campanhaId}`),
        fetchJsonLista(`http://localhost:3000/api/copies/${campanhaId}`),
        fetchJsonLista(`http://localhost:3000/api/regras/${campanhaId}`),
        fetchJsonLista(`http://localhost:3000/api/angulos/${campanhaId}`)
    ]);

    return {
        id: campanha.id,
        status: campanha.status || "",
        titulo: campanha.titulo || "",
        descricao: campanha.descricao || "",
        periodo: formatarPeriodoCampanha(campanha),
        subtitulo: "Materiais organizados por formato para acelerar sua divulgação.",
        banner: campanha.imagem_card || campanha.banner || "",
        abas: [
            { id: "visao-geral", label: "Visão geral" },
            { id: "materiais", label: "Materiais" },
            { id: "copies", label: "Copies" },
            { id: "regras", label: "Regras" }
        ],
        materiais,
        copies: copies
            .slice()
            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
        regras: regras
            .slice()
            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
        visaoGeral: {
            resumo:
                campanha.resumo
                || campanha.visao_geral
                || "",
            publicoRecomendado: campanha.publico_recomendado || "",
            objetivo: campanha.objetivo || "",
            mecanica: normalizarListaMecanica(campanha.mecanica),
            angulos: (Array.isArray(angulos) ? angulos : [])
                .slice()
                .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
        }
    };
}

function setModalState({ loading = false, error = null, ready = false } = {}) {
    modalLoading.hidden = !loading;
    modalError.hidden = !error;
    modalBody.hidden = !ready;

    if (error) {
        modalErrorMessage.textContent = error;
    }
}

let modalAbaInicial = "materiais";

function abrirModal(campanhaId, opcoes = {}) {
    if (!modal) return;

    modalAbaInicial =
        opcoes.abaInicial
        || opcoes.aba
        || "materiais";

    modal.hidden = false;
    requestAnimationFrame(() => {
        modal.classList.add("is-open", "active");
    });
    document.body.style.overflow = "hidden";
    carregarCampanhaNoModal(campanhaId);
}

function fecharModal() {
    modal.classList.remove("is-open", "active");
    document.body.style.overflow = "";

    const onEnd = () => {
        modal.hidden = true;
        modal.removeEventListener("transitionend", onEnd);
    };

    modal.addEventListener("transitionend", onEnd);

    // Fallback caso a transição não dispare
    setTimeout(() => {
        if (!modal.classList.contains("is-open")) {
            modal.hidden = true;
        }
    }, 400);
}

async function carregarCampanhaNoModal(campanhaId) {
    setModalState({ loading: true });

    try {
        const campanha = await obterCampanha(
            campanhaId ?? campanhaModalAtualId
        );
        campanhaModalAtualId = campanha.id;
        popularCampanha(campanha);

        // Kit completo da mesma campanha do destaque
        if (campanha.id != null) {
            carregarKit(campanha.id);
        }

        setModalState({ ready: true });
    } catch (err) {
        console.error(err);
        setModalState({
            error: err.message || "Não foi possível carregar os materiais."
        });
    }
}

function popularCampanha(campanha) {
    const banner = document.getElementById("campaignBanner");
    banner.src = campanha.banner || "";
    banner.alt = campanha.titulo || "Campanha";

    const statusEl = document.getElementById("campaignStatus");
    if (statusEl) {
        const status = String(campanha.status || "").trim();
        statusEl.textContent = status ? status.toUpperCase() : "";
        statusEl.hidden = !status;
    }

    document.getElementById("campaignTitle").textContent = campanha.titulo || "";

    const descricaoEl = document.getElementById("campaignDescription");
    if (descricaoEl) {
        const descricao = String(campanha.descricao || "").trim();
        descricaoEl.textContent = descricao;
        descricaoEl.hidden = !descricao;
    }

    const periodoEl = document.getElementById("campaignPeriod");
    if (periodoEl) {
        const periodo = String(campanha.periodo || "").trim();
        periodoEl.textContent = periodo;
        periodoEl.hidden = !periodo;
    }

    document.getElementById("campaignSubtitle").textContent = campanha.subtitulo || "";

    const downloadKit = document.getElementById("downloadKit");
    if (downloadKit) {
        const idNumerico = Number(campanha.id);

        // Só configura se for ID numérico válido (evita slug tipo "bullcar")
        if (Number.isFinite(idNumerico) && idNumerico > 0) {
            downloadKit.href =
                `http://localhost:3000/api/download/kit/${idNumerico}`;
        }

        downloadKit.removeAttribute("target");
        downloadKit.removeAttribute("rel");
        downloadKit.setAttribute("download", "");
    }

    renderizarAbas(campanha.abas || []);
    renderizarMateriais(campanha.materiais || []);
    renderizarVisaoGeral(campanha.visaoGeral);
    renderizarCopies(campanha.copies || []);
    renderizarRegras(campanha.regras || []);
    ativarAba(modalAbaInicial || "visao-geral");
    modalAbaInicial = "visao-geral";
}

function renderizarAbas(abas) {
    const container = document.getElementById("campaignTabs");
    container.innerHTML = "";

    abas.forEach((aba, index) => {
        const id = typeof aba === "string" ? slugify(aba) : aba.id;
        const label = typeof aba === "string" ? aba : aba.label;

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.dataset.tab = id;
        button.classList.toggle("active", index === 0);
        button.addEventListener("click", () => ativarAba(id));
        container.appendChild(button);
    });
}

function ativarAba(abaId) {
    document.querySelectorAll(".modal__tabs button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === abaId);
    });

    document.querySelectorAll(".modal__panel").forEach((panel) => {
        const ativo = panel.dataset.panel === abaId;
        panel.classList.toggle("is-active", ativo);
        panel.hidden = !ativo;
    });
}

function renderizarMateriais(materiais) {
    const container = document.getElementById("materialsContainer");

    if (!container) {
        console.error("Elemento #materialsContainer não encontrado");
        return;
    }

    container.innerHTML = "";

    const lista = Array.isArray(materiais) ? materiais : [];

    if (!lista.length) {
        container.innerHTML = "<p>Nenhum material disponível no momento.</p>";
        return;
    }

    lista.forEach((material) => {
        const card = document.createElement("div");
        card.className = "material-card";
        card.dataset.materialId = material.id || "";

        const titulo = material.titulo || material.nome || "Material";

        const arquivoUrl = resolverCaminhoKit(
            material.preview ||
            material.arquivo ||
            material.url ||
            material.imagem ||
            ""
        );

        const downloadUrl = resolverCaminhoKit(
            material.download ||
            material.arquivo ||
            material.url ||
            material.imagem ||
            "#"
        );


        card.innerHTML = `
            <div class="material-info">
                <h3>${escapeHtml(titulo)}</h3>
                <span>${escapeHtml(material.resolucao || material.tipo || "")}</span>
            </div>

            <div class="material-actions">

                <button type="button" class="btn btn--outline" data-action="preview">
                    <i class="fa-regular fa-eye"></i>
                    Visualizar
                </button>

                <a href="${downloadUrl}" class="btn" download>
                    <i class="fa-solid fa-download"></i>
                    Baixar
                </a>

            </div>
        `;


        const previewBtn = card.querySelector('[data-action="preview"]');

        previewBtn.addEventListener("click", () => {

            const url = arquivoUrl;


            // Se for vídeo
            if (material.tipo === "video") {

                if (typeof abrirVideoPreview === "function") {
                    abrirVideoPreview(url, titulo);
                } else {
                    window.open(url, "_blank", "noopener");
                }

                return;
            }


            // Se for imagem
            if (typeof abrirImagePreview === "function") {

                abrirImagePreview(url, titulo);

            } else if (url) {

                window.open(url, "_blank", "noopener");

            }

        });


        const downloadBtn = card.querySelector("a.btn[download]");

        if (downloadBtn) {

            downloadBtn.addEventListener("click", (event) => {

                forcarDownloadArquivo(
                    event,
                    downloadUrl,
                    titulo
                );

            });

        }


        container.appendChild(card);

    });
}
function normalizarListaMecanica(valor) {
    if (Array.isArray(valor)) {
        return valor
            .map((item) => {
                if (typeof item === "string") return item.trim();
                if (item && typeof item === "object") {
                    return String(item.texto || item.titulo || "").trim();
                }
                return String(item || "").trim();
            })
            .filter(Boolean);
    }

    if (typeof valor === "string" && valor.trim()) {
        try {
            const parsed = JSON.parse(valor);
            if (Array.isArray(parsed)) {
                return normalizarListaMecanica(parsed);
            }
        } catch {
            // texto simples / multilinha
        }

        return valor
            .split(/\n+/)
            .map((item) => item.replace(/^\d+[\).\s-]*/, "").trim())
            .filter(Boolean);
    }

    return [];
}

function parseObjetivosModal(valor) {
    const opcoes = ["Retenção", "Redepósito", "Aquisição", "Volume"];
    const selecionados = String(valor || "")
        .split(/[,·|]/)
        .map((item) => item.trim())
        .filter(Boolean);

    const selecionadosLower = new Set(
        selecionados.map((item) => item.toLowerCase())
    );

    return opcoes.map((opcao) => ({
        label: opcao,
        ativo: selecionadosLower.has(opcao.toLowerCase())
    }));
}

function renderizarVisaoGeral(visaoGeral = {}) {
    const container = document.getElementById("visaoGeralContent");
    if (!container) return;

    const resumo = String(visaoGeral.resumo || visaoGeral.texto || "").trim();
    const publico = String(visaoGeral.publicoRecomendado || "").trim();
    const objetivos = parseObjetivosModal(visaoGeral.objetivo);
    const temObjetivoAtivo = objetivos.some((item) => item.ativo);
    const mecanica = Array.isArray(visaoGeral.mecanica) ? visaoGeral.mecanica : [];
    const angulos = Array.isArray(visaoGeral.angulos) ? visaoGeral.angulos : [];

    const blocoResumo = resumo
        ? `
            <section class="modal__visao-bloco">
                <p class="modal__visao-geral__label">Resumo</p>
                <p class="modal__visao-geral__texto">${escapeHtml(resumo)}</p>
            </section>
        `
        : "";

    const blocoPublico = publico
        ? `
            <section class="modal__visao-bloco">
                <p class="modal__visao-geral__label">Público recomendado</p>
                <p class="modal__visao-publico">${escapeHtml(publico)}</p>
            </section>
        `
        : "";

    const blocoObjetivo = `
        <section class="modal__visao-bloco">
            <p class="modal__visao-geral__label">Objetivo</p>
            ${
                temObjetivoAtivo
                    ? `<div class="modal__objetivo-chips">
                        ${objetivos.map((item) => `
                            <span class="modal__objetivo-chip${item.ativo ? " is-active" : ""}">
                                ${escapeHtml(item.label)}
                            </span>
                        `).join("")}
                    </div>`
                    : `<p class="modal__visao-geral__empty">Nenhum objetivo cadastrado.</p>`
            }
        </section>
    `;

    const blocoMecanica = `
        <section class="modal__visao-bloco">
            <p class="modal__visao-geral__label">Mecânica</p>
            ${
                mecanica.length
                    ? `<ol class="modal__mecanica-list">
                        ${mecanica.map((passo) => `
                            <li class="modal__mecanica-item">
                                <span class="modal__mecanica-index" aria-hidden="true"></span>
                                <p>${escapeHtml(passo)}</p>
                            </li>
                        `).join("")}
                    </ol>`
                    : `<p class="modal__visao-geral__empty">A mecânica ainda não foi cadastrada.</p>`
            }
        </section>
    `;

    const blocoAngulos = `
        <section class="modal__visao-bloco">
            <p class="modal__visao-geral__label">Ângulos de divulgação</p>
            ${
                angulos.length
                    ? `<div class="modal__angulos-list">
                        ${angulos.map((angulo) => `
                            <article class="modal__angulo-card">
                                <h4>${escapeHtml(angulo.titulo || "Ângulo")}</h4>
                                <p>${escapeHtml(angulo.descricao || "")}</p>
                            </article>
                        `).join("")}
                    </div>`
                    : `<p class="modal__visao-geral__empty">Nenhum ângulo cadastrado.</p>`
            }
        </section>
    `;

    if (!resumo && !publico && !temObjetivoAtivo && !mecanica.length && !angulos.length) {
        container.innerHTML = `
            <div class="modal__visao-geral">
                <p class="modal__visao-geral__empty">
                    As informações de visão geral ainda não foram cadastradas.
                </p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="modal__visao-geral">
            ${blocoResumo}
            ${blocoPublico}
            ${blocoObjetivo}
            ${blocoMecanica}
            ${blocoAngulos}
        </div>
    `;
}

function agruparCopiesPorCanal(copies = []) {
    const grupos = new Map();

    copies.forEach((copy) => {
        const canal = String(copy.canal || copy.tipo || "Geral").trim() || "Geral";
        const chave = canal.toUpperCase();

        if (!grupos.has(chave)) {
            grupos.set(chave, {
                label: chave,
                items: []
            });
        }

        grupos.get(chave).items.push(copy);
    });

    return Array.from(grupos.values());
}

function tituloCopyCard(copy) {
    const titulo = String(copy.titulo || "").trim();
    if (titulo) return titulo;

    const canal = String(copy.canal || "").trim();
    const tipo = String(copy.tipo || "").trim();

    if (canal && tipo) return `${canal} — ${tipo}`;
    return canal || tipo || "Copy";
}

function renderizarCopies(copies) {
    const container = document.getElementById("copiesContent");
    if (!container) return;

    const lista = Array.isArray(copies) ? copies : [];

    if (!lista.length) {
        container.innerHTML = `
            <div class="modal__copies">
                <p class="modal__visao-geral__empty">Nenhuma copy disponível no momento.</p>
            </div>
        `;
        return;
    }

    const grupos = agruparCopiesPorCanal(lista);

    container.innerHTML = `
        <div class="modal__copies">
            ${grupos.map((grupo) => `
                <section class="modal__copies-group">
                    <p class="modal__copies-group__label">${escapeHtml(grupo.label)}</p>
                    <div class="modal__copies-group__list">
                        ${grupo.items.map((copy, index) => `
                            <article class="modal__copy-card" data-copy-group="${escapeHtml(grupo.label)}" data-copy-index="${index}">
                                <div class="modal__copy-card__top">
                                    <h3>${escapeHtml(tituloCopyCard(copy))}</h3>
                                    <button type="button" class="modal__copy-btn" data-action="copy">
                                        <i class="fa-regular fa-copy"></i>
                                        Copiar
                                    </button>
                                </div>
                                <p class="modal__copy-card__text">${escapeHtml(copy.texto || "")}</p>
                            </article>
                        `).join("")}
                    </div>
                </section>
            `).join("")}
        </div>
    `;

    container.querySelectorAll(".modal__copy-card").forEach((card) => {
        const btn = card.querySelector('[data-action="copy"]');
        const texto = card.querySelector(".modal__copy-card__text")?.textContent || "";

        if (!btn) return;

        btn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(texto);
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
                btn.classList.add("is-copied");
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.classList.remove("is-copied");
                }, 1600);
            } catch {
                alert("Não foi possível copiar o texto.");
            }
        });
    });
}

function renderizarRegras(regras) {
    // Modal unificado (home / campanhas ativas)
    const container = document.getElementById("regrasContent");

    if (!container) {
        console.warn("Container #regrasContent não encontrado");
        return;
    }

    const lista = Array.isArray(regras) ? regras : [];

    if (!lista.length) {
        container.innerHTML = `
            <div class="modal__regras">
                <p class="modal__visao-geral__empty">Nenhuma regra cadastrada.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="modal__regras">
            <p class="modal__visao-geral__label">Regras</p>
            <ol class="modal__regras-list">
                ${lista.map((regra) => {
                    if (typeof regra === "string") {
                        return `
                            <li class="modal__regra-item">
                                <span class="modal__regra-index" aria-hidden="true"></span>
                                <div>
                                    <p>${escapeHtml(regra)}</p>
                                </div>
                            </li>
                        `;
                    }

                    return `
                        <li class="modal__regra-item">
                            <span class="modal__regra-index" aria-hidden="true"></span>
                            <div>
                                <strong>${escapeHtml(regra.titulo || "Regra")}</strong>
                                ${
                                    regra.descricao
                                        ? `<p>${escapeHtml(regra.descricao)}</p>`
                                        : ""
                                }
                            </div>
                        </li>
                    `;
                }).join("")}
            </ol>
        </div>
    `;
}

function slugify(texto) {
    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function escapeHtml(valor) {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/* ==========================
   Eventos do modal
========================== */

if (openModalBtn) {
    openModalBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const idDestaque =
            openModalBtn.dataset.campanhaId
            || window.campanhaDestaqueAtual?.id
            || null;
        abrirModal(idDestaque, { abaInicial: "materiais" });
    });
}

const openEntenderCampanhaBtn =
    document.getElementById("openEntenderCampanha");

if (openEntenderCampanhaBtn) {
    openEntenderCampanhaBtn.addEventListener("click", (event) => {
        event.preventDefault();

        const idDestaque =
            openEntenderCampanhaBtn.dataset.campanhaId
            || openModalBtn?.dataset.campanhaId
            || window.campanhaDestaqueAtual?.id
            || null;

        abrirModal(idDestaque, { abaInicial: "visao-geral" });
    });
}

if (modal) {
    modal.querySelectorAll("[data-modal-close]").forEach((el) => {
        el.addEventListener("click", fecharModal);
    });
}

if (modalRetry) {
    modalRetry.addEventListener("click", carregarCampanhaNoModal);
}


document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) {

        // Se o preview de imagem estiver aberto, fecha só ele
        if(
            imagePreviewModal
            && !imagePreviewModal.hidden
            && imagePreviewModal.classList.contains("is-open")
        ){
            fecharImagePreview();
            return;
        }

        fecharModal();
    }
});


/* ==================================================
MODAL — Kit completo da campanha
================================================== */


const kitModal = document.getElementById("kitModal");
const openKitModalBtn = document.getElementById("openKitModal");
const closeKitModalBtn = document.getElementById("closeKitModal");


function abrirKitModal(){

    // Usa o modal de materiais existente quando #kitModal não existe
    if(!kitModal){
        abrirModal();
        return;
    }


    kitModal.hidden = false;


    requestAnimationFrame(()=>{

        kitModal.classList.add("is-open", "active");

    });


    document.body.style.overflow = "hidden";

}



function fecharKitModal(){

    if(!kitModal){
        fecharModal();
        return;
    }


    kitModal.classList.remove("is-open", "active");


    document.body.style.overflow = "";


    setTimeout(()=>{

        kitModal.hidden = true;

    },300);

}




if(openKitModalBtn){

    openKitModalBtn.addEventListener("click", async (event)=>{

        event.preventDefault();

        // Sempre usa a campanha ativa em "O que divulgar hoje"
        const idDestaque =
            openKitModalBtn.dataset.campanhaId
            || window.campanhaDestaqueAtual?.id
            || null;

        abrirModal(idDestaque);

    });

}



if(closeKitModalBtn){

    closeKitModalBtn.addEventListener("click",()=>{

        fecharKitModal();

    });

}



if(kitModal){

    kitModal.addEventListener("click",(event)=>{


        if(event.target === kitModal){

            fecharKitModal();

        }


    });

}

async function carregarKit(campanhaId){

    try{

        const response = await fetch(
            `http://localhost:3000/api/kits/${campanhaId}`
        );

        if(!response.ok){
            throw new Error(`HTTP ${response.status}`);
        }

        const dados = await response.json();

        console.log("KIT RECEBIDO:", dados);

        renderizarKit(dados);

    }catch(error){

        console.error("Erro ao carregar kit:", error);

    }

}


function resolverCaminhoKit(caminho){

    if(!caminho) return "";

    if(/^https?:\/\//i.test(caminho)){
        return caminho;
    }

    // Remove barra inicial para caminho relativo a partir do frontend/
    const limpo = String(caminho).replace(/^\/+/, "");

    // Ajuste: arquivos estão em /downloads, não em /images
    if(limpo.startsWith("images/")){
        return "downloads/" + limpo.slice("images/".length);
    }

    return limpo;

}


function nomeArquivoDeUrl(caminho, fallback = "material"){

    try{
        const limpo = String(caminho).split("?")[0];
        const nome = limpo.substring(limpo.lastIndexOf("/") + 1);
        return nome || fallback;
    }catch{
        return fallback;
    }

}


async function forcarDownloadArquivo(event, url, nomeBase){

    if(!url || url === "#"){
        event.preventDefault();
        return;
    }

    // Força download do arquivo local em vez de só abrir em nova aba
    event.preventDefault();

    try{

        const resposta = await fetch(url);

        if(!resposta.ok){
            throw new Error(`HTTP ${resposta.status}`);
        }

        const blob = await resposta.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = objectUrl;
        link.download = nomeArquivoDeUrl(url, nomeBase);
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(objectUrl);

    }catch(error){

        console.error("Erro ao baixar arquivo:", error);

        // Fallback: navega para o arquivo
        window.location.href = url;

    }

}


function renderizarKit(itens){

    const container = document.getElementById("kit-items");

    if(!container){
        console.error("Elemento #kit-items não encontrado");
        return;
    }

    const lista = Array.isArray(itens)
        ? itens
        : (itens?.kits ?? []);

    // Evita duplicar mock + kit no mesmo painel
    const materialsContainer = document.getElementById("materialsContainer");
    if(materialsContainer){
        materialsContainer.innerHTML = "";
    }

    container.innerHTML = "";

    if(lista.length === 0){
        container.innerHTML = "<p>Nenhum item no kit.</p>";
        return;
    }

    lista.forEach(item => {

        const imagemSrc = resolverCaminhoKit(
            item.arquivo || item.imagem || item.url || ""
        );

        const downloadSrc = resolverCaminhoKit(
            item.arquivo || item.imagem || item.url || "#"
        );

        const nome = item.nome || item.titulo || "Material";
        const meta = item.descricao || item.tipo || "";

        const card = document.createElement("div");
        card.className = "material-card";

        // Sem imagem no card — só no modal de preview ao clicar em Visualizar
        card.innerHTML = `
            <div class="material-info">
                <h3>${escapeHtml(nome)}</h3>
                <span>${escapeHtml(meta)}</span>
            </div>
            <div class="material-actions">
                <button type="button" class="btn btn--outline" data-action="preview">
                    <i class="fa-regular fa-eye"></i>
                    Visualizar
                </button>
                <a
                    href="${downloadSrc}"
                    download="${nomeArquivoDeUrl(downloadSrc, nome)}"
                    class="btn btn-download-kit"
                >
                    <i class="fa-solid fa-download"></i>
                    Baixar
                </a>
            </div>
        `;

        const previewBtn = card.querySelector('[data-action="preview"]');
        if(previewBtn){
            previewBtn.addEventListener("click", () => {
                abrirImagePreview(imagemSrc, nome);
            });
        }

        const botaoBaixar = card.querySelector(".btn-download-kit");
        if(botaoBaixar){
            botaoBaixar.addEventListener("click", (event) => {
                forcarDownloadArquivo(event, downloadSrc, nome);
            });
        }

        container.appendChild(card);

    });

}


/* ==================================================
   MODAL — Preview de imagem (kit/materiais)
================================================== */

const imagePreviewModal = document.getElementById("imagePreviewModal");
const imagePreview = document.getElementById("imagePreview");
const closeImagePreviewBtn = document.getElementById("closeImagePreview");


function abrirImagePreview(src, alt = "Visualização do material"){

    if(!imagePreviewModal || !imagePreview || !src) return;

    imagePreview.src = src;
    imagePreview.alt = alt || "Visualização do material";

    imagePreviewModal.hidden = false;

    requestAnimationFrame(() => {
        imagePreviewModal.classList.add("is-open", "active");
    });

}


function fecharImagePreview(){

    if(!imagePreviewModal) return;

    imagePreviewModal.classList.remove("is-open", "active");

    setTimeout(() => {
        imagePreviewModal.hidden = true;
        if(imagePreview){
            imagePreview.src = "";
        }
    }, 250);

}


if(closeImagePreviewBtn){
    closeImagePreviewBtn.addEventListener("click", fecharImagePreview);
}


if(imagePreviewModal){

    imagePreviewModal.addEventListener("click", (event) => {

        if(
            event.target === imagePreviewModal
            || event.target.matches("[data-image-preview-close]")
        ){
            fecharImagePreview();
        }

    });

}


// Clique na imagem do kit/material abre o preview
if(modal){

    modal.addEventListener("click", (event) => {

        const img = event.target.closest(
            "#kit-items img, #materialsContainer img, .kit-card img, .material-card img"
        );

        if(!img) return;
        if(img.id === "campaignBanner") return;

        event.preventDefault();

        abrirImagePreview(
            img.currentSrc || img.src,
            img.alt || "Visualização do material"
        );

    });

}
