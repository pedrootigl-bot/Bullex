document.addEventListener("DOMContentLoaded", function () {

    console.log("campanha-form.js carregado");


    // ==========================================
    // BOTÃO VOLTAR
    // ==========================================

    const voltarBtn = document.getElementById("voltarBtn");

    if (voltarBtn) {

        voltarBtn.addEventListener("click", function () {

            window.location.href = "campanhas.html";

        });

    }


    // ==========================================
    // FORMULÁRIO
    // ==========================================

    const form = document.getElementById("campanha-form");

    if (!form) {

        console.error(
            "Formulário #campanha-form não encontrado."
        );

        return;

    }


    // ==========================================
    // SUBMIT
    // ==========================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();


        console.log("Formulário enviado");


        const submitButton =
            form.querySelector('button[type="submit"]');


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent = "Criando...";

        }


        try {

            // ==========================================
            // PEGAR DADOS
            // ==========================================

            const dados = {

                titulo:
                    document.getElementById("titulo").value.trim(),

                descricao:
                    document.getElementById("descricao").value.trim(),

                categoria:
                    document.getElementById("categoria").value.trim(),

                objetivo:
                    document.getElementById("objetivo").value.trim(),

                premio:
                    document.getElementById("premio").value.trim(),

                cupom:
                    document.getElementById("cupom").value.trim(),

                deposito_minimo:
                    document.getElementById("deposito_minimo").value,

                data_inicio:
                    document.getElementById("data_inicio").value,

                data_fim:
                    document.getElementById("data_fim").value,

                status:
                    document.getElementById("status").value,

                imagem_card:
                    document.getElementById("imagem_card").value.trim()

            };


            console.log(
                "Dados que serão enviados:",
                dados
            );


            // ==========================================
            // VALIDAÇÃO
            // ==========================================

            if (!dados.titulo) {

                alert("Digite o título da campanha.");

                return;

            }


            if (!dados.data_inicio) {

                alert("Informe a data de início.");

                return;

            }


            if (!dados.data_fim) {

                alert("Informe a data de fim.");

                return;

            }


            if (dados.data_fim < dados.data_inicio) {

                alert(
                    "A data de fim não pode ser anterior à data de início."
                );

                return;

            }


            // ==========================================
            // POST
            // ==========================================

            console.log(
                "Enviando campanha para API..."
            );


            const response = await fetch(
                "http://localhost:3000/api/campanhas",
                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify(dados)

                }
            );


            const resultado =
                await response.json();


            console.log(
                "Resposta da API:",
                resultado
            );


            // ==========================================
            // ERRO
            // ==========================================

            if (!response.ok) {

                throw new Error(
                    resultado.erro ||
                    "Erro ao criar campanha."
                );

            }


            // ==========================================
            // SUCESSO
            // ==========================================

            console.log(
                "Campanha criada:",
                resultado.campanha
            );


            alert(
                "Campanha criada com sucesso!"
            );


            window.location.href =
                "campanhas.html";


        } catch (error) {

            console.error(
                "Erro ao criar campanha:",
                error
            );


            alert(
                error.message ||
                "Erro ao criar campanha."
            );


        } finally {

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Criar campanha";

            }

        }

    });

});