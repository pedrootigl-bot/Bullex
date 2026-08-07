const SUPABASE_URL = "https://trakfklbjqynwonqyrfh.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYWtma2xianF5bndvbnF5cmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTk1OTgsImV4cCI6MjEwMTU3NTU5OH0.k5KZ32_zVKlB_VU3FqqCo48_X3h7pZHQ-_57bEKNslQ";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



const form = document.querySelector("#loginForm");

const mensagem = document.querySelector("#loginMessage");



if(form){


    form.addEventListener("submit", async (e)=>{


        e.preventDefault();


        console.log("Formulário enviado");



        const email = document.querySelector("#email").value.trim();

        const password = document.querySelector("#password").value;



        console.log(
            "Email informado:",
            email
        );



        mensagem.textContent =
        "Entrando...";



        try{


            const { data, error } =
            await supabaseClient.auth.signInWithPassword({


                email,

                password


            });



            console.log(
                "Resposta Supabase:",
                data,
                error
            );



            if(error){


                mensagem.textContent =
                "Login inválido";


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



        }catch(error){


            console.error(
                "Erro inesperado:",
                error
            );


            mensagem.textContent =
            "Erro ao conectar com servidor";


        }



    });


}else{


    console.error(
        "Formulário #loginForm não encontrado"
    );


}