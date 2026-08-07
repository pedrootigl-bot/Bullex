const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");


router.get("/", async (req, res) => {

    try {


        const { data: campanhas, error: erroCampanhas } = await supabase
            .from("campanhas")
            .select("id");


        const { data: materiais, error: erroMateriais } = await supabase
            .from("materiais")
            .select("id,tipo");


        const { data: copies, error: erroCopies } = await supabase
            .from("copies")
            .select("id");



        if(erroCampanhas || erroMateriais || erroCopies){

            throw new Error(
                "Erro ao buscar estatísticas"
            );

        }



        const videos = materiais.filter(
            item => item.tipo === "video"
        ).length;



        res.json({

            campanhas: campanhas?.length ?? 0,

            materiais: materiais?.length ?? 0,

            copies: copies?.length ?? 0,

            videos

        });



    } catch(error) {


        console.error(
            "Erro stats:",
            error
        );


        res.status(500).json({

            erro:error.message

        });


    }


});


module.exports = router;