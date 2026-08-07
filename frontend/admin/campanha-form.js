const API = "http://localhost:3000";



const form = document.querySelector("#campanhaForm");

const mensagem = document.querySelector("#mensagem");

const voltarBtn = document.querySelector("#voltarBtn");





// voltar para campanhas

if(voltarBtn){

    voltarBtn.addEventListener(
        "click",
        ()=>{

            window.location.href =
            "campanhas.html";

        }
    );

}





// criar campanha

form.addEventListener(
"submit",
async(e)=>{


e.preventDefault();




const campanha = {


    titulo:
    document.querySelector("#titulo").value,


    descricao:
    document.querySelector("#descricao").value,


    categoria:
    document.querySelector("#categoria").value,


    objetivo:
    document.querySelector("#objetivo").value,


    premio:
    document.querySelector("#premio").value,


    cupom:
    document.querySelector("#cupom").value,


    deposito_minimo:
    document.querySelector("#deposito_minimo").value,


    data_inicio:
    document.querySelector("#data_inicio").value,


    data_fim:
    document.querySelector("#data_fim").value,


    status:
    document.querySelector("#status").value,


    imagem_card:
    document.querySelector("#imagem_card").value



};




try{


    mensagem.textContent =
    "Criando campanha...";




    const resposta = await fetch(

        `${API}/api/campanhas`,

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:
            JSON.stringify(campanha)

        }

    );





    const resultado =
    await resposta.json();





    if(!resposta.ok){


        throw new Error(
            resultado.erro ||
            "Erro ao criar campanha"
        );


    }





    mensagem.textContent =
    "Campanha criada com sucesso!";





    setTimeout(()=>{


        window.location.href =
        "campanhas.html";


    },1000);






}catch(error){


    console.error(
        "Erro criar campanha:",
        error
    );


    mensagem.textContent =
    error.message;


}



});