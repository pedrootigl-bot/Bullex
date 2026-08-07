const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");


router.get("/:campanha_id", async (req, res) => {

    const { campanha_id } = req.params;


    console.log("Campanha recebida regras:", campanha_id);


 const { data, error } = await supabase
    .from("regras")
    .select("*")
    .eq("campanha_id", Number(campanha_id))
    .order("ordem", { ascending: true });


console.log("Primeira regra:", data);
console.log("Erro:", error);


    console.log("Dados regras:", data);
    console.log("Erro regras:", error);


    if(error){

        return res.status(500).json({
            erro:error.message
        });

    }


    res.json(data);

});


module.exports = router;