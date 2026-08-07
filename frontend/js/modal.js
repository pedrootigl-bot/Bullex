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

/** ID da campanha ativa — trocar quando vier do backend */
const CAMPANHA_ID = "bullcar";

/**
 * Mock local — espelha o formato esperado do banco/API.
 * Quando integrar, remova o mock e use apenas a resposta do endpoint.
 */
const campanhaMock = {
    id: "bullcar",
    status: "ATIVA",
    titulo: "BULLCAR",
    descricao: "O GT dos traders pode ser seu.",
    periodo: "03/08 • 03/09",
    subtitulo: "Materiais organizados por formato para acelerar sua divulgação.",
    banner: "assets/images/post.png",
    kit: "#",
    abas: [
        { id: "materiais", label: "Materiais" },
        { id: "visao-geral", label: "Visão Geral" },
        { id: "copies", label: "Copies" },
        { id: "regras", label: "Regras" }
    ],
   
    visaoGeral: {
        titulo: "Sobre a campanha",
        texto: "Campanha voltada para engajamento, movimentação nas redes sociais, reativação de traders, incentivo ao redépósito e aumento do número de operações."
    },
    copies: [
        {
            id: "copy-1",
            titulo: "Post principal",
            texto: "O GT dos traders pode ser seu. Participe da campanha BULLCAR e concorra ao HAVAL H6 GT."
        }
    ],
    regras: [
        "Divulgue os materiais oficiais da campanha nas redes sociais.",
        "Utilize as copies sugeridas ou adapte mantendo a mensagem principal.",
        "Acompanhe o período oficial: 03/08 a 03/09."
    ]
};

/**
 * Busca os dados da campanha.
 * Futuro: trocar o corpo por fetch da API/banco.
 *
 * Exemplo:
 *   const response = await fetch(`/api/campanhas/${id}`);
 *   if (!response.ok) throw new Error("Falha ao carregar campanha");
 *   return response.json();
 */
async function obterCampanha(id = CAMPANHA_ID) {
    // Simula latência de rede — remover ao integrar
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!campanhaMock || campanhaMock.id !== id) {
        throw new Error("Campanha não encontrada.");
    }

    return campanhaMock;
}

function setModalState({ loading = false, error = null, ready = false } = {}) {
    modalLoading.hidden = !loading;
    modalError.hidden = !error;
    modalBody.hidden = !ready;

    if (error) {
        modalErrorMessage.textContent = error;
    }
}

function abrirModal() {
    modal.hidden = false;
    requestAnimationFrame(() => {
        modal.classList.add("is-open", "active");
    });
    document.body.style.overflow = "hidden";
    carregarCampanhaNoModal();
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

async function carregarCampanhaNoModal() {
    setModalState({ loading: true });

    try {
        const campanha = await obterCampanha(CAMPANHA_ID);
        popularCampanha(campanha);
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

    document.getElementById("campaignStatus").textContent = campanha.status || "";
    document.getElementById("campaignTitle").textContent = campanha.titulo || "";
    document.getElementById("campaignDescription").textContent = campanha.descricao || "";
    document.getElementById("campaignPeriod").textContent = campanha.periodo || "";
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
    ativarAba("materiais");
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
function renderizarVisaoGeral(visaoGeral) {
    const container = document.getElementById("visaoGeralContent");

    if (!visaoGeral) {
        container.innerHTML = "<p>Conteúdo em breve.</p>";
        return;
    }

    container.innerHTML = `
        <h3>${escapeHtml(visaoGeral.titulo || "Visão Geral")}</h3>
        <p>${escapeHtml(visaoGeral.texto || "")}</p>
    `;
}

function renderizarCopies(copies) {
    const container = document.getElementById("copiesContent");
    container.innerHTML = "";

    if (!copies.length) {
        container.innerHTML = "<p>Nenhuma copy disponível no momento.</p>";
        return;
    }

    copies.forEach((copy) => {
        const item = document.createElement("div");
        item.className = "modal__copy-item";
        item.innerHTML = `
            <h3>${escapeHtml(copy.titulo || "Copy")}</h3>
            <p>${escapeHtml(copy.texto || "")}</p>
            <button type="button" class="btn btn--outline" data-action="copy">
                <i class="fa-regular fa-copy"></i>
                Copiar texto
            </button>
        `;

        item.querySelector('[data-action="copy"]').addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(copy.texto || "");
                const btn = item.querySelector('[data-action="copy"]');
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
                setTimeout(() => {
                    btn.innerHTML = original;
                }, 1600);
            } catch {
                alert("Não foi possível copiar o texto.");
            }
        });

        container.appendChild(item);
    });
}

function renderizarRegras(regras) {

    const container = document.getElementById("modal-rules");


    if (!container) {
        console.warn("Container de regras não encontrado");
        return;
    }


    if (!regras.length) {

        container.innerHTML = `
            <p>Regras em breve.</p>
        `;

        return;
    }


    container.innerHTML = `

        <ul>

            ${regras.map((regra) => `

                <li>

                    <strong>
                        ${regra.titulo}
                    </strong>

                    <p>
                        ${regra.descricao}
                    </p>

                </li>

            `).join("")}

        </ul>

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
        abrirModal();
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

        abrirKitModal();

        // Usa o ID numérico da campanha (nunca o slug/cupom "bullcar")
        let campanha = null;

        if(
            typeof campanhaExibida !== "undefined"
            && campanhaExibida
            && campanhaExibida.id != null
        ){
            campanha = campanhaExibida;
        }else{

            try{

                const resposta = await fetch(
                    "http://localhost:3000/api/campanhas"
                );

                const lista = await resposta.json();
                const arr = Array.isArray(lista) ? lista : [];

                campanha =
                    arr.find(item =>
                        String(item.status || "").toLowerCase() === "ativa"
                    )
                    || arr[0]
                    || null;

            }catch(error){

                console.error(
                    "Erro ao buscar campanha para o kit:",
                    error
                );

            }

        }

        if(!campanha || campanha.id == null){
            console.error(
                "campanha.id não encontrado para carregar o kit"
            );
            return;
        }

        const downloadKit = document.getElementById("downloadKit");

        if(downloadKit){
            downloadKit.href =
                `http://localhost:3000/api/download/kit/${campanha.id}`;
            downloadKit.removeAttribute("target");
            downloadKit.removeAttribute("rel");
            downloadKit.setAttribute("download", "");
        }

        carregarKit(campanha.id);

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
