console.log("campanha modal carregado");



async function abrirModalCampanha(id){

    if(!id){
        console.warn(
            "Nenhuma campanha selecionada para o modal"
        );
        return;
    }


    try{

        const resposta = await fetch(
            `http://localhost:3000/api/campanhas/${id}`
        );


        if(!resposta.ok){

            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );

        }


        const campanha = await resposta.json();

        console.log("Campanha carregada:", campanha);


        preencherModalCampanha(campanha);


        await carregarMateriais(campanha.id);
        await carregarCopies(campanha.id);



        const modal =
        document.querySelector("#campaign-modal");


        if(modal){

            modal.classList.add("active");
            document.body.style.overflow = "hidden";

        }


    }catch(error){

        console.error(
            "Erro ao carregar campanha no modal:",
            error
        );

    }

}





async function carregarMateriais(campanhaId){


    const container =
    document.querySelector("#modal-materials");


    if(!container){
        console.error(
            "Elemento #modal-materials não encontrado"
        );
        return;
    }


    if(!campanhaId){
        container.textContent =
            "Nenhum material cadastrado.";
        return;
    }


    container.textContent = "Carregando materiais...";


    try{


        const resposta = await fetch(
            `http://localhost:3000/api/materiais/${campanhaId}`
        );


        if(!resposta.ok){

            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );

        }


        const dados = await resposta.json();


        const materiais = Array.isArray(dados)
            ? dados
            : (dados.materiais ?? []);


        if(materiais.length === 0){

            container.textContent =
                "Nenhum material cadastrado.";
            return;

        }


        container.innerHTML = "";


        materiais.forEach(material => {


            const card =
            document.createElement("div");

            card.className = "material-card";


            const tipo =
            String(material.tipo || "").toLowerCase();

            const url = material.url || "";

            const ehImagem =
                tipo.includes("imagem")
                || tipo.includes("image")
                || /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url);


            if(ehImagem && url){

                const img =
                document.createElement("img");

                img.src = url;
                img.alt = material.nome ?? "Material";
                card.appendChild(img);

            }


            const info =
            document.createElement("div");

            info.className = "material-info";


            const titulo =
            document.createElement("h3");

            titulo.textContent =
                material.nome ?? "Material";


            const meta =
            document.createElement("span");

            meta.textContent =
                material.tipo ?? "";


            info.appendChild(titulo);
            info.appendChild(meta);
            card.appendChild(info);


            const actions =
            document.createElement("div");

            actions.className = "material-actions";


            if(url){

                const link =
                document.createElement("a");

                link.href = url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.className = "btn";
                link.textContent = "Baixar";

                actions.appendChild(link);

            }


            card.appendChild(actions);
            container.appendChild(card);

            console.log("HTML final:", container.innerHTML);


        });


    }catch(error){


        console.error(
            "Erro ao carregar materiais:",
            error
        );


        container.textContent =
            "Erro ao carregar materiais.";


    }


}



async function carregarCopies(campanhaId){

        console.log("Entrou no carregarCopies:", campanhaId);



    const container =
    document.querySelector("#modal-copies");


    if(!container){
        console.error(
            "Elemento #modal-copies não encontrado"
        );
        return;
    }


    if(!campanhaId){
        container.textContent =
            "Nenhuma copy cadastrada.";
        return;
    }


    container.textContent = "Carregando copies...";


    try{


        const resposta = await fetch(
            `http://localhost:3000/api/copies/${campanhaId}`
        );


        if(!resposta.ok){

            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );

        }



        const dados = await resposta.json();

console.log("Dados recebidos copies:", JSON.stringify(dados));

        const copies = Array.isArray(dados)
            ? dados
            : (dados.copies ?? []);


        if(copies.length === 0){

            container.textContent =
                "Nenhuma copy cadastrada.";
            return;

        }


        container.innerHTML = "";


        copies.forEach(copy => {

console.log("Renderizando copy:", JSON.stringify(copy));


            const card = document.createElement("div");

card.className = "copy-card";


// CANAL

const canal = document.createElement("span");

canal.className = "copy-channel";

canal.textContent =
    copy.canal ?? "";



// TÍTULO

const titulo = document.createElement("h4");

titulo.textContent =
    `${copy.canal ?? ""} — ${copy.tipo ?? ""}`;



// TEXTO

const texto = document.createElement("p");

texto.textContent =
    copy.texto ?? "";



// BOTÃO COPIAR

const botao = document.createElement("button");

botao.className = "btn-copy";

botao.textContent = "Copiar texto";


botao.addEventListener("click", async () => {

    await navigator.clipboard.writeText(copy.texto);


    botao.textContent = "Copiado!";


    setTimeout(() => {

        botao.textContent = "Copiar texto";

    }, 2000);

});



// MONTA O CARD

card.appendChild(canal);
card.appendChild(titulo);
card.appendChild(texto);
card.appendChild(botao);


container.appendChild(card);


console.log("HTML final:", container.innerHTML);

                        console.log("HTML final:", container.innerHTML);



        });


    }catch(error){


        console.error(
            "Erro ao carregar copies:",
            error
        );


        container.textContent =
            "Erro ao carregar copies.";


    }


}



