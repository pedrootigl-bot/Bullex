const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");


// ======================================================
// CRIAR REGRA
// POST /api/regras
// ======================================================

router.post("/", async (req, res) => {

    try {

        const {
            campanha_id,
            titulo,
            descricao,
            ordem
        } = req.body;


        if (!campanha_id) {

            return res.status(400).json({
                erro: "O campanha_id é obrigatório"
            });

        }


        if (!titulo || !String(titulo).trim()) {

            return res.status(400).json({
                erro: "O título da regra é obrigatório"
            });

        }


        const novaRegra = {

            campanha_id: Number(campanha_id),

            titulo: String(titulo).trim(),

            descricao:
                descricao?.trim() || null,

            ordem:
                ordem !== "" &&
                ordem !== undefined &&
                ordem !== null
                    ? Number(ordem)
                    : 1

        };


        const { data, error } = await supabase
            .from("regras")
            .insert([novaRegra])
            .select()
            .single();


        if (error) {

            console.error("Erro ao criar regra:", error);

            return res.status(500).json({
                erro: error.message
            });

        }


        return res.status(201).json({

            mensagem: "Regra criada com sucesso",

            regra: data

        });


    } catch (error) {

        console.error("Erro interno ao criar regra:", error);

        return res.status(500).json({
            erro: "Erro interno do servidor"
        });

    }

});


// ======================================================
// BUSCAR REGRAS POR CAMPANHA
// GET /api/regras/:campanha_id
// ======================================================

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


    if (error) {

        return res.status(500).json({
            erro: error.message
        });

    }


    res.json(data);

});


module.exports = router;
