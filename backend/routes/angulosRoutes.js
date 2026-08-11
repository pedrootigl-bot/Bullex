const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

// ======================================================
// BUSCAR ÂNGULOS DE UMA CAMPANHA
// GET /api/angulos/:campanha_id
// ======================================================

router.get("/:campanha_id", async (req, res) => {

    try {

        const { campanha_id } = req.params;
        const campanhaId = Number(campanha_id);

        if (!campanhaId) {
            return res.status(400).json({
                erro: "campanha_id inválido"
            });
        }

        const { data, error } = await supabase
            .from("angulos_divulgacao")
            .select("*")
            .eq("campanha_id", campanhaId)
            .order("id", { ascending: true });


        if (error) {

            console.error(
                "Erro ao buscar ângulos:",
                error
            );

            return res.status(500).json({
                erro: "Erro interno do servidor"
            });

        }


        res.json(data || []);


    } catch (error) {

        console.error(
            "Erro interno ao buscar ângulos:",
            error
        );

        res.status(500).json({
            erro: "Erro interno do servidor"
        });

    }

});


module.exports = router;