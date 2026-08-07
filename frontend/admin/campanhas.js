const API = "http://localhost:3000";



const container =
document.querySelector("#campanhasContainer");




// Carregar campanhas
async function carregarCampanhas(){


    try{


        const resposta = await fetch(
            `${API}/api/campanhas`
        );


        const campanhas =
        await resposta.json();



        container.innerHTML = "";



        campanhas.forEach(campanha => {

              console.log(campanha);


            const card =
            document.createElement("div");


            card.className =
            "stat-card";



           card.innerHTML = `

                    <h2>
                        ${campanha.titulo}
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


                    <button>
                        Editar
                    </button>


                    <button>
                        Excluir
                    </button>

                `;


            container.appendChild(card);



        });



    }catch(error){


        console.error(
            "Erro campanhas:",
            error
        );


    }


}





// voltar dashboard
const voltar =
document.querySelector("#voltarBtn");


if(voltar){


    voltar.onclick = ()=>{


        window.location.href =
        "dashboard.html";


    };


}





// botão nova campanha

document.querySelector("#novaCampanha")
.onclick = ()=>{


    alert(
        "Área de criação será adicionada"
    );


};





carregarCampanhas();