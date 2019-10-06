const {validatePostData, validateRequestById, Movie} = require('../models/Movie'); 
const {checkValidation} = require('../middleware/Validation');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	try {
        const movies = await Movie.find().sort({title: 1});
        return res.status(200).json({ status: "sucess" , moviesData: movies.map(val => val.toObject()) });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: [ex.message] });
    }
});

router.post('/', validatePostData, checkValidation, async (req, res) => {
	try {
        let movie = new Movie({ 
            title: req.body.title,
            duration: req.duration,
            description: req.description,
            poster: req.poster,
            director: req.director,
            actors: req.actors
        });

        await movie.save();

        return res.status(200).json({ status: "sucess" , movieData: movie.toObject() });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: [ex.message] });
    }
});

module.exports = router;