const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");



router.get("/:campanha_id", async (req, res) => {


    try {


        const { campanha_id } = req.params;



        const { data, error } = await supabase
            .from("materiais")
            .select("*")
            .eq(
                "campanha_id",
                Number(campanha_id)
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );



        if (error) {


            return res.status(500).json({

                erro: error.message

            });


        }



        res.json(data);



    } catch (error) {


        console.error(
            "Erro ao buscar materiais:",
            error
        );


        res.status(500).json({

            erro: error.message

        });


    }


});



module.exports = router;