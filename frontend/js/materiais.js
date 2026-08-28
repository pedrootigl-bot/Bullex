/**
 * Carrega materiais da campanha (seção auxiliar)
 * Nomes próprios para NÃO sobrescrever modal.js / campanha-modal.js
 */

async function carregarMateriaisSecao(campanhaId) {


    try {


        const resposta = await fetch(
            apiUrl(`/api/materiais/${campanhaId}`)
        );


        if(!resposta.ok){

            throw new Error(
                "Erro ao buscar materiais"
            );

        }


        const materiais = await resposta.json();


        renderizarMateriaisSecao(materiais);


    } catch(error){


        console.error(
            "Erro ao carregar materiais:",
            error
        );


    }


}





/**
 * Renderiza os materiais na seção #kitMateriais (se existir)
 */

function renderizarMateriaisSecao(materiais){


    const container = document.querySelector(
        "#kitMateriais"
    );


    if(!container){

        return;

    }


    container.innerHTML = "";


    const lista = Array.isArray(materiais) ? materiais : [];


    lista.forEach((material)=>{


        const card = document.createElement("article");


        card.classList.add(
            "kit-card"
        );


        const tipo = String(material.tipo || "").toLowerCase();
        const titulo = material.titulo || material.nome || "Material";
        const src = material.url || material.imagem || material.arquivo || "";


        if(tipo.includes("imagem") || tipo.includes("image") || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(src)){


            card.innerHTML = `

                <img 
                    src="${src}"
                    alt="${titulo}"
                >

                <h3>
                    ${titulo}
                </h3>

                <p>
                    ${material.descricao ?? ""}
                </p>

                <a 
                    href="${src}"
                    download
                    class="btn"
                >
                    Baixar imagem
                </a>

            `;


        } else if(tipo.includes("video")){


            card.innerHTML = `

                <h3>
                    ${titulo}
                </h3>

                <p>
                    ${material.descricao ?? ""}
                </p>


                <video controls>

                    <source src="${src}">

                </video>

            `;


        } else if(src){


            card.innerHTML = `

                <h3>
                    ${titulo}
                </h3>

                <p>
                    ${material.descricao ?? ""}
                </p>

                <a 
                    href="${src}"
                    download
                    class="btn"
                >
                    Baixar
                </a>

            `;


        }


        container.appendChild(card);


    });

    container.querySelectorAll("a.btn[download], a.btn[href]").forEach((link) => {
        const texto = String(link.textContent || "").toLowerCase();
        if (!texto.includes("baixar")) return;

        link.setAttribute("data-download-action", "file");
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const url = link.getAttribute("href");
            const card = link.closest(".kit-card");
            const titulo =
                card?.querySelector("h3")?.textContent?.trim()
                || "Material";

            if (window.BullexDownload?.startDownload) {
                window.BullexDownload.startDownload({
                    type: "file",
                    url,
                    nome: titulo,
                    label: "Baixando arquivo"
                });
                return;
            }

            if (typeof forcarDownloadArquivo === "function") {
                forcarDownloadArquivo(event, url, titulo);
            }
        });
    });


}






/**
 * Botão abrir kit completo
 */

function iniciarKitMateriais(){


    const botao = document.querySelector(
        "#openKitModal, #highlightOpenKit"
    );


    if(!botao){

        return;

    }


    // Se modal.js já controla #openKitModal, não duplica
    if(
        botao.id === "openKitModal"
        && (
            typeof abrirKitModal === "function"
            || typeof abrirModal === "function"
        )
    ){
        return;
    }


    botao.addEventListener(
    "click",
    (evento)=>{


        evento.preventDefault();


        const campanhaId =
            botao.dataset.campanhaId
            || window.campanhaDestaqueAtual?.id
            || null;


        if(typeof abrirModal === "function"){

            abrirModal(campanhaId);

            return;

        }


        if(campanhaId){
            carregarMateriaisSecao(campanhaId);
        }


    }
);
}
