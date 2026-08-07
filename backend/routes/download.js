const express = require("express");
const router = express.Router();

const archiver = require("archiver");

const supabase = require("../config/supabase");

// Download do kit completo
router.get("/kit/:campanha_id", async (req, res) => {

    try {


        const { campanha_id } = req.params;



        const { data: materiais, error: erroMateriais } = await supabase
            .from("materiais")
            .select("*")
            .eq("campanha_id", campanha_id);



        const { data: kits, error: erroKits } = await supabase
            .from("kits")
            .select("*")
            .eq("campanha_id", campanha_id);



        if (erroMateriais || erroKits) {

            console.log("Erro materiais:", erroMateriais);
            console.log("Erro kits:", erroKits);

            throw new Error(
                "Erro ao buscar arquivos"
            );

        }



       const arquivos = [
    ...(materiais || []),
    ...(kits || [])
].filter(item => item.arquivo);


        console.log(
            "Arquivos encontrados:",
            arquivos
        );



        if (!arquivos.length) {

            return res.status(404).json({

                erro: "Nenhum arquivo encontrado"

            });

        }




        res.setHeader(
            "Content-Type",
            "application/zip"
        );


        res.setHeader(
            "Content-Disposition",
            `attachment; filename=kit-${campanha_id}.zip`
        );



        const zip = archiver("zip", {
            zlib: {
                level: 9
            }
        });





        zip.on("error", (error) => {

            console.error(
                "Erro ZIP:",
                error
            );

            res.status(500).end();

        });



        zip.pipe(res);




       for (const arquivo of arquivos) {


    const { data, error } = await supabase
        .storage
        .from("stories")
        .download(arquivo.arquivo);



    if (error) {

        console.log(
            "Erro ao baixar:",
            arquivo.arquivo,
            error
        );

        continue;

    }



    const buffer = Buffer.from(
        await data.arrayBuffer()
    );



  zip.append(
    buffer,
    {
        name: arquivo.arquivo.split("/").pop()
    }
);

    console.log(
        "Arquivo adicionado ao ZIP:",
        arquivo.arquivo
    );


}


        await zip.finalize();



    } 
    
   catch(error) {

    console.error(
        "Erro download kit:",
        error
    );


    if (!res.headersSent) {

        res.status(500).json({
            erro:error.message
        });

    }

}



});





// Download de arquivo individual
router.get("/:arquivo", async (req, res) => {


    try {


        const arquivo = req.params.arquivo;



        const { data, error } = await supabase
            .storage
            .from("stories")
            .download(arquivo);



        if(error){

            throw error;

        }



        const buffer = Buffer.from(
            await data.arrayBuffer()
        );



        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${arquivo}"`
        );



        res.setHeader(
            "Content-Type",
            "application/octet-stream"
        );



        res.send(buffer);



    } catch(error){


        res.status(500).json({

            erro:error.message

        });


    }


});



module.exports = router;