function paraLista(valor){


    if(Array.isArray(valor)) return valor;


    if(typeof valor === "string"){

        try{
            const parsed = JSON.parse(valor);
            return Array.isArray(parsed) ? parsed : [];
        }catch{
            return valor.trim() ? [valor] : [];
        }

    }


    return [];


}





function preencherModalCampanha(campanha){



    const imagem =
    document.querySelector("#modal-image");


    if(imagem){

        imagem.src =
            campanha.imagem_card
            ?? campanha.banner
            ?? "images/default.jpg";

    }





    const categoria =
    document.querySelector("#modal-category");


    if(categoria){

        categoria.textContent =
            campanha.categoria ?? "";

    }





    const titulo =
    document.querySelector("#modal-title");


    if(titulo){

        titulo.textContent =
            campanha.titulo ?? "";

    }





    const descricao =
    document.querySelector("#modal-description");


    if(descricao){

        descricao.textContent =
            campanha.descricao ?? "";

    }





    const resumo =
    document.querySelector("#modal-summary");


    if(resumo){

        resumo.textContent =
            campanha.resumo ?? "";

    }





    const premio =
    document.querySelector("#modal-prize");


    if(premio){

        premio.textContent = campanha.premio
            ? `Prêmio: ${campanha.premio}`
            : "";

    }





    const deposito =
    document.querySelector("#modal-deposit");


    if(deposito){

        deposito.textContent = campanha.deposito_minimo
            ? `Depósito mínimo: ${campanha.deposito_minimo}`
            : "";

    }





    const publico =
    document.querySelector("#modal-audience");


    if(publico){

        publico.textContent = campanha.publico_recomendado
            ? `Público: ${campanha.publico_recomendado}`
            : "";

    }





    const objetivo =
    document.querySelector("#modal-objective");


    if(objetivo){

        objetivo.textContent = campanha.objetivo
            ? `Objetivo: ${campanha.objetivo}`
            : "";

    }





    const cupom =
    document.querySelector("#modal-coupon");


    if(cupom){

        cupom.textContent =
            campanha.cupom ?? "Sem cupom";

    }





    const inicio =
    document.querySelector("#modal-start");


    if(inicio){

        inicio.textContent =
            formatarDataModal(
                campanha.data_inicio
            );

    }





    const fim =
    document.querySelector("#modal-end");


    if(fim){

        fim.textContent =
            formatarDataModal(
                campanha.data_fim
            );

    }





    const mecanica =
    document.querySelector("#modal-mechanics");


    if(mecanica){

        mecanica.innerHTML = "";


        paraLista(campanha.mecanica).forEach(item => {


            const li = document.createElement("li");
            li.textContent = item;
            mecanica.appendChild(li);


        });

    }





    const angulos =
    document.querySelector("#modal-angles");


    if(angulos){

        angulos.innerHTML = "";


        paraLista(campanha.angulos_divulgacao).forEach(item => {


            const card = document.createElement("div");
            card.className = "angle-card";


            const tituloAngulo = document.createElement("h4");
            tituloAngulo.textContent =
                item?.titulo ?? "";


            const descricaoAngulo = document.createElement("p");
            descricaoAngulo.textContent =
                item?.descricao ?? "";


            card.appendChild(tituloAngulo);
            card.appendChild(descricaoAngulo);
            angulos.appendChild(card);


        });

    }


}





function formatarDataModal(data){


    if(!data) return "";


    const partes = String(data).slice(0, 10).split("-");


    if(partes.length !== 3) return String(data);


    const [ano, mes, dia] = partes;


    return `${dia}/${mes}/${ano}`;


}





function fecharModalCampanha(){


    const modal =
    document.querySelector("#campaign-modal");


    if(modal){

        modal.classList.remove("active");
        document.body.style.overflow = "";

    }


}





document.addEventListener(
"DOMContentLoaded",
()=>{


    const fechar =
    document.querySelector("#modal-close");



    if(fechar){

        fechar.addEventListener(
            "click",
            fecharModalCampanha
        );

    }



    const modal =
    document.querySelector("#campaign-modal");



    if(modal){


        modal.addEventListener(
            "click",
            (evento)=>{


                if(evento.target === modal){

                    fecharModalCampanha();

                }


            }
        );


    }



   document.addEventListener(
    "click",
    (evento)=>{


        const botao = evento.target.closest(
            ".btn-abrir-campanha"
        );


        if(!botao) return;


        const id = botao.dataset.campanhaId;


        if(!id){
            console.warn(
                "Botão sem data-campanha-id"
            );
            return;
        }


        evento.preventDefault();


        abrirModalCampanha(id);


    }
);


    document.addEventListener(
"click",
(event)=>{


    const botao =
    event.target.closest(".tab-btn");


    if(!botao) return;



    const aba =
    botao.dataset.tab;



    document
    .querySelectorAll(".tab-btn")
    .forEach(btn=>{

        btn.classList.remove("active");

    });



    botao.classList.add("active");




    document
    .querySelectorAll(".tab-content")
    .forEach(content=>{

        content.classList.remove("active");

    });



    document
    .querySelector(`#${aba}`)
    .classList.add("active");



});


    document.addEventListener(
        "keydown",
        (evento)=>{


            if(evento.key !== "Escape") return;


            const modalAberto =
            document.querySelector(
                "#campaign-modal.active"
            );


            if(modalAberto){
                fecharModalCampanha();
            }


        }
    );


});
