const SUPABASE_URL = "SUA_URL_SUPABASE";

const SUPABASE_KEY = "SUA_CHAVE_PUBLICA";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



const form = document.querySelector("#loginForm");

const mensagem = document.querySelector("#loginMessage");



if(form){

    form.addEventListener("submit", async (e)=>{


        e.preventDefault();



        const email = document.querySelector("#email").value.trim();

        const password = document.querySelector("#password").value;



        mensagem.textContent = "Entrando...";



        const { data, error } = await supabaseClient.auth.signInWithPassword({

            email,

            password

        });



        if(error){


            mensagem.textContent = "Login inválido";


            console.error(
                "Erro login:",
                error
            );


            return;

        }



        console.log(
            "Usuário autenticado:",
            data.user.email
        );



        mensagem.textContent =
        "Login realizado!";



        setTimeout(()=>{


            window.location.href =
            "dashboard.html";


        },500);



    });

}