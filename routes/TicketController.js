const {validatePostData, validateRequestById, Ticket} = require('../models/Ticket'); 
const {checkValidation} = require('../middleware/Validation');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	try {
        const tickets = await Ticket.find().sort({name: 1});
        return res.status(200).json({ status: "sucess" , ticketsData: tickets.map(val => val.toObject()) });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

router.post('/', validatePostData, checkValidation, async (req, res) => {
	try {
        let ticket = new Ticket({ 
            name: req.body.name,
            basePriceRatio: req.body.basePriceRatio
        });

        await ticket.save();

        return res.status(200).json({ status: "sucess" , ticketData: ticket.toObject() });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

module.exports = router;