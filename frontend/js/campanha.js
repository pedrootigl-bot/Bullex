let campanhas = [];

let filtroAtual = "Todos";



async function carregarCampanhas(){

    const resposta = await fetch(
        "http://localhost:3000/api/campanhas"
    );

    campanhas = await resposta.json();


    renderizarCampanhas();

}




function renderizarCampanhas(){

    const lista = document.querySelector("#campaign-list");


    lista.innerHTML = "";


    const campanhasFiltradas = filtroAtual === "Todos"
        ? campanhas
        : campanhas.filter(campanha => 
            campanha.categoria === filtroAtual
        );



    campanhasFiltradas.forEach(campanha => {



        const card = document.createElement("article");


        card.classList.add("campaign-card");



        card.innerHTML = `

            <img 
                src="${campanha.imagem_card ?? campanha.banner ?? 'images/default.jpg'}"
                alt="${campanha.titulo}"
            >


            <div class="campaign-content">


                <div class="tags">

                    <span>
                        ${campanha.categoria ?? campanha.status}
                    </span>

                </div>



                <h3>
                    ${campanha.titulo}
                </h3>



                <p>
                    ${campanha.descricao}
                </p>



                <strong>
                    Cupom: ${campanha.cupom ?? "Sem cupom"}
                </strong>



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
.forEach(botao => {


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