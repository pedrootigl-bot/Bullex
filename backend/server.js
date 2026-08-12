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




const app = express();

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

app.use("/api/angulos", 
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

app.get("/", (req, res) => {

    res.json({
        mensagem: "API Bullex funcionando!"
    });

});




const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `Servidor rodando na porta ${PORT}`
    );

});