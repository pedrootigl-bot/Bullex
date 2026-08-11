const API = "http://localhost:3000";

const container = document.querySelector("#campanhasContainer");

// ======================================================
// CARREGAR CAMPANHAS
// ======================================================

async function carregarCampanhas() {

    if (!container) {
        console.error(
            "Container #campanhasContainer não encontrado."
        );
        return;
    }

    try {

        const resposta = await fetch(
            `${API}/api/campanhas`
        );

        const campanhas = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                campanhas.erro ||
                "Erro ao carregar campanhas."
            );

        }

        container.innerHTML = "";

        if (
            !Array.isArray(campanhas) ||
            campanhas.length === 0
        ) {

            container.innerHTML = `
                <div class="campanhas-vazia">
                    <p>
                        Nenhuma campanha cadastrada.
                    </p>
                </div>
            `;

            return;
        }

        campanhas.forEach((campanha) => {

            const card =
                document.createElement("div");

            card.classList.add(
                "campaign-card"
            );

            card.innerHTML = `

                <h2>
                    ${campanha.titulo ?? "Sem título"}
                </h2>

                <p>
                    Categoria:
                    ${campanha.categoria ?? "-"}
                </p>

                <p>
                    Status:
                    ${campanha.status ?? "-"}
                </p>

                <p>
                    Início:
                    ${campanha.data_inicio ?? "-"}
                </p>

                <p>
                    Fim:
                    ${campanha.data_fim ?? "-"}
                </p>

                <p>
                    Prêmio:
                    ${campanha.premio ?? "-"}
                </p>

                <div class="campaign-card__actions">

                    <button
                        type="button"
                        class="btn-visualizar"
                        data-id="${campanha.id}"
                    >
                        Visualizar
                    </button>

                    <button
                        type="button"
                        class="btn-editar"
                        data-id="${campanha.id}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="btn-excluir"
                        data-id="${campanha.id}"
                    >
                        Excluir
                    </button>

                </div>
            `;

            container.appendChild(card);


            // ==========================================
            // VISUALIZAR
            // ==========================================

            const btnVisualizar =
                card.querySelector(
                    ".btn-visualizar"
                );

            if (btnVisualizar) {

                btnVisualizar.addEventListener(
                    "click",
                    () => {

                        const id =
                            btnVisualizar.dataset.id;

                        console.log(
                            "Visualizando campanha:",
                            id
                        );

                        window.location.href =
                            `campanha-detalhes.html?id=${id}`;

                    }
                );

            }


            // ==========================================
            // EDITAR
            // ==========================================

            const btnEditar =
                card.querySelector(
                    ".btn-editar"
                );

            if (btnEditar) {

                btnEditar.addEventListener(
                    "click",
                    () => {

                        const id =
                            btnEditar.dataset.id;

                        console.log(
                            "Editando campanha:",
                            id
                        );

                        window.location.href =
                            `campanha-form.html?id=${id}`;

                    }
                );

            }


            // ==========================================
            // EXCLUIR
            // ==========================================

            const btnExcluir =
                card.querySelector(
                    ".btn-excluir"
                );

            if (btnExcluir) {

                btnExcluir.addEventListener(
                    "click",
                    async () => {

                        const id =
                            btnExcluir.dataset.id;

                        const confirmar =
                            confirm(
                                "Tem certeza que deseja excluir esta campanha?"
                            );

                        if (!confirmar) {
                            return;
                        }

                        try {

                            btnExcluir.disabled = true;

                            btnExcluir.textContent =
                                "Excluindo...";


                            const resposta =
                                await fetch(
                                    `${API}/api/campanhas/${id}`,
                                    {
                                        method: "DELETE",
                                        headers: await getAuthHeaders()
                                    }
                                );


                            const resultado =
                                await resposta.json();


                            if (!resposta.ok) {

                                throw new Error(
                                    resultado.erro ||
                                    "Erro ao excluir campanha."
                                );

                            }


                            console.log(
                                "Campanha excluída:",
                                id
                            );


                            await carregarCampanhas();


                        } catch (error) {

                            console.error(
                                "Erro ao excluir campanha:",
                                error
                            );


                            alert(
                                error.message ||
                                "Não foi possível excluir a campanha."
                            );


                            btnExcluir.disabled =
                                false;

                            btnExcluir.textContent =
                                "Excluir";

                        }

                    }
                );

            }

        });

    } catch (error) {

        console.error(
            "Erro campanhas:",
            error
        );


        container.innerHTML = `
            <div class="campanhas-erro">

                <p>
                    Não foi possível carregar as campanhas.
                </p>

                <button
                    type="button"
                    id="tentarNovamente"
                >
                    Tentar novamente
                </button>

            </div>
        `;


        const tentarNovamente =
            document.querySelector(
                "#tentarNovamente"
            );


        if (tentarNovamente) {

            tentarNovamente.addEventListener(
                "click",
                carregarCampanhas
            );

        }

    }

}


// ======================================================
// VOLTAR PARA DASHBOARD
// ======================================================

const voltar =
    document.querySelector("#voltarBtn");

if (voltar) {

    voltar.addEventListener(
        "click",
        () => {

            window.location.href =
                "dashboard.html";

        }
    );

}


// ======================================================
// NOVA CAMPANHA
// ======================================================

const novaCampanha =
    document.querySelector("#novaCampanha");

if (novaCampanha) {

    novaCampanha.addEventListener(
        "click",
        () => {

            window.location.href =
                "campanha-form.html";

        }
    );

}


// ======================================================
// INICIAR
// ======================================================

(async () => {
    const session = await requireAdminSession();
    if (!session) return;

    if (container) {
        carregarCampanhas();
    }
})();