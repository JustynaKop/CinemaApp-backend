const {validatePostData, validateRequestByRepertoireId, Reservation} = require('../models/Reservation'); 
const mongoose = require('mongoose');
const {checkValidation} = require('../middleware/Validation');
const express = require('express');
const router = express.Router();

router.get('/reservedSeats/:repertoireId', validateRequestByRepertoireId, checkValidation, async (req, res) => {
	try {
        const reservations = await Reservation.find({ repertoireId: req.repertoire._id});
        return res.status(200).json({ status: "sucess" , reservedSeatsIds: reservations.reduce((arr, el) => [...arr, ...el.seats],[]) });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

router.post('/', validatePostData, checkValidation, async (req, res) => {
	try {
        let reservation = new Reservation({ 
            repertoireId: req.body.repertoireId,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            seats: req.body.seats.map(id => mongoose.Types.ObjectId(id)),
            tickets: req.body.tickets.map(id => mongoose.Types.ObjectId(id)),
        });

        await reservation.save();

        return res.status(200).json({ status: "sucess" , reservationData: reservation.toObject() });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

module.exports = router;