const mongoose = require('mongoose');
const {body, param } = require('express-validator');
const fetch = require("node-fetch");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    actors: {
        type: String,
        required: true
    }
});

const validatePostData = [
    body('title').not().isEmpty().withMessage("Title is required.")
        .bail()
        .custom(async (value, {req}) => {
            try {
                const res = await fetch(`http://www.omdbapi.com/?apikey=8fe26439&plot=full&t=${req.body.title}}`);
                if (res.status != 200) {
                    return Promise.reject("There was error while fetching movie data from external api.");
                }
                else {
                    const json = await res.json();
                    if (json.Response === "True") {
                        req.poster = json.Poster;
                        req.description = json.Plot;
                        req.director = json.Director;
                        req.actors = json.Actors;
                        req.duration = json.Runtime.split(' ')[0] * 60000;
                        return Promise.resolve();
                    }
                    else {
                        return Promise.reject("Movie data not found in external api.");
                    }
                }
            } catch (err) {
                return Promise.reject("There was error while fetching movie data from external api.");
            }
        })
];

const validateRequestById = [
    param('id').not().isEmpty().withMessage('The ID was not provided.').bail().custom(async (value, {req}) => { 
        try {
            const movie = await Repertoire.findById(req.params.id);
            if (!movie) {
                return Promise.reject('The movie with the given ID was not found.');
            }
            req.movie = movie;
            return Promise.resolve();
        }
        catch(ex) {
            console.log(ex);
            return Promise.reject("Cant't obtain movie data.");
        }
    }),
];

const Movie = mongoose.model('Movie', movieSchema);

module.exports.validateRequestById = validateRequestById;
module.exports.validatePostData = validatePostData;
module.exports.Movie = Movie;
