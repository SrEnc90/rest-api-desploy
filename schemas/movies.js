const z = require('zod');

let fechaActual = new Date();
let anioActual = fechaActual.getFullYear();

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required'
    }),
    year: z.number().min(1900).max(anioActual),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().endsWith('.jpg').url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Crime', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
        {
            invalid_type_error: 'Movie genre must be an array of enum genre'
        }
    )
});

function validateMovie(input) {
    return movieSchema.safeParse(input);
}

function validatePartialMovie(input) {
    return movieSchema.partial().safeParse(input);
}

module.exports = {
    validateMovie,
    validatePartialMovie
}