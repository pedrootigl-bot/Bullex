/**
 * Carrega o destaque do dia pela API
 */

async function carregarDestaque() {

    try {

        const resposta = await fetch(
            "http://localhost:3000/api/destaque"
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar destaque"
            );

        }


        const destaque = await resposta.json();


        if (!destaque) {

            console.warn(
                "Nenhum destaque encontrado"
            );

            return;

        }



        const tag = document.querySelector("#highlightTag");
        const titulo = document.querySelector("#highlightTitle");
        const descricao = document.querySelector("#highlightDescription");
        const imagem = document.querySelector("#highlightImage");
        const copy = document.querySelector("#highlightCopy");
        const downloadStory = document.querySelector("#highlightDownloadStory");



        if(tag){

            tag.textContent = "DESTAQUE DO DIA";

        }


        if(titulo){

            titulo.textContent = destaque.titulo;

        }


        if(descricao){

            descricao.textContent = destaque.descricao;

        }


        if(imagem){

            imagem.src = destaque.imagem;
            imagem.alt = destaque.titulo;

        }


        if(copy){

            copy.textContent = destaque.copy;

        }

       if(downloadStory && destaque.story_url){

    downloadStory.href = 
        destaque.story_url + "?download=teste.png";

}

    } catch(error) {


        console.error(
            "Erro ao carregar destaque:",
            error
        );


    }

}





/**
 * Ações dos botões do destaque
 */

function iniciarAcoesDestaque(){


    const botaoCopiar = document.querySelector(
        "#highlightCopyBtn"
    );


    const campoCopy = document.querySelector(
        "#highlightCopy"
    );



    if(botaoCopiar && campoCopy){


        botaoCopiar.addEventListener(
            "click",
            async () => {


                try {


                    await navigator.clipboard.writeText(
                        campoCopy.textContent
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



                } catch(error) {


                    console.error(
                        "Erro ao copiar texto:",
                        error
                    );


                }


            }
        );


    }


}