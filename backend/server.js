const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const campanhasRoutes = require("./routes/campanhaRoutes");
const materiaisRoutes = require("./routes/materiaisRoutes");
const copiesRoutes = require("./routes/copiesRoutes");
const regrasRoutes = require("./routes/regras");
const statsRoutes = require("./routes/stats");
const destaqueRoutes = require("./routes/destaque");
const downloadRoutes = require("./routes/download");
const kitsRoutes = require("./routes/kits");
const angulosRoutes = require("./routes/angulosRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificacoesRoutes = require("./routes/notificacoesRoutes");
const {
    iniciarScheduler,
    pararScheduler
} = require("./jobs");

const app = express();
const frontendPath = path.join(__dirname, "..", "frontend");

const corsOrigins = String(
    process.env.CORS_ORIGINS
    || "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://localhost:55434,http://127.0.0.1:55434"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Permite ferramentas locais sem Origin (curl/Postman)
        if (!origin) {
            return callback(null, true);
        }

        if (corsOrigins.includes("*") || corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin não permitida pelo CORS"));
    }
}));
app.use(express.json({ limit: "2mb" }));

// Rotas

app.use(
    "/api/campanhas",
    campanhasRoutes
);

app.use(
    "/api/materiais",
    materiaisRoutes
);

app.use(
    "/api/copies",
    copiesRoutes
);

app.use(
    "/api/regras",
    regrasRoutes
);

app.use(
    "/api/stats",
    statsRoutes
);

app.use(
    "/api/destaque",
    destaqueRoutes
);

app.use(
    "/api/download",
    downloadRoutes
);

app.use(
    "/api/kits",
    kitsRoutes
);

app.use(
    "/api/angulos",
    angulosRoutes
);

app.use(
    "/api/upload",
    uploadRoutes
);

app.use(
    "/api/notificacoes",
    notificacoesRoutes
);

app.get("/api/health", (req, res) => {
    res.json({
        mensagem: "API Bullex funcionando!"
    });
});

// Frontend estático na mesma porta da API (substitui npx serve na 3000)
// extensions: permite /admin/login além de /admin/login.html
app.use(express.static(frontendPath, {
    extensions: ["html"]
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    iniciarScheduler();
});

function encerrarServidor(sinal) {
    console.log(`[SERVER] Recebido ${sinal} — encerrando...`);
    pararScheduler();

    server.close(() => {
        console.log("[SERVER] HTTP encerrado");
        process.exit(0);
    });

    // Failsafe se conexões travarem o close
    setTimeout(() => {
        console.error("[SERVER] Encerramento forçado após timeout");
        process.exit(1);
    }, 10000).unref();
}

process.on("SIGINT", () => encerrarServidor("SIGINT"));
process.on("SIGTERM", () => encerrarServidor("SIGTERM"));
