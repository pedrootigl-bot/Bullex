document.addEventListener("DOMContentLoaded", () => {


    if(typeof carregarStats === "function"){

        carregarStats();

    }


    if(typeof carregarDestaque === "function"){

        carregarDestaque();

    }


    if(typeof iniciarAcoesDestaque === "function"){

        iniciarAcoesDestaque();

    }


    if(typeof iniciarKitMateriais === "function"){

        iniciarKitMateriais();

    }



    const menuToggle = document.querySelector("#menu-toggle");
    const menu = document.querySelector(".navbar .menu");



    if(!menuToggle || !menu) return;



    function fecharMenu(){

        menu.classList.remove("active");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }



    function alternarMenu(){

        const aberto = menu.classList.toggle("active");

        menuToggle.classList.toggle(
            "active",
            aberto
        );

        menuToggle.setAttribute(
            "aria-expanded",
            String(aberto)
        );

    }



    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );


    menuToggle.setAttribute(
        "aria-controls",
        "navbar-menu"
    );


    menu.setAttribute(
        "id",
        "navbar-menu"
    );



    menuToggle.addEventListener(
        "click",
        (evento) => {

            evento.stopPropagation();

            alternarMenu();

        }
    );



    menu.querySelectorAll("a").forEach((link) => {

        link.addEventListener(
            "click",
            () => {

                fecharMenu();

            }
        );

    });



    document.addEventListener(
        "click",
        (evento) => {


            if(!menu.classList.contains("active")) return;



            const clicouDentro =
                menu.contains(evento.target)
                ||
                menuToggle.contains(evento.target);



            if(!clicouDentro){

                fecharMenu();

            }


        }
    );



    document.addEventListener(
        "keydown",
        (evento) => {


            if(evento.key === "Escape"){

                fecharMenu();

            }


        }
    );


});