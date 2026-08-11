const express = require("express");

const router = express.Router();

const supabase = require("../config/supabase");
const requireAuth = require("../middleware/requireAuth");
const { responderErroInterno } = require("../utils/httpErrors");


// ======================================================
// CRIAR MATERIAL
// POST /api/materiais
// Campos reais da tabela: campanha_id, nome, tipo, url
// ======================================================

router.post("/", requireAuth, async (req, res) => {

    try {

        const {
            campanha_id,
            nome,
            tipo,
            url
        } = req.body;

        const campanhaId = Number(campanha_id);

        if (!campanhaId) {

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

            campanha_id: campanhaId,

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

            return responderErroInterno(
                res,
                error,
                "Erro ao criar material"
            );

        }


        return res.status(201).json({

            mensagem: "Material criado com sucesso",

            material: data

        });


    } catch (error) {

        return responderErroInterno(
            res,
            error,
            "Erro interno ao criar material"
        );

    }

});


// ======================================================
// BUSCAR MATERIAIS POR CAMPANHA
// GET /api/materiais/:campanha_id
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
            .from("materiais")
            .select("*")
            .eq("campanha_id", campanhaId)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            return responderErroInterno(
                res,
                error,
                "Erro ao buscar materiais"
            );

        }


        res.json(data);


    } catch (error) {

        return responderErroInterno(
            res,
            error,
            "Erro ao buscar materiais"
        );

    }

});


// ======================================================
// ATUALIZAR MATERIAL
// PUT /api/materiais/:id
// ======================================================

router.put("/:id", requireAuth, async (req, res) => {

    try {

        const materialId = Number(req.params.id);

        if (!materialId) {
            return res.status(400).json({
                erro: "id inválido"
            });
        }

        const { nome, tipo, url } = req.body;

        if (!nome || !String(nome).trim()) {
            return res.status(400).json({
                erro: "O nome do material é obrigatório"
            });
        }

        const atualizacao = {
            nome: String(nome).trim(),
            tipo: tipo?.trim() || null,
            url: url?.trim() || null
        };

        const { data, error } = await supabase
            .from("materiais")
            .update(atualizacao)
            .eq("id", materialId)
            .select()
            .single();

        if (error) {
            return responderErroInterno(
                res,
                error,
                "Erro ao atualizar material"
            );
        }

        return res.json({
            mensagem: "Material atualizado com sucesso",
            material: data
        });

    } catch (error) {

        return responderErroInterno(
            res,
            error,
            "Erro interno ao atualizar material"
        );

    }

});


// ======================================================
// EXCLUIR MATERIAL
// DELETE /api/materiais/:id
// ======================================================

router.delete("/:id", requireAuth, async (req, res) => {

    try {

        const materialId = Number(req.params.id);

        if (!materialId) {
            return res.status(400).json({
                erro: "id inválido"
            });
        }

        const { error } = await supabase
            .from("materiais")
            .delete()
            .eq("id", materialId);

        if (error) {
            return responderErroInterno(
                res,
                error,
                "Erro ao excluir material"
            );
        }

        return res.json({
            mensagem: "Material excluído com sucesso"
        });

    } catch (error) {

        return responderErroInterno(
            res,
            error,
            "Erro interno ao excluir material"
        );

    }

});


module.exports = router;
