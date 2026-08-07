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
    materiais: [
        {
            id: "story-bullcar",
            titulo: "Story BULLCAR",
            imagem: "assets/images/post.png",
            resolucao: "1080 × 1920",
            download: "#",
            preview: "assets/images/post.png"
        }
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
    downloadKit.href = campanha.kit || "#";
    downloadKit.target = "_blank";
    downloadKit.rel = "noopener";

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
    container.innerHTML = "";

    if (!materiais.length) {
        container.innerHTML = "<p>Nenhum material disponível no momento.</p>";
        return;
    }

    materiais.forEach((material) => {
        const card = document.createElement("div");
        card.className = "material-card";
        card.dataset.materialId = material.id || "";

        card.innerHTML = `
            <img src="${material.imagem}" alt="${escapeHtml(material.titulo)}">
            <div class="material-info">
                <h3>${escapeHtml(material.titulo)}</h3>
                <span>${escapeHtml(material.resolucao || "")}</span>
            </div>
            <div class="material-actions">
                <button type="button" class="btn btn--outline" data-action="preview">
                    <i class="fa-regular fa-eye"></i>
                    Visualizar
                </button>
                <a href="${material.download || "#"}" class="btn" target="_blank" rel="noopener">
                    <i class="fa-solid fa-download"></i>
                    Baixar
                </a>
            </div>
        `;

        const previewBtn = card.querySelector('[data-action="preview"]');
        previewBtn.addEventListener("click", () => {
            const url = material.preview || material.imagem;
            if (url) window.open(url, "_blank", "noopener");
        });

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
    const container = document.getElementById("regrasContent");

    if (!regras.length) {
        container.innerHTML = "<p>Regras em breve.</p>";
        return;
    }

    container.innerHTML = `
        <h3>Regras da campanha</h3>
        <ul>
            ${regras.map((regra) => `<li>${escapeHtml(regra)}</li>`).join("")}
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
        fecharModal();
    }
});