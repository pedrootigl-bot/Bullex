let campanhas = [];

let filtroAtual = "Todos";


function inicioDoDiaLocal(data = new Date()){
    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
    );
}


function parseDataCampanha(valor){
    if(!valor) return null;

    if(typeof valor === "string" && /^\d{4}-\d{2}-\d{2}/.test(valor)){
        const [ano, mes, dia] = valor.slice(0, 10).split("-").map(Number);
        return new Date(ano, mes - 1, dia);
    }

    const data = new Date(valor);
    if(Number.isNaN(data.getTime())) return null;
    return inicioDoDiaLocal(data);
}


/**
 * Campanha visível no hub público: ativa OU em aquecimento (pre_active).
 * Agendada e Finalizada ficam só no admin.
 */
function campanhaEstaVisivel(campanha){
    const status = String(campanha?.status || "")
        .toLowerCase()
        .trim();

    return status === "ativa" || status === "em_aquecimento";
}

function statusHubCampanha(campanha){
    const status = String(campanha?.status || "")
        .toLowerCase()
        .trim();

    if (status === "em_aquecimento") return "pre_active";
    return status || "";
}

function rotuloStatusHub(campanha){
    const hub = statusHubCampanha(campanha);
    if (hub === "pre_active") return "EM AQUECIMENTO";
    if (hub === "ativa") return "ATIVA";
    return String(campanha?.status || "Campanha").toUpperCase();
}


async function carregarCampanhas(){

    const resposta = await fetch(
        apiUrl("/api/campanhas")
    );

    if (!resposta.ok) {
        console.error("Erro ao carregar campanhas:", resposta.status);
        campanhas = [];
        renderizarCampanhas();
        return;
    }

    const dados = await resposta.json();
    const lista = Array.isArray(dados) ? dados : (dados.campanhas ?? []);

    campanhas = lista.filter(campanhaEstaVisivel);

    console.log(
        "[hub] campanhas API:",
        lista.length,
        "| visíveis:",
        campanhas.length
    );

    renderizarCampanhas();

}


function categoriasDaCampanha(campanha){

    return String(campanha?.categoria || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

}


function formatarDataBR(data){

    if(!data) return "-";

    const limpa = String(data).slice(0, 10);
    const partes = limpa.split("-");

    if(partes.length !== 3) return limpa;

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;

}


function escapeHtmlCampanha(valor){

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


function renderizarCampanhas(){

    const lista = document.querySelector("#campaign-list");

    if(!lista) return;

    lista.innerHTML = "";


    const campanhasFiltradas = filtroAtual === "Todos"
        ? campanhas
        : campanhas.filter((campanha) =>
            categoriasDaCampanha(campanha).includes(filtroAtual)
        );


    campanhasFiltradas.forEach((campanha) => {

        const card = document.createElement("article");
        card.classList.add("campaign-card");

        const categorias = categoriasDaCampanha(campanha);
        const hubStatus = statusHubCampanha(campanha);
        const rotuloStatus = rotuloStatusHub(campanha);
        const tagsHtml = categorias.length
            ? categorias.map((categoria) => `
                <span>${escapeHtmlCampanha(categoria)}</span>
            `).join("")
            : "";

        const dataFim = formatarDataBR(campanha.data_fim);

        card.classList.toggle("is-pre-active", hubStatus === "pre_active");
        card.dataset.status = hubStatus;

        card.innerHTML = `

            <img 
                src="${escapeHtmlCampanha(campanha.imagem_card ?? campanha.banner ?? "images/default.jpg")}"
                alt="${escapeHtmlCampanha(campanha.titulo)}"
            >


            <div class="campaign-content">


                <div class="tags">
                    <span class="campaign-status campaign-status--${escapeHtmlCampanha(hubStatus || "ativa")}" data-status="${escapeHtmlCampanha(hubStatus)}">
                        ${escapeHtmlCampanha(rotuloStatus)}
                    </span>
                    ${tagsHtml}
                </div>



                <h3>
                    ${escapeHtmlCampanha(campanha.titulo)}
                </h3>



                <p>
                    ${escapeHtmlCampanha(campanha.descricao)}
                </p>



                <strong>
                    Cupom: ${escapeHtmlCampanha(campanha.cupom ?? "Sem cupom")}
                </strong>


                <p class="campaign-end-date">
                    <i class="fa-regular fa-calendar"></i>
                    Termina em: ${escapeHtmlCampanha(dataFim)}
                </p>



                <div class="actions">

                    <button
                        type="button"
                        class="btn-abrir-campanha"
                        data-campanha-id="${campanha.id}"
                    >
                        Ver campanha
                    </button>


                    <button
                        type="button"
                        class="btn-abrir-campanha"
                        data-campanha-id="${campanha.id}"
                    >
                        Detalhes
                    </button>

                </div>



            </div>

        `;


        lista.appendChild(card);


    });


}




document
.querySelectorAll(".campaign-filters button")
.forEach((botao) => {


    botao.addEventListener("click", ()=>{


        document
        .querySelector(".campaign-filters .active")
        ?.classList.remove("active");



        botao.classList.add("active");



        filtroAtual = botao.dataset.filter;



        renderizarCampanhas();


    });


});




carregarCampanhas();
