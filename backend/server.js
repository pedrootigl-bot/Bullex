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




const app = express();


app.use(cors());
app.use(express.json());



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