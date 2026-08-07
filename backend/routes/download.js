const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");


router.get("/:arquivo", async (req, res) => {

    try {

        const arquivo = req.params.arquivo;


        const { data, error } = await supabase
            .storage
            .from("stories")
            .download(arquivo);


        if(error){

            throw error;

        }


        const buffer = Buffer.from(
            await data.arrayBuffer()
        );


        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${arquivo}"`
        );


        res.setHeader(
            "Content-Type",
            "image/png"
        );


        res.send(buffer);



    } catch(error){

        res.status(500).json({
            erro:error.message
        });

    }

});


module.exports = router;