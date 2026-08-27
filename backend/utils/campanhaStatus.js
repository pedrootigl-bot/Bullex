/**
 * Status automático de campanhas (BULLEx)
 *
 * agendada        → hoje < (data_inicio − CAMPAIGN_WARMUP_DAYS)
 * em_aquecimento  → (data_inicio − N) ≤ hoje < data_inicio
 * ativa           → data_inicio ≤ hoje < data_fim
 * finalizada      → hoje ≥ data_fim
 *
 * Fonte da verdade: datas (timezone America/Sao_Paulo).
 * O status no banco é espelhado pelo scheduler / GET / save.
 *
 * Regra: campanha já "ativa" (ativação antecipada) NÃO é
 * rebaixada para em_aquecimento.
 */

const CAMPAIGN_WARMUP_DAYS = 5;

const STATUS = Object.freeze({
    AGENDADA: "agendada",
    EM_AQUECIMENTO: "em_aquecimento",
    ATIVA: "ativa",
    FINALIZADA: "finalizada"
});

const TIMEZONE_PADRAO = "America/Sao_Paulo";

function hojeISO(timezone = TIMEZONE_PADRAO) {
    try {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());
    } catch {
        const agora = new Date();
        const y = agora.getFullYear();
        const m = String(agora.getMonth() + 1).padStart(2, "0");
        const d = String(agora.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
}

function dataISO(valor) {
    if (!valor) return null;
    const texto = String(valor).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
        return texto.slice(0, 10);
    }
    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) return null;
    const y = data.getUTCFullYear();
    const m = String(data.getUTCMonth() + 1).padStart(2, "0");
    const d = String(data.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Soma/subtrai dias em uma data civil YYYY-MM-DD (calendário UTC).
 */
function adicionarDiasISO(dataIso, dias) {
    const base = dataISO(dataIso);
    if (!base) return null;
    const [ano, mes, dia] = base.split("-").map(Number);
    const dt = new Date(Date.UTC(ano, mes - 1, dia));
    dt.setUTCDate(dt.getUTCDate() + Number(dias));
    return dt.toISOString().slice(0, 10);
}

/**
 * Início da janela de aquecimento (calculado — não é coluna no banco).
 */
function calcularDataInicioAquecimento(dataInicio) {
    const inicio = dataISO(dataInicio);
    if (!inicio) return null;
    return adicionarDiasISO(inicio, -CAMPAIGN_WARMUP_DAYS);
}

function normalizarStatus(valor) {
    const bruto = String(valor || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (!bruto) return null;

    if (
        bruto === STATUS.EM_AQUECIMENTO
        || bruto === "pre_active"
        || bruto.includes("aquec")
        || bruto.includes("warmup")
        || bruto.includes("pre_active")
        || bruto.includes("pre-camp")
    ) {
        return STATUS.EM_AQUECIMENTO;
    }

    if (
        bruto === STATUS.AGENDADA
        || bruto.includes("agend")
        || bruto.includes("program")
    ) {
        return STATUS.AGENDADA;
    }

    if (
        bruto === STATUS.FINALIZADA
        || bruto.includes("final")
        || bruto === "inativa"
        || bruto.includes("paus")
    ) {
        return STATUS.FINALIZADA;
    }

    if (bruto === STATUS.ATIVA) {
        return STATUS.ATIVA;
    }

    return null;
}

/**
 * Calcula o status esperado com base nas datas.
 * @param {string} dataInicio
 * @param {string} dataFim
 * @param {string} [hoje]
 * @param {string|null} [statusAtual] — se já for "ativa", não rebaixa para aquecimento
 */
function calcularStatusPorDatas(
    dataInicio,
    dataFim,
    hoje = hojeISO(),
    statusAtual = null
) {
    const inicio = dataISO(dataInicio);
    const fim = dataISO(dataFim);
    const atual = normalizarStatus(statusAtual);

    if (!inicio && !fim) {
        return STATUS.ATIVA;
    }

    if (fim && hoje >= fim) {
        return STATUS.FINALIZADA;
    }

    if (inicio && hoje >= inicio) {
        return STATUS.ATIVA;
    }

    // hoje < data_inicio (ainda não lançou)
    const inicioAquecimento = calcularDataInicioAquecimento(inicio);

    if (
        inicio
        && inicioAquecimento
        && hoje >= inicioAquecimento
        && hoje < inicio
    ) {
        // Ativação antecipada: não rebaixa ativa → em_aquecimento
        if (atual === STATUS.ATIVA) {
            return STATUS.ATIVA;
        }
        return STATUS.EM_AQUECIMENTO;
    }

    if (inicio && hoje < inicio) {
        return STATUS.AGENDADA;
    }

    return STATUS.ATIVA;
}

/** Hub público: ativa + em aquecimento */
function statusPublicoVisivel(status) {
    const normalizado = normalizarStatus(status);
    return (
        normalizado === STATUS.ATIVA
        || normalizado === STATUS.EM_AQUECIMENTO
    );
}

/** Mapeamento hub (compatível com Partner Hub / pre_active) */
function statusHub(status) {
    const normalizado = normalizarStatus(status);
    if (normalizado === STATUS.EM_AQUECIMENTO) return "pre_active";
    return normalizado;
}

function anexarCamposCalculados(campanha) {
    if (!campanha) return campanha;
    return {
        ...campanha,
        data_inicio_aquecimento: calcularDataInicioAquecimento(
            campanha.data_inicio
        )
    };
}

/**
 * Atualiza no banco os status desatualizados e devolve a lista já corrigida.
 * O scheduler só persiste o resultado deste cálculo.
 */
async function sincronizarStatusCampanhas(supabase, campanhas = []) {
    const lista = Array.isArray(campanhas) ? campanhas : [];
    if (!lista.length) return [];

    const hoje = hojeISO();
    const atualizadas = [];
    const pendencias = [];

    for (const campanha of lista) {
        const esperado = calcularStatusPorDatas(
            campanha.data_inicio,
            campanha.data_fim,
            hoje,
            campanha.status
        );
        const atual = String(campanha.status || "").trim().toLowerCase();

        if (atual !== esperado) {
            pendencias.push({ id: campanha.id, status: esperado });
        }

        atualizadas.push(
            anexarCamposCalculados({
                ...campanha,
                status: esperado
            })
        );
    }

    if (pendencias.length > 0 && supabase) {
        await Promise.all(
            pendencias.map((item) =>
                supabase
                    .from("campanhas")
                    .update({ status: item.status })
                    .eq("id", item.id)
                    .then(({ error }) => {
                        if (error) {
                            console.error(
                                `Erro ao sincronizar status da campanha ${item.id}:`,
                                error
                            );
                        }
                    })
            )
        );
    }

    return atualizadas;
}

async function sincronizarStatusCampanha(supabase, campanha) {
    if (!campanha) return null;
    const [resultado] = await sincronizarStatusCampanhas(supabase, [campanha]);
    return resultado || null;
}

module.exports = {
    CAMPAIGN_WARMUP_DAYS,
    STATUS,
    TIMEZONE_PADRAO,
    hojeISO,
    dataISO,
    adicionarDiasISO,
    calcularDataInicioAquecimento,
    normalizarStatus,
    calcularStatusPorDatas,
    statusPublicoVisivel,
    statusHub,
    anexarCamposCalculados,
    sincronizarStatusCampanhas,
    sincronizarStatusCampanha
};
