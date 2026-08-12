/**
 * Validação automática de campanhas para publicação.
 * Atualiza a coluna existente: campanhas.pronta_publicacao (boolean).
 *
 * Requisitos (nomes reais do projeto):
 * - campanhas: titulo, data_inicio, data_fim, imagem_card (ou banner), resumo
 * - copies, regras, materiais (pelo menos 1 cada)
 * - angulos_divulgacao (pelo menos 1; tabela usada no projeto)
 */

const supabase = require("../config/supabase");

function textoPreenchido(valor) {
    return Boolean(String(valor || "").trim());
}

function imagemPrincipalPreenchida(campanha) {
    return textoPreenchido(campanha?.imagem_card) || textoPreenchido(campanha?.banner);
}

function visaoGeralPreenchida(campanha) {
    // Campo estratégico atual: resumo (fallback legado visao_geral, se existir)
    return (
        textoPreenchido(campanha?.resumo)
        || textoPreenchido(campanha?.visao_geral)
    );
}

async function contarPorCampanha(tabela, campanhaId) {
    const { count, error } = await supabase
        .from(tabela)
        .select("id", { count: "exact", head: true })
        .eq("campanha_id", campanhaId);

    if (error) {
        error.contexto = `Erro ao contar registros em ${tabela}`;
        throw error;
    }

    return Number(count) || 0;
}

async function forcarProntaPublicacaoFalse(campanhaId) {
    const { error } = await supabase
        .from("campanhas")
        .update({ pronta_publicacao: false })
        .eq("id", campanhaId);

    if (error) {
        console.error(
            `[VALIDAÇÃO] Falha ao forçar pronta_publicacao=false na campanha ${campanhaId}:`,
            error.message || error
        );
    }
}

/**
 * Valida se a campanha está completa para publicação e atualiza
 * campanhas.pronta_publicacao.
 *
 * @param {number|string} campanhaId
 * @returns {Promise<{ pronta: boolean, pendencias: string[] }>}
 */
async function validarCampanha(campanhaId) {
    const id = Number(campanhaId);

    console.log(`[VALIDAÇÃO] Campanha ${id} iniciada`);

    if (!id) {
        const erro = new Error("ID da campanha inválido para validação");
        erro.statusCode = 400;
        throw erro;
    }

    try {
        const { data: campanha, error: erroCampanha } = await supabase
            .from("campanhas")
            .select("*")
            .eq("id", id)
            .single();

        if (erroCampanha) {
            erroCampanha.contexto = "Erro ao buscar campanha para validação";
            throw erroCampanha;
        }

        if (!campanha) {
            const erro = new Error("Campanha não encontrada para validação");
            erro.statusCode = 404;
            throw erro;
        }

        const pendencias = [];

        if (!textoPreenchido(campanha.titulo)) {
            pendencias.push("Campanha não possui título");
        }

        if (!campanha.data_inicio) {
            pendencias.push("Campanha não possui data de início");
        }

        if (!campanha.data_fim) {
            pendencias.push("Campanha não possui data de fim");
        }

        if (!imagemPrincipalPreenchida(campanha)) {
            pendencias.push("Campanha não possui banner");
        }

        if (!visaoGeralPreenchida(campanha)) {
            pendencias.push("Campanha não possui visão geral");
        }

        const [totalCopies, totalRegras, totalMateriais, totalAngulos] =
            await Promise.all([
                contarPorCampanha("copies", id),
                contarPorCampanha("regras", id),
                contarPorCampanha("materiais", id),
                contarPorCampanha("angulos_divulgacao", id)
            ]);

        if (totalCopies < 1) {
            pendencias.push("Campanha não possui copies");
        }

        if (totalRegras < 1) {
            pendencias.push("Campanha não possui regras");
        }

        if (totalMateriais < 1) {
            pendencias.push("Campanha não possui materiais");
        }

        if (totalAngulos < 1) {
            pendencias.push("Campanha não possui ângulos");
        }

        const pronta = pendencias.length === 0;

        const { error: erroUpdate } = await supabase
            .from("campanhas")
            .update({ pronta_publicacao: pronta })
            .eq("id", id);

        if (erroUpdate) {
            erroUpdate.contexto = "Erro ao atualizar pronta_publicacao";
            throw erroUpdate;
        }

        if (pronta) {
            console.log(`[VALIDAÇÃO] Campanha ${id} aprovada para publicação`);
        } else {
            console.log(`[VALIDAÇÃO] Campanha ${id} reprovada`);
            console.log(
                `[VALIDAÇÃO] Pendências: ${pendencias.join("; ")}`
            );
        }

        return {
            pronta,
            pendencias
        };
    } catch (error) {
        console.error(
            `[VALIDAÇÃO] Campanha ${id} erro:`,
            error?.message || error
        );

        await forcarProntaPublicacaoFalse(id);

        throw error;
    }
}

module.exports = {
    validarCampanha
};
