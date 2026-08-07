const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");



// BUSCAR TODAS AS CAMPANHAS

router.get("/", async (req, res) => {


    const { data, error } = await supabase
        .from("campanhas")
        .select("*");



    if(error){

        return res.status(500).json({
            erro: error.message
        });

    }



    res.json(data);


});





// BUSCAR UMA CAMPANHA PELO ID

router.get("/:id", async (req, res) => {


    const { id } = req.params;



    const { data, error } = await supabase
        .from("campanhas")
        .select("*")
        .eq("id", id)
        .single();




    if(error){

        return res.status(500).json({
            erro: error.message
        });

    }



    res.json(data);


});



module.exports = router;