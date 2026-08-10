const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// ======================================================
// CRIAR COPY
// POST /api/copies
// ======================================================

router.post("/", async (req, res) => {
    try {
        const {
            campanha_id,
            titulo,
            texto,
            canal,
            tipo,
            ordem
        } = req.body;

        if (!campanha_id) {
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
            campanha_id: Number(campanha_id),
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
            console.error("Erro ao criar copy:", error);
            return res.status(500).json({
                erro: error.message
            });
        }

        return res.status(201).json({
            mensagem: "Copy criada com sucesso",
            copy: data
        });
    } catch (error) {
        console.error("Erro interno ao criar copy:", error);
        return res.status(500).json({
            erro: "Erro interno do servidor"
        });
    }
});

// ======================================================
// BUSCAR COPIES POR CAMPANHA
// GET /api/copies/:campanha_id
// ======================================================

router.get("/:campanha_id", async (req, res) => {
    try {
        const { campanha_id } = req.params;

        const { data, error } = await supabase
            .from("copies")
            .select("*")
            .eq("campanha_id", campanha_id)
            .order("ordem", { ascending: true });

        if (error) {
            return res.status(500).json({
                erro: error.message
            });
        }

        res.json(data);
    } catch (error) {
        console.error("Erro interno ao buscar copies:", error);
        res.status(500).json({
            erro: "Erro interno do servidor"
        });
    }
});

module.exports = router;
