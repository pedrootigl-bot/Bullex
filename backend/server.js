const express = require("express");
const cors = require("cors");
require("dotenv").config();

const campanhasRoutes = require("./routes/campanhaRoutes");
const materiaisRoutes = require("./routes/materiaisRoutes");
const copiesRoutes = require("./routes/copiesRoutes");
const regrasRoutes = require("./routes/regras");

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