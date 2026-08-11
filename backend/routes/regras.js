const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");
const requireAuth = require("../middleware/requireAuth");
const { responderErroInterno } = require("../utils/httpErrors");


// ======================================================
// CRIAR REGRA
// POST /api/regras
// ======================================================

router.post("/", requireAuth, async (req, res) => {

    try {

        const {
            campanha_id,
            titulo,
            descricao,
            ordem
        } = req.body;

        const campanhaId = Number(campanha_id);

        if (!campanhaId) {

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

            campanha_id: campanhaId,

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

            return responderErroInterno(
                res,
                error,
                "Erro ao criar regra"
            );

        }


        return res.status(201).json({

            mensagem: "Regra criada com sucesso",

            regra: data

        });


    } catch (error) {

        return responderErroInterno(
            res,
            error,
            "Erro interno ao criar regra"
        );

    }

});


// ======================================================
// BUSCAR REGRAS POR CAMPANHA
// GET /api/regras/:campanha_id
// ======================================================

router.get("/:campanha_id", async (req, res) => {

    try {

        const campanhaId = Number(req.params.campanha_id);

        if (!campanhaId) {
            return res.status(400).json({
                erro: "campanha_id inválido"
            });
        }

        const { data, error } = await supabase
            .from("regras")
            .select("*")
            .eq("campanha_id", campanhaId)
            .order("ordem", { ascending: true });


        if (error) {

            return responderErroInterno(
                res,
                error,
                "Erro ao buscar regras"
            );

        }


        res.json(data);

    } catch (error) {

        return responderErroInterno(
            res,
            error,
            "Erro interno ao buscar regras"
        );

    }

});


module.exports = router;
