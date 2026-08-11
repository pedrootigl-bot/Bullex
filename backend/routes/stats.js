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



        const { data: kits, error: erroKits } = await supabase
            .from("kits")
            .select("id,tipo");



        const { data: copies, error: erroCopies } = await supabase
            .from("copies")
            .select("id");




        if (
            erroCampanhas ||
            erroMateriais ||
            erroKits ||
            erroCopies
        ) {

            console.log("Erro campanhas:", erroCampanhas);
            console.log("Erro materiais:", erroMateriais);
            console.log("Erro kits:", erroKits);
            console.log("Erro copies:", erroCopies);


            throw new Error(
                "Erro ao buscar estatísticas"
            );

        }



        const listaMateriais = materiais || [];

        const listaKits = kits || [];



        const totalVideosMateriais = listaMateriais.filter(
            item => item.tipo?.trim().toLowerCase() === "video"
        ).length;



        const totalVideosKits = listaKits.filter(
            item => item.tipo?.trim().toLowerCase() === "video"
        ).length;



        const videos = totalVideosMateriais + totalVideosKits;



        console.log("Materiais encontrados:", listaMateriais.length);

        console.log("Kits encontrados:", listaKits.length);

        console.log("Total de vídeos:", videos);




        res.json({

            campanhas: campanhas?.length ?? 0,

            materiais: listaMateriais.length,

            copies: copies?.length ?? 0,

            videos

        });



    } catch(error) {


        console.error(
            "Erro stats:",
            error
        );


        res.status(500).json({

            erro: "Erro interno do servidor"

        });


    }

});


module.exports = router;