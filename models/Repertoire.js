const {Movie} = require('./Movie'); 
const {CinemaHall} = require('./CinemaHall'); 
const mongoose = require('mongoose');
const {body, param, validationResult} = require('express-validator');

const repertoireSchema = new mongoose.Schema({
    cinemaHallId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CinemaHall',
        required: true 
    },
    movieId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie',
        required: true 
    },
    displayDateTime: {
        type: Date,
        required: true
    },
    baseTicketPrice: {
        type: Number,
        required: true
    }
});

const validatePostData = [
    body('cinemaHallId').not().isEmpty().withMessage("Cinema hall is required.")
        .bail()
        .custom(async (value, {req}) => { 
            try {
                const hall = await CinemaHall.findById(req.body.cinemaHallId)
                if (!hall) {
                    return Promise.reject("Cinema hall with given ID was not found.")
                }
                req.cinemaHall = hall;
                return Promise.resolve();
            }
            catch(ex) {
                console.log(ex);
                return Promise.reject("Cant't obtain cinema hall data.");
            }
        }),
    body('movieId').not().isEmpty().withMessage("Movie is required.")
        .bail()
        .custom(async (value, {req}) => { 
            try {
                const movie = await Movie.findById(req.body.movieId)
                if (!movie) {
                    return Promise.reject("Movie with given ID was not found.")
                }
                req.movie = movie;
                return Promise.resolve();
            }
            catch(ex) {
                console.log(ex);
                return Promise.reject("Cant't obtain movie data.");
            }
        }),
    body('displayDateTime').not().isEmpty().withMessage('Display date and time is required.').bail()
        .isNumeric({ no_symbols : true }).withMessage("Display date and time is required and should be numeric value indicating timestamp in miliseconds.")
        .bail()
        .custom(async (value, {req}) => { 
            if (req.body.displayDateTime < +Date.now()) {
                return Promise.reject('Display date and time needs to be grater than current time (timestamp in miliseconds).');
            }
            if (!validationResult(req).isEmpty()) {
                return Promise.resolve();
            }
            try {
                const same = await Repertoire.findOne({displayDateTime: req.body.displayDateTime, cinemaHallId: req.body.cinemaHallId});
                if (same) {
                    return Promise.reject("Repertoire entry for provided cinema hall and time already exist.");
                }

                const previous = await Repertoire.find({displayDateTime: {$lt:req.body.displayDateTime}, cinemaHallId: req.body.cinemaHallId})
                    .sort({displayDateTime: -1})
                    .limit(1)
                    .populate('movieId');

                const next = await Repertoire.find({displayDateTime: {$gt:req.body.displayDateTime}, cinemaHallId: req.body.cinemaHallId})
                    .sort({displayDateTime: 1})
                    .limit(1)
                    .populate('movieId');

                if (previous && previous.length > 0 &&  + new Date(previous[0].displayDateTime) + previous[0].movieId.duration > req.body.displayDateTime) {
                    return Promise.reject("Display date time overlaps with previous rapertoire entry.");
                }
                if (next && next.length > 0 &&  req.body.displayDateTime + req.movie.duration > + new Date(next[0].displayDateTime)) {
                    return Promise.reject("Display date time overlaps with next rapertoire entry.");
                }

                return Promise.resolve();
            }
            catch(ex) {
                console.log(ex);
                return Promise.reject("Cant't obtain current repertoires data.");
            }
        }),
    body('baseTicketPrice', "Base ticket price is required and it needs to be greater than 0.").isFloat({ min : 0 })
];

const validateRequestById = [
    param('id').not().isEmpty().withMessage('The ID was not provided.').bail().custom(async (value, {req}) => { 
        try {
            const repertoire = await Repertoire.findById(req.params.id);
            if (!hall) {
                return Promise.reject('The repertoire with the given ID was not found.');
            }
            req.repertoire = repertoire;
            return Promise.resolve();
        }
        catch(ex) {
            console.log(ex);
            return Promise.reject("Cant't obtain repertoire data.");
        }
    }),
];

const Repertoire = mongoose.model('Repertoire', repertoireSchema);

module.exports.validateRequestById = validateRequestById;
module.exports.validatePostData = validatePostData;
module.exports.Repertoire = Repertoire;

