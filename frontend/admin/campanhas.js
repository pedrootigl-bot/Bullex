const API = "http://localhost:3000";

const container = document.querySelector("#campanhasContainer");
let campanhasCache = [];
let featuredId = null;

function escaparHtml(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function formatarData(valor) {
    if (!valor) return "—";
    const raw = String(valor).slice(0, 10);
    const [ano, mes, dia] = raw.split("-");
    if (!ano || !mes || !dia) return escaparHtml(valor);
    return `${dia}/${mes}/${ano}`;
}

function normalizarStatus(status) {
    return String(status || "—").trim().toLowerCase();
}

function statusClass(status) {
    const s = normalizarStatus(status);
    if (s.includes("ativa")) return "is-ativa";
    if (s.includes("program")) return "is-programada";
    if (s.includes("paus")) return "is-pausada";
    if (s.includes("final")) return "is-finalizada";
    return "";
}

function imagemCampanha(campanha) {
    return (
        campanha?.imagem_card
        || campanha?.banner
        || campanha?.imagem
        || campanha?.story_url
        || "../images/post.png"
    );
}

function atualizarStats(stats, campanhas) {
    const elCampanhas = document.querySelector("#statCampanhas");
    const elMateriais = document.querySelector("#statMateriais");
    const elCopies = document.querySelector("#statCopies");
    const elVideos = document.querySelector("#statVideos");
    const elHint = document.querySelector("#statCampanhasHint");
    const elCount = document.querySelector("#campanhasCount");

    if (elCampanhas) elCampanhas.textContent = stats?.campanhas ?? campanhas.length;
    if (elMateriais) elMateriais.textContent = stats?.materiais ?? 0;
    if (elCopies) elCopies.textContent = stats?.copies ?? 0;
    if (elVideos) elVideos.textContent = stats?.videos ?? 0;
    if (elCount) elCount.textContent = String(campanhas.length);

    const ativas = campanhas.filter((c) => normalizarStatus(c.status).includes("ativa")).length;
    if (elHint) elHint.textContent = `${ativas} ativas`;
}

function preencherCategorias(campanhas) {
    const select = document.querySelector("#filtroCategoria");
    if (!select) return;

    const atual = select.value;
    const categorias = [...new Set(
        campanhas
            .flatMap((c) => String(c.categoria || "").split(","))
            .map((c) => c.trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "pt-BR"));

    select.innerHTML = `<option value="">Todas as categorias</option>`;
    categorias.forEach((categoria) => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });

    if (atual) select.value = atual;
}

function escolherDestaque(campanhas) {
    return (
        campanhas.find((c) => normalizarStatus(c.status).includes("ativa"))
        || campanhas[0]
        || null
    );
}

let featuredIndex = 0;
let featuredTimer = null;
let featuredLista = [];

function pararCarouselFeatured() {
    if (featuredTimer) {
        clearInterval(featuredTimer);
        featuredTimer = null;
    }
}

function iniciarCarouselFeatured() {
    pararCarouselFeatured();
    if (featuredLista.length <= 1) return;

    featuredTimer = setInterval(() => {
        irParaFeatured((featuredIndex + 1) % featuredLista.length);
    }, 4500);
}

function atualizarFeatured(campanha) {
    featuredId = campanha?.id ?? null;

    const card = document.querySelector("#featuredCampaign");
    const title = document.querySelector("#featuredTitle");
    const desc = document.querySelector("#featuredDescription");
    const categoria = document.querySelector("#featuredCategoria");
    const status = document.querySelector("#featuredStatus");
    const periodo = document.querySelector("#featuredPeriodo");
    const premio = document.querySelector("#featuredPremio");

    card?.classList.remove("is-switching");
    // force reflow for animation restart
    void card?.offsetWidth;
    card?.classList.add("is-switching");

    if (!campanha) {
        if (title) title.textContent = "Nenhuma campanha";
        if (desc) desc.textContent = "Cadastre uma campanha para destacar aqui.";
        if (categoria) categoria.textContent = "—";
        if (status) status.textContent = "—";
        if (periodo) periodo.textContent = "—";
        if (premio) premio.textContent = "—";
        return;
    }

    if (title) title.textContent = campanha.titulo || "Sem título";
    if (desc) desc.textContent = campanha.descricao || campanha.objetivo || "Campanha em destaque.";
    if (categoria) categoria.textContent = campanha.categoria || "—";
    if (status) status.textContent = campanha.status || "—";
    if (periodo) {
        periodo.textContent = `${formatarData(campanha.data_inicio)} — ${formatarData(campanha.data_fim)}`;
    }
    if (premio) premio.textContent = campanha.premio || campanha.valor || "—";
}

function irParaFeatured(index) {
    if (!featuredLista.length) return;

    featuredIndex = (index + featuredLista.length) % featuredLista.length;
    const campanha = featuredLista[featuredIndex];
    atualizarFeatured(campanha);

    const slides = document.querySelectorAll("#featuredCarouselTrack .featured-carousel__slide");
    const dots = document.querySelectorAll("#featuredCarouselDots button");

    slides.forEach((slide, i) => {
        const ativo = i === featuredIndex;
        slide.classList.toggle("is-active", ativo);

        if (ativo) {
            const img = slide.querySelector("img");
            const src = imagemCampanha(campanha);
            if (img) {
                img.src = src;
                img.alt = campanha.titulo || "Campanha";
            }
        }
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === featuredIndex);
    });
}

