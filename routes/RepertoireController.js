const {validatePostData, validateRequestById, Repertoire} = require('../models/Repertoire'); 
const {checkValidation} = require('../middleware/Validation');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	try {
        const repertoires = await Repertoire.find({displayDateTime:{$gt:+Date.now()}})
            .populate('cinemaHallId')
            .populate('movieId')
            .sort({displayDateTime: 1});

        let result = repertoires.reduce((arr, el) => {
            const {movieId, ...rest} = el.toObject();
            const currentMovie = arr[el.movieId._id] = arr[el.movieId._id] || { movie: movieId, rest: [] };
            currentMovie.rest = [...currentMovie.rest, rest];
            return arr;
        }, {});
        result = Object.values(result).map(mov => {
            let datesArray = mov.rest.reduce((arr, el) => {
                const {displayDateTime, ...rest} = el;
                const timestamp = + new Date(el.displayDateTime);
                const currentDate = arr[timestamp] = arr[timestamp] || { displayDateTime: timestamp, rest: [] };
                currentDate.rest = [...currentDate.rest, rest];
                return arr;
            }, {});
            datesArray = Object.values(datesArray).map(date => {
                halls = date.rest.reduce((arr, el) => {
                    const {cinemaHallId, ...rest} = el;
                    arr[el.cinemaHallId._id] = arr[el.cinemaHallId._id] || { cinemaHall: cinemaHallId, repertoireId: rest._id, baseTicketPrice: rest.baseTicketPrice };
                    return arr;
                }, {});
                return {
                    displayDateTime: date.displayDateTime,
                    repertoires: Object.values(halls)
                }
            });
            return {
                movie: mov.movie,
                displayDates: datesArray
            }
        });

        return res.status(200).json({ status: "sucess" , movies: result });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

router.post('/', validatePostData, checkValidation, async (req, res) => {
	try {
        let repertoire = new Repertoire({ 
            cinemaHallId: req.body.cinemaHallId,
            movieId: req.body.movieId,
            displayDateTime: req.body.displayDateTime,
            baseTicketPrice: req.body.baseTicketPrice
        });

        await repertoire.save();

        const {cinemaHallId, movieId, ...rest} = repertoire.toObject();
        rest.movie = req.movie;
        rest.cinemaHall = req.cinemaHall;

        return res.status(200).json({ status: "sucess" , repertoireData: rest });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

router.post('/insertMany', async (req, res) => {
    try {
        for (let x = 0; x < req.body.repertoires.length; x++)
        {
            let repertoire = new Repertoire({ 
                cinemaHallId: req.body.repertoires[x].cinemaHallId,
                movieId: req.body.repertoires[x].movieId,
                displayDateTime: req.body.repertoires[x].displayDateTime,
                baseTicketPrice: req.body.repertoires[x].baseTicketPrice
            });
            await repertoire.save();
        }

        return res.status(200).json({ status: "sucess" });
    }
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

module.exports = router;