/*
* Para iniciar un proyecto en node, colocar: npm init -y
* Para instalar el framework de express en un proyecto de node: npm install express -E(el -E es para instalar la versión exacta, sino te lo instala con el caret, eñ símbolo ^, indica un rango compatible con la versión instalada)
*/

const express = require('express');
const crypto = require('node:crypto');
const cors = require('cors')

const movies = require('./movies.json');
const { validateMovie,validatePartialMovie } = require('./schemas/movies')

const app = express();
app.use(express.json()); //! El express.json() es un middleware


app.disable('x-powered-by');
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://movies.com',
            'http://midudev.com'
        ]

        if(ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        if(!origin) {
            return callback(null, true);
        }

        return callback(new Error('Not allow by CORS'));
    }
}));


//! Métodos normales: GET, HEAD, POST
//! Métodos complejos: PUT, PATCH, DELETE //! Existe un CORS Especial: PRE-light(requiere una petición adicional llamada options(Con el verbo options) está petición se la manda a la api) //ver en el google devtools en network, abajo de la solicitud del recurso, se ve la petición  option
// app.options('/movies/:id', (req, res) => {
//     const origin = req.header('origin');
//     if( ACCEPTED_ORIGINS.includes(origin) ) {
//         res.header('Access-Control-Allow-Origin', origin);
//         res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
//     }
//     res.sendStatus(200);
// })

app.get('/movies', (req, res) => {
    
    // const origin = req.header('origin')
    // if(ACCEPTED_ORIGINS.includes(origin)){
    //     res.header('Access-Control-Allow-Origin', origin)
    // }

    const {genre} = req.query

    if(genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {//node utiliza la librería path-to-regexp (el :id cambia de manera dinámica)
    const { id } = req.params;
    const movie = movies.find(x => x.id === id);
    if(movie) return res.json(movie);
    res.status(400).json({ message: "Movie not Found" });
})

app.post('/movies', (req,res) => {
    const result = validateMovie(req.body); //! utilizando el middleware: express.json() ya podemos acceder al body de la solicitud
    if(result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie);

    return res.status(200).json(newMovie);
})

app.delete('/movies/:id', (req, res) => {
    // const origin = req.header('origin');
    // if(ACCEPTED_ORIGINS.includes(origin)) {
    //     res.header('Access-Control-Allow-Origin',origin);
    // }
    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if(movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not Found' });
    }

    movies.splice(movieIndex, 1);

    return res.json({ message: 'movie deleted' })
})

app.patch('/movies/:id', (req,res) => {
    const result = validatePartialMovie(req.body);

    if(!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if(movieIndex === -1) {
        return res.status(400).json({ message: 'Movie not Found' })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
})

const PORT = process.env.PORT ?? 1234;
app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
});