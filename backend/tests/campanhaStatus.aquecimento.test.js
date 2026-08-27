process.env.SUPABASE_URL =
    process.env.SUPABASE_URL || "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "test-service-role-key";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
    CAMPAIGN_WARMUP_DAYS,
    STATUS,
    adicionarDiasISO,
    calcularDataInicioAquecimento,
    calcularStatusPorDatas,
    statusPublicoVisivel,
    statusHub,
    anexarCamposCalculados
} = require("../utils/campanhaStatus");

const {
    TIPOS,
    eventosDaCampanha,
    criarSeNaoExistir
} = require("../services/notificacoes.service");

function baseCampanha(overrides = {}) {
    return {
        id: 42,
        titulo: "Teste Aquecimento",
        data_inicio: "2026-09-10",
        data_fim: "2026-09-30",
        status: STATUS.AGENDADA,
        ...overrides
    };
}

describe("CAMPAIGN_WARMUP_DAYS", () => {
    it("é constante única = 5", () => {
        assert.equal(CAMPAIGN_WARMUP_DAYS, 5);
    });
});

describe("calcularDataInicioAquecimento", () => {
    it("subtrai N dias de data_inicio", () => {
        assert.equal(
            calcularDataInicioAquecimento("2026-09-10"),
            "2026-09-05"
        );
    });
});

describe("calcularStatusPorDatas — janela de aquecimento", () => {
    const inicio = "2026-09-10";
    const fim = "2026-09-30";

    it("10 dias antes → agendada", () => {
        const hoje = adicionarDiasISO(inicio, -10);
        assert.equal(
            calcularStatusPorDatas(inicio, fim, hoje),
            STATUS.AGENDADA
        );
    });

    it("5 dias antes → em_aquecimento (início da janela)", () => {
        const hoje = adicionarDiasISO(inicio, -5);
        assert.equal(
            calcularStatusPorDatas(inicio, fim, hoje),
            STATUS.EM_AQUECIMENTO
        );
    });

    it("3 dias antes → em_aquecimento", () => {
        const hoje = adicionarDiasISO(inicio, -3);
        assert.equal(
            calcularStatusPorDatas(inicio, fim, hoje),
            STATUS.EM_AQUECIMENTO
        );
    });

    it("1 dia antes → em_aquecimento", () => {
        const hoje = adicionarDiasISO(inicio, -1);
        assert.equal(
            calcularStatusPorDatas(inicio, fim, hoje),
            STATUS.EM_AQUECIMENTO
        );
    });

    it("início hoje → ativa", () => {
        assert.equal(
            calcularStatusPorDatas(inicio, fim, inicio),
            STATUS.ATIVA
        );
    });

    it("encerrada (hoje >= data_fim) → finalizada", () => {
        assert.equal(
            calcularStatusPorDatas(inicio, fim, fim),
            STATUS.FINALIZADA
        );
        assert.equal(
            calcularStatusPorDatas(inicio, fim, adicionarDiasISO(fim, 1)),
            STATUS.FINALIZADA
        );
    });

    it("edição de data: dentro da janela após mudar início → em_aquecimento", () => {
        const novoInicio = "2026-09-20";
        const hoje = "2026-09-17";
        assert.equal(
            calcularStatusPorDatas(novoInicio, "2026-10-01", hoje),
            STATUS.EM_AQUECIMENTO
        );
    });

    it("criação já dentro da janela → em_aquecimento", () => {
        const hoje = "2026-09-08";
        assert.equal(
            calcularStatusPorDatas(inicio, fim, hoje, null),
            STATUS.EM_AQUECIMENTO
        );
    });

    it("não rebaixa ativa → em_aquecimento (ativação antecipada)", () => {
        const hoje = adicionarDiasISO(inicio, -2);
        assert.equal(
            calcularStatusPorDatas(inicio, fim, hoje, STATUS.ATIVA),
            STATUS.ATIVA
        );
    });
});

describe("hub / metadados", () => {
    it("statusPublicoVisivel inclui ativa e em_aquecimento", () => {
        assert.equal(statusPublicoVisivel(STATUS.ATIVA), true);
        assert.equal(statusPublicoVisivel(STATUS.EM_AQUECIMENTO), true);
        assert.equal(statusPublicoVisivel(STATUS.AGENDADA), false);
        assert.equal(statusPublicoVisivel(STATUS.FINALIZADA), false);
    });

    it("statusHub mapeia em_aquecimento → pre_active", () => {
        assert.equal(statusHub(STATUS.EM_AQUECIMENTO), "pre_active");
        assert.equal(statusHub(STATUS.ATIVA), "ativa");
    });

    it("anexa data_inicio_aquecimento calculado", () => {
        const comMeta = anexarCamposCalculados(baseCampanha());
        assert.equal(comMeta.data_inicio_aquecimento, "2026-09-05");
    });
});

describe("notificações — campanha_em_aquecimento", () => {
    it("emite evento de aquecimento na janela", () => {
        const campanha = baseCampanha({
            status: STATUS.EM_AQUECIMENTO,
            data_inicio: "2026-09-10",
            data_fim: "2026-09-30"
        });
        const eventos = eventosDaCampanha(campanha, "2026-09-07");
        const tipos = eventos.map((e) => e.tipo);

        assert.ok(tipos.includes(TIPOS.EM_AQUECIMENTO));
        assert.ok(!tipos.includes(TIPOS.INICIADA));
    });

    it("no lançamento emite iniciada (não aquecimento)", () => {
        const campanha = baseCampanha({
            status: STATUS.ATIVA,
            data_inicio: "2026-09-10",
            data_fim: "2026-09-30"
        });
        const eventos = eventosDaCampanha(campanha, "2026-09-10");
        const tipos = eventos.map((e) => e.tipo);

        assert.ok(tipos.includes(TIPOS.INICIADA));
        assert.ok(!tipos.includes(TIPOS.EM_AQUECIMENTO));
    });

    it("ativa antecipada na janela não gera aquecimento", () => {
        const campanha = baseCampanha({
            status: STATUS.ATIVA,
            data_inicio: "2026-09-10",
            data_fim: "2026-09-30"
        });
        const eventos = eventosDaCampanha(campanha, "2026-09-07");
        const tipos = eventos.map((e) => e.tipo);

        assert.ok(!tipos.includes(TIPOS.EM_AQUECIMENTO));
    });

    it("um único evento campanha_em_aquecimento por geração (dedupe campanha_id+tipo)", () => {
        const campanha = baseCampanha({ status: STATUS.EM_AQUECIMENTO });
        const eventos = eventosDaCampanha(campanha, "2026-09-07");
        const aquecimento = eventos.filter(
            (e) => e.tipo === TIPOS.EM_AQUECIMENTO
        );
        assert.equal(aquecimento.length, 1);
        assert.equal(aquecimento[0].campanhaId, 42);
        assert.equal(typeof criarSeNaoExistir, "function");
    });
});
