const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");


// ======================================================
// CRIAR MATERIAL
// POST /api/materiais
// Campos reais da tabela: campanha_id, nome, tipo, url
// ======================================================

router.post("/", async (req, res) => {

    try {

        const {
            campanha_id,
            nome,
            tipo,
            url
        } = req.body;


        if (!campanha_id) {

            return res.status(400).json({
                erro: "O campanha_id é obrigatório"
            });

        }


        if (!nome || !String(nome).trim()) {

            return res.status(400).json({
                erro: "O nome do material é obrigatório"
            });

        }


        const novoMaterial = {

            campanha_id: Number(campanha_id),

            nome: String(nome).trim(),

            tipo:
                tipo?.trim() || null,

            url:
                url?.trim() || null

        };


        const { data, error } = await supabase
            .from("materiais")
            .insert([novoMaterial])
            .select()
            .single();


        if (error) {

            console.error("Erro ao criar material:", error);

            return res.status(500).json({
                erro: error.message
            });

        }


        return res.status(201).json({

            mensagem: "Material criado com sucesso",

            material: data

        });


    } catch (error) {

        console.error("Erro interno ao criar material:", error);

        return res.status(500).json({
            erro: "Erro interno do servidor"
        });

    }

});


// ======================================================
// BUSCAR MATERIAIS POR CAMPANHA
// GET /api/materiais/:campanha_id
// ======================================================

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
