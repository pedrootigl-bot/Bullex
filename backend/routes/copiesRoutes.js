const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const requireAuth = require("../middleware/requireAuth");
const { responderErroInterno } = require("../utils/httpErrors");

// ======================================================
// CRIAR COPY
// POST /api/copies
// ======================================================

router.post("/", requireAuth, async (req, res) => {
    try {
        const {
            campanha_id,
            titulo,
            texto,
            canal,
            tipo,
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
                erro: "O título da copy é obrigatório"
            });
        }

        if (!texto || !String(texto).trim()) {
            return res.status(400).json({
                erro: "O texto da copy é obrigatório"
            });
        }

        const novaCopy = {
            campanha_id: campanhaId,
            titulo: String(titulo).trim(),
            texto: String(texto).trim(),
            canal: canal?.trim() || null,
            tipo: tipo?.trim() || null,
            ordem:
                ordem !== "" &&
                ordem !== undefined &&
                ordem !== null
                    ? Number(ordem)
                    : 1
        };

        const { data, error } = await supabase
            .from("copies")
            .insert([novaCopy])
            .select()
            .single();

        if (error) {
            return responderErroInterno(
                res,
                error,
                "Erro ao criar copy"
            );
        }

        return res.status(201).json({
            mensagem: "Copy criada com sucesso",
            copy: data
        });
    } catch (error) {
        return responderErroInterno(
            res,
            error,
            "Erro interno ao criar copy"
        );
    }
});

// ======================================================
// BUSCAR COPIES POR CAMPANHA
// GET /api/copies/:campanha_id
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
            .from("copies")
            .select("*")
            .eq("campanha_id", campanhaId)
            .order("ordem", { ascending: true });

        if (error) {
            return responderErroInterno(
                res,
                error,
                "Erro ao buscar copies"
            );
        }

        res.json(data);
    } catch (error) {
        return responderErroInterno(
            res,
            error,
            "Erro interno ao buscar copies"
        );
    }
});

module.exports = router;
