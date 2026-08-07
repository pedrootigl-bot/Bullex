const SUPABASE_URL = "https://trakfklbjqynwonqyrfh.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYWtma2xianF5bndvbnF5cmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTk1OTgsImV4cCI6MjEwMTU3NTU5OH0.k5KZ32_zVKlB_VU3FqqCo48_X3h7pZHQ-_57bEKNslQ";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



// Verifica se existe usuário logado
async function verificarUsuario(){


    const {
        data: { session }
    } = await supabaseClient.auth.getSession();



    if(!session){

        window.location.href = "login.html";

        return;

    }



    console.log(
        "Usuário logado:",
        session.user.email
    );


    carregarStats();

}





// Busca estatísticas do sistema
async function carregarStats(){


    try{


        const resposta = await fetch(
            "http://localhost:3000/api/stats"
        );



        if(!resposta.ok){

            throw new Error(
                "Erro ao carregar estatísticas"
            );

        }



        const stats = await resposta.json();



        document.querySelector("#campanhas").textContent =
        stats.campanhas ?? 0;



        document.querySelector("#materiais").textContent =
        stats.materiais ?? 0;



        document.querySelector("#copies").textContent =
        stats.copies ?? 0;



        document.querySelector("#videos").textContent =
        stats.videos ?? 0;



    }catch(error){


        console.error(
            "Erro stats dashboard:",
            error
        );


    }

}





// Logout
const logoutBtn = document.querySelector("#logoutBtn");


if(logoutBtn){


    logoutBtn.addEventListener(
        "click",
        async ()=>{


            await supabaseClient.auth.signOut();


            window.location.href =
            "login.html";


        }
    );

}




verificarUsuario();