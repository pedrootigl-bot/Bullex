/**
 * Atualiza a barra de indicadores (.stats)
 * Esperado do banco/API:
 * { campanhas, materiais, copies, videos }
 */
function atualizarStats(stats = {}) {
    const mapa = {
        campanhas: stats.campanhas,
        materiais: stats.materiais,
        copies: stats.copies,
        videos: stats.videos
    };

    Object.entries(mapa).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor ?? 0;
    });
}

async function carregarStats() {
    try {
        const stats = await obterStats();
        atualizarStats(stats);
    } catch (err) {
        console.error("Erro ao carregar stats:", err);
    }
}
