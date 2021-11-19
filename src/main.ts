import express from 'express';
import cors from 'cors';
import axios from 'axios';
import md5 from 'md5';
require('dotenv/config');


const app = express();
app.use(express.json());
app.use(cors());


const apiMarvel = axios.create({
    baseURL: "http://gateway.marvel.com/v1/public",
});

function createAuth() {
    const ts = new Date().getTime();
    const apikey = process.env.PUBLICKEY;
    const privatekey = process.env.PRIVATEKEY;
    const hash = md5(ts.toString() + privatekey + apikey);
    return { ts, apikey, hash };
}





app.get("/", async (req, res) => {
    try {
        const page: number = req.query.page
            ? parseInt(req.query.page as string)
            : 1;

        const limit: number = req.query.limit
            ? parseInt(req.query.limit as string)
            : 10;

        const name = req.query.name
            ? req.query.name as string
            : undefined;

        const offset: number = limit * (page - 1);

        const apiResponse = await apiMarvel.get("/characters", {
            params: {
                ...createAuth(),
                limit,
                offset,
                nameStartsWith: name
            }
        });
        let characters = apiResponse.data.data.results;
        characters = characters.map((character: any) => {
            return {
                id: character.id,
                name: character.name,
                photo: `${character.thumbnail.path}.${character.thumbnail.extension}`
            };
        });

        return res.send({
            data: characters,
            message: "This is fine."
        });
    }
    catch (err: any) {
        return res.status(500).send({
            message: err.toString()
        });
    }
});
app.get("/personagem/:characterId", async (req, res) => {
    const idPersonagem = req.params.characterId;
    try {
        const apiResponse = await apiMarvel.get(`/characters/${idPersonagem}`, {
            params: {
                ...createAuth(),
            }
        });

        let resposta = apiResponse.data.data.results[0];
        let listaComics = [];
        // console.log(resposta.comics.items);


        for (let comic of resposta.comics.items) {
            listaComics.push(await getComic(comic.resourceURI));
        }

        res.status(200).send({
            name: resposta.name,
            description: resposta.description,
            photo: `${resposta.thumbnail.path}.${resposta.thumbnail.extension}`,
            listaComics
        });
    }
    catch (error) {
        console.log(error);
    }
});

async function getComic(link: string) {
    const apiResponse = await apiMarvel.get(link, {
        params: {
            ...createAuth(),
        }
    });
    let resposta = apiResponse.data.data.results[0];
    console.log(resposta);

    return {
        name: resposta.name,
        thumbnail: resposta.thumbnail.path + "." + resposta.thumbnail.extension
    };
}
app.listen(8081, () => console.log("Server is running..."));
