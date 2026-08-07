const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");



router.get("/:campanha_id", async (req, res)=>{


    const { campanha_id } = req.params;



   const { data, error } = await supabase
    .from("materiais")
    .select("*");



    if(error){

        return res.status(500).json({
            erro:error.message
        });

    }



    res.json(data);


});



module.exports = router;