function montarCarouselFeatured(campanhas) {
    featuredLista = (Array.isArray(campanhas) ? campanhas.slice() : []).sort((a, b) => {
        const aAtiva = normalizarStatus(a.status).includes("ativa") ? 0 : 1;
        const bAtiva = normalizarStatus(b.status).includes("ativa") ? 0 : 1;
        return aAtiva - bAtiva;
    });
    const track = document.querySelector("#featuredCarouselTrack");
    const dotsWrap = document.querySelector("#featuredCarouselDots");
    const prevBtn = document.querySelector("#featuredPrev");
    const nextBtn = document.querySelector("#featuredNext");
    const media = document.querySelector(".featured-card__media");

    if (!track || !dotsWrap) return;

    pararCarouselFeatured();
    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    if (!featuredLista.length) {
        track.innerHTML = `
            <div class="featured-carousel__slide is-active">
                <div class="featured-carousel__empty">Sem campanhas</div>
            </div>
        `;
        atualizarFeatured(null);
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        return;
    }

    featuredLista.forEach((campanha, index) => {
        const slide = document.createElement("div");
        slide.className = "featured-carousel__slide" + (index === 0 ? " is-active" : "");
        slide.dataset.campanhaId = String(campanha.id);

        const img = document.createElement("img");
        img.src = imagemCampanha(campanha);
        img.alt = campanha.titulo || "Campanha";
        img.loading = index === 0 ? "eager" : "lazy";
        slide.appendChild(img);
        track.appendChild(slide);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Campanha ${index + 1}: ${campanha.titulo || ""}`);
        if (index === 0) dot.classList.add("is-active");
        dot.addEventListener("click", () => {
            irParaFeatured(index);
            iniciarCarouselFeatured();
        });
        dotsWrap.appendChild(dot);
    });

    const multi = featuredLista.length > 1;
    if (prevBtn) prevBtn.hidden = !multi;
    if (nextBtn) nextBtn.hidden = !multi;

    featuredIndex = 0;
    irParaFeatured(0);
    iniciarCarouselFeatured();

    if (media && !media.dataset.carouselBound) {
        media.dataset.carouselBound = "1";
        media.addEventListener("mouseenter", pararCarouselFeatured);
        media.addEventListener("mouseleave", iniciarCarouselFeatured);
    }
}

function atualizarAtividade(campanhas) {
    const lista = document.querySelector("#atividadeRecente");
    if (!lista) return;

    const recentes = campanhas.slice(0, 4);
    if (!recentes.length) {
        lista.innerHTML = `
            <li>
                <span class="activity-dot activity-dot--green"></span>
                <div>
                    <strong>Nenhuma atividade recente</strong>
                    <small>cadastre a primeira campanha</small>
                </div>
            </li>
        `;
        return;
    }

    lista.innerHTML = recentes.map((campanha, index) => {
        const dots = ["activity-dot--green", "activity-dot--orange", "activity-dot--blue", "activity-dot--green"];
        return `
            <li>
                <span class="activity-dot ${dots[index % dots.length]}"></span>
                <div>
                    <strong>${escaparHtml(campanha.titulo || "Campanha")}</strong>
                    <small>${escaparHtml(campanha.status || "atualizada")}</small>
                </div>
            </li>
        `;
    }).join("");
}

function normalizarTexto(valor) {
    try {
        return String(valor ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    } catch {
        return String(valor ?? "").toLowerCase().trim();
    }
}

function textoBuscavelCampanha(campanha) {
    return normalizarTexto([
        campanha?.id,
        campanha?.titulo,
        campanha?.nome,
        campanha?.descricao,
        campanha?.categoria,
        campanha?.cupom,
        campanha?.premio,
        campanha?.valor,
        campanha?.objetivo,
        campanha?.status
    ].filter((item) => item !== undefined && item !== null && item !== "").join(" "));
}

/**
 * Filtra a lista em memória pela busca do topbar + selects de categoria/status.
 */
function campanhasFiltradas() {
    const termoBusca = normalizarTexto(
        document.querySelector("#campanhaSearch")?.value || ""
    );
    const termos = termoBusca ? termoBusca.split(/\s+/).filter(Boolean) : [];

    const categoria = normalizarTexto(
        document.querySelector("#filtroCategoria")?.value || ""
    );
    const status = normalizarTexto(
        document.querySelector("#filtroStatus")?.value || ""
    );

    const base = Array.isArray(campanhasCache) ? campanhasCache : [];

    return base.filter((campanha) => {
        const texto = textoBuscavelCampanha(campanha);
        const cats = normalizarTexto(campanha.categoria);
        const st = normalizarTexto(campanha.status);

        const okBusca =
            termos.length === 0
            || termos.every((termo) => texto.includes(termo));

        const okCategoria = !categoria || cats.includes(categoria);
        const okStatus = !status || st.includes(status);

        return okBusca && okCategoria && okStatus;
    });
}

function bindRowActions(row, campanha) {
    const btnVisualizar = row.querySelector(".btn-visualizar");
    const btnEditar = row.querySelector(".btn-editar");
    const btnExcluir = row.querySelector(".btn-excluir");

    btnVisualizar?.addEventListener("click", () => {
        abrirDetalhesCampanha(campanha);
    });

    btnEditar?.addEventListener("click", () => {
        window.location.href = `campanha-form.html?id=${campanha.id}`;
    });

    btnExcluir?.addEventListener("click", async () => {
        const confirmar = confirm("Tem certeza que deseja excluir esta campanha?");
        if (!confirmar) return;

        try {
            btnExcluir.disabled = true;

            const resposta = await fetch(`${API}/api/campanhas/${campanha.id}`, {
                method: "DELETE",
                headers: await getAuthHeaders()
            });

            const resultado = await resposta.json();
            if (!resposta.ok) {
                throw new Error(resultado.erro || "Erro ao excluir campanha.");
            }

            await carregarCampanhas();
        } catch (error) {
            console.error("Erro ao excluir campanha:", error);
            alert(error.message || "Não foi possível excluir a campanha.");
            btnExcluir.disabled = false;
        }
    });
}

function atualizarContagemTabela(total) {
    const elCount = document.querySelector("#campanhasCount");
    if (elCount) elCount.textContent = String(total);
}

function renderizarTabela(campanhas) {
    if (!container) return;

    atualizarContagemTabela(campanhas.length);

    if (!campanhas.length) {
        const temFiltro =
            Boolean(document.querySelector("#campanhaSearch")?.value.trim())
            || Boolean(document.querySelector("#filtroCategoria")?.value)
            || Boolean(document.querySelector("#filtroStatus")?.value);

        container.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="campanhas-vazia">
                        <p>${
                            temFiltro
                                ? "Nenhuma campanha encontrada para esta busca."
                                : "Nenhuma campanha encontrada."
                        }</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    container.innerHTML = "";

    campanhas.forEach((campanha) => {
        const row = document.createElement("tr");
        const status = campanha.status || "—";
        const statusCls = statusClass(status);

        row.innerHTML = `
            <td>
                <div class="campaign-cell">
                    <img src="${escaparHtml(imagemCampanha(campanha))}" alt="">
                    <div>
                        <strong>${escaparHtml(campanha.titulo || "Sem título")}</strong>
                        <small>#${escaparHtml(campanha.id)} ${campanha.cupom ? "· " + escaparHtml(campanha.cupom) : ""}</small>
                    </div>
                </div>
            </td>
            <td>${escaparHtml(campanha.categoria || "—")}</td>
            <td>
                <span class="status-pill ${statusCls}">
                    <i></i>
                    ${escaparHtml(status)}
                </span>
            </td>
            <td>${formatarData(campanha.data_inicio)}</td>
            <td>${formatarData(campanha.data_fim)}</td>
            <td>${escaparHtml(campanha.premio || campanha.valor || "—")}</td>
            <td>
                <div class="row-actions">
                    <button type="button" class="btn-visualizar" title="Visualizar" aria-label="Visualizar">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                    <button type="button" class="btn-editar" title="Editar" aria-label="Editar">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="btn-excluir" title="Excluir" aria-label="Excluir">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                </div>
            </td>
        `;

        container.appendChild(row);
        bindRowActions(row, campanha);
    });
}

async function carregarStatsApi() {
    try {
        const resposta = await fetch(`${API}/api/stats`);
        if (!resposta.ok) throw new Error("Erro stats");
        return await resposta.json();
    } catch (error) {
        console.error("Erro stats:", error);
        return null;
    }
}

async function carregarCampanhas() {
    if (!container) {
        console.error("Container #campanhasContainer não encontrado.");
        return;
    }

    try {
        const [resposta, stats] = await Promise.all([
            fetch(`${API}/api/campanhas`),
            carregarStatsApi()
        ]);

        const campanhas = await resposta.json();

        if (!resposta.ok) {
            throw new Error(campanhas.erro || "Erro ao carregar campanhas.");
        }

        campanhasCache = Array.isArray(campanhas) ? campanhas : [];

        atualizarStats(stats, campanhasCache);
        preencherCategorias(campanhasCache);
        montarCarouselFeatured(campanhasCache);
        atualizarAtividade(campanhasCache);
        renderizarTabela(campanhasFiltradas());
    } catch (error) {
        console.error("Erro campanhas:", error);

        container.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="campanhas-erro">
                        <p>Não foi possível carregar as campanhas.</p>
                        <button type="button" id="tentarNovamente">Tentar novamente</button>
                    </div>
                </td>
            </tr>
        `;

        document.querySelector("#tentarNovamente")?.addEventListener("click", carregarCampanhas);
    }
}

function atualizarEstadoFiltro(select) {
    if (!select) return;
    const wrap = select.closest(".campaigns-filter");
    if (!wrap) return;
    wrap.classList.toggle("has-value", Boolean(select.value));
}

function aplicarFiltros() {
    atualizarEstadoFiltro(document.querySelector("#filtroCategoria"));
    atualizarEstadoFiltro(document.querySelector("#filtroStatus"));

    const filtradas = campanhasFiltradas();
    renderizarTabela(filtradas);

    const buscaAtiva = Boolean(
        document.querySelector("#campanhaSearch")?.value.trim()
    );
    document
        .querySelector(".admin-search")
        ?.classList.toggle("is-active", buscaAtiva);
}

function abrirDetalhesCampanha(campanha) {
    if (!campanha?.id) return;
    window.location.href = `campanha-detalhes.html?id=${campanha.id}`;
}

/**
 * Escolhe a campanha mais relevante para o termo digitado.
 * Prioriza título exatamente igual; depois título que começa com o termo;
 * por fim, o primeiro resultado filtrado.
 */
function campanhaParaAbrirPorBusca() {
    const filtradas = campanhasFiltradas();
    if (!filtradas.length) return null;

    const termo = normalizarTexto(
        document.querySelector("#campanhaSearch")?.value || ""
    );

    if (!termo) return filtradas[0];

    const exacta = filtradas.find(
        (c) => normalizarTexto(c.titulo || c.nome) === termo
    );
    if (exacta) return exacta;

    const comecaCom = filtradas.find((c) =>
        normalizarTexto(c.titulo || c.nome).startsWith(termo)
    );
    if (comecaCom) return comecaCom;

    return filtradas[0];
}

function abrirCampanhaDaBusca() {
    aplicarFiltros();

    const campanha = campanhaParaAbrirPorBusca();

    if (!campanha) {
        window.alert("Nenhuma campanha encontrada para esta busca.");
        return;
    }

    abrirDetalhesCampanha(campanha);
}

function ligarBuscaCampanhas() {
    const input = document.querySelector("#campanhaSearch");
    if (!input || input.dataset.buscaLigada === "1") return;

    input.dataset.buscaLigada = "1";

    const executar = () => {
        aplicarFiltros();
    };

    input.addEventListener("input", executar);
    input.addEventListener("change", executar);
    input.addEventListener("search", executar);
    input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") return;
        executar();
    });
    input.addEventListener("paste", () => {
        setTimeout(executar, 0);
    });

    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();
        abrirCampanhaDaBusca();
    });

    // Clique no ícone / área do campo foca o input
    document.querySelector(".admin-search")?.addEventListener("click", (event) => {
        if (event.target === input) return;
        if (event.target.closest("kbd")) {
            input.focus();
            return;
        }
        input.focus();
    });
}

function ligarFiltrosSelect() {
    ["#filtroCategoria", "#filtroStatus"].forEach((seletor) => {
        const select = document.querySelector(seletor);
        if (!select || select.dataset.filtroLigado === "1") return;

        select.dataset.filtroLigado = "1";
        select.addEventListener("change", aplicarFiltros);
        select.addEventListener("focus", () => {
            select.closest(".campaigns-filter")?.classList.add("is-open");
        });
        select.addEventListener("blur", () => {
            select.closest(".campaigns-filter")?.classList.remove("is-open");
        });

        atualizarEstadoFiltro(select);
    });
}

const voltar = document.querySelector("#voltarBtn");
if (voltar) {
    voltar.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
}

const novaCampanha = document.querySelector("#novaCampanha");
if (novaCampanha) {
    novaCampanha.addEventListener("click", () => {
        window.location.href = "campanha-form.html";
    });
}

document.querySelector("#featuredVerDetalhes")?.addEventListener("click", () => {
    if (!featuredId) return;
    window.location.href = `campanha-detalhes.html?id=${featuredId}`;
});

document.querySelector("#featuredEditar")?.addEventListener("click", () => {
    if (!featuredId) return;
    window.location.href = `campanha-form.html?id=${featuredId}`;
});

document.querySelector("#featuredMateriais")?.addEventListener("click", () => {
    if (!featuredId) return;
    window.location.href = `campanha-detalhes.html?id=${featuredId}`;
});

document.querySelector("#featuredPrev")?.addEventListener("click", () => {
    irParaFeatured(featuredIndex - 1);
    iniciarCarouselFeatured();
});

document.querySelector("#featuredNext")?.addEventListener("click", () => {
    irParaFeatured(featuredIndex + 1);
    iniciarCarouselFeatured();
});

document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector("#campanhaSearch")?.focus();
    }
});

(async () => {
    const session = await requireAdminSession();
    if (!session) return;

    ligarBuscaCampanhas();
    ligarFiltrosSelect();

    if (container) {
        await carregarCampanhas();
        aplicarFiltros();
    }
})();
