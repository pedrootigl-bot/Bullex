const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");


// ======================================================
// BUSCAR TODAS AS CAMPANHAS
// GET /api/campanhas
// ======================================================

router.get("/", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("campanhas")
            .select("*")
            .order("id", { ascending: false });


        if (error) {

            console.error("Erro ao buscar campanhas:", error);

            return res.status(500).json({
                erro: error.message
            });

        }


        res.json(data);

    } catch (error) {

        console.error("Erro interno:", error);

        res.status(500).json({
            erro: "Erro interno do servidor"
        });

    }

});


// ======================================================
// BUSCAR UMA CAMPANHA PELO ID
// GET /api/campanhas/:id
// ======================================================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;


        const { data, error } = await supabase
            .from("campanhas")
            .select("*")
            .eq("id", id)
            .single();


        if (error) {

            console.error("Erro ao buscar campanha:", error);

            return res.status(404).json({
                erro: "Campanha não encontrada"
            });

        }


        res.json(data);

    } catch (error) {

        console.error("Erro interno:", error);

        res.status(500).json({
            erro: "Erro interno do servidor"
        });

    }

});


// ======================================================
// CRIAR CAMPANHA
// POST /api/campanhas
// ======================================================

router.post("/", async (req, res) => {

    try {

        const {
            titulo,
            descricao,
            categoria,
            objetivo,
            premio,
            cupom,
            deposito_minimo,
            data_inicio,
            data_fim,
            status,
            imagem_card
        } = req.body;


        // ==================================================
        // VALIDAÇÕES
        // ==================================================

        if (!titulo || !titulo.trim()) {

            return res.status(400).json({
                erro: "O título da campanha é obrigatório"
            });

        }


        if (!data_inicio) {

            return res.status(400).json({
                erro: "A data de início é obrigatória"
            });

        }


        if (!data_fim) {

            return res.status(400).json({
                erro: "A data de fim é obrigatória"
            });

        }


        // ==================================================
        // OBJETO DA CAMPANHA
        // ==================================================

        const novaCampanha = {

            titulo: titulo.trim(),

            descricao:
                descricao?.trim() || null,

            categoria:
                categoria?.trim() || null,

            objetivo:
                objetivo?.trim() || null,

            premio:
                premio?.trim() || null,

            cupom:
                cupom?.trim() || null,

            deposito_minimo:
                deposito_minimo !== "" &&
                deposito_minimo !== undefined &&
                deposito_minimo !== null
                    ? Number(deposito_minimo)
                    : null,

            data_inicio,

            data_fim,

            status:
                status?.trim() || "ativa",

            imagem_card:
                imagem_card?.trim() || null

        };


        // ==================================================
        // INSERIR NO SUPABASE
        // ==================================================

        const { data, error } = await supabase
            .from("campanhas")
            .insert([novaCampanha])
            .select()
            .single();


        if (error) {

            console.error(
                "Erro ao criar campanha:",
                error
            );

            return res.status(500).json({
                erro: error.message
            });

        }


        // ==================================================
        // RESPOSTA
        // ==================================================

        return res.status(201).json({

            mensagem: "Campanha criada com sucesso",

            campanha: data

        });


    } catch (error) {

        console.error(
            "Erro interno ao criar campanha:",
            error
        );

        return res.status(500).json({

            erro: "Erro interno do servidor"

        });

    }

});

// ======================================================
// ATUALIZAR CAMPANHA
// PUT /api/campanhas/:id
// ======================================================

router.put("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {
            titulo,
            descricao,
            categoria,
            objetivo,
            premio,
            cupom,
            deposito_minimo,
            data_inicio,
            data_fim,
            status,
            imagem_card
        } = req.body;


        // ==============================================
        // VALIDAÇÕES
        // ==============================================

        if (!titulo || !titulo.trim()) {

            return res.status(400).json({
                erro: "O título da campanha é obrigatório"
            });

        }


        if (!data_inicio) {

            return res.status(400).json({
                erro: "A data de início é obrigatória"
            });

        }


        if (!data_fim) {

            return res.status(400).json({
                erro: "A data de fim é obrigatória"
            });

        }


        // ==============================================
        // DADOS ATUALIZADOS
        // ==============================================

        const campanhaAtualizada = {

            titulo: titulo.trim(),

            descricao:
                descricao?.trim() || null,

            categoria:
                categoria?.trim() || null,

            objetivo:
                objetivo?.trim() || null,

            premio:
                premio?.trim() || null,

            cupom:
                cupom?.trim() || null,

            deposito_minimo:
                deposito_minimo !== "" &&
                deposito_minimo !== undefined &&
                deposito_minimo !== null
                    ? Number(deposito_minimo)
                    : null,

            data_inicio,

            data_fim,

            status:
                status?.trim() || "ativa",

            imagem_card:
                imagem_card?.trim() || null

        };


        // ==============================================
        // UPDATE
        // ==============================================

        const { data, error } = await supabase
            .from("campanhas")
            .update(campanhaAtualizada)
            .eq("id", id)
            .select()
            .single();


        if (error) {

            console.error(
                "Erro ao atualizar campanha:",
                error
            );

            return res.status(500).json({
                erro: error.message
            });

        }


        // ==============================================
        // RESPOSTA
        // ==============================================

        return res.json({

            mensagem: "Campanha atualizada com sucesso",

            campanha: data

        });


    } catch (error) {

        console.error(
            "Erro interno ao atualizar campanha:",
            error
        );

        return res.status(500).json({

            erro: "Erro interno do servidor"

        });

    }

});


module.exports = router;