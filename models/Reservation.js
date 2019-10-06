const {Repertoire} = require('./Repertoire'); 
const {Seat} = require('./Seat');
const {Ticket} = require('./Ticket');
const mongoose = require('mongoose');
const {body, param, validationResult } = require('express-validator');

const reservationSchema = new mongoose.Schema({
    repertoireId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Repertoire',
        required: true 
    },
    firstName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
    },
    lastName: {
        type: String, 
        required: true
    },
    seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }]
});

const validatePostData = [
    body('repertoireId').not().isEmpty().withMessage("Repertoire is required.").bail().custom(async (value, {req}) => { 
        const repertoire = await Repertoire.findById(req.body.repertoireId);
        if (!repertoire) {
            return  Promise.reject("Repertoire not found.")
        }

        req.repertoire = repertoire;
    }),
    body('firstName').not().isEmpty().withMessage("First name is required."),
    body('email').not().isEmpty().withMessage("Email is required.").bail().isEmail().withMessage("Email is invalid"),
    body('lastName').not().isEmpty().withMessage("Last name is required."),
    body('seats').isArray({ min : 1}).bail().withMessage("At least one seat is required.").custom(async (value, {req}) => { 
        if (!validationResult(req).isEmpty()) {
            return Promise.resolve();
        }

        const seatsData = await Seat.find({_id: { $in: req.body.seats.map(id => mongoose.Types.ObjectId(id)) }});
        if (seatsData.length != req.body.seats.length) {
            return  Promise.reject("Some seats IDs are not found.")
        }

        const invalidSeats = seatsData.filter(val => val.cinemaHallId.toHexString() != req.repertoire.cinemaHallId.toHexString());

        if (invalidSeats.length > 0) {
            return  Promise.reject("Some seats belong to cinema hall which is not associated with provided repertoire.");
        }

        const reservations = await Reservation.find({ repertoireId: req.repertoire._id});
        const reservedSeats = reservations.reduce((arr, el) => [...arr, el.seats],[]);

        if (reservedSeats.some(v1 => req.body.seats.some(v2 => v2 == v1))) {
            return Promise.reject("Some seats were already reserved.");
        }

        req.seatsData = seatsData;

        return Promise.resolve();
    }),
    body('tickets').isArray({ min : 1}).bail().withMessage("At least one ticket is required.").custom(async (value, {req}) => { 
        if (!validationResult(req).isEmpty()) {
            return Promise.resolve();
        }
        if (req.body.seats.length != req.body.tickets.length) {
            return  Promise.reject("There is missmatch between tickets number and seats number.");
        }

        const ticketsData = await Ticket.find({_id: { $in: req.body.tickets.map(id => mongoose.Types.ObjectId(id)) }});
        if (req.body.tickets.some(t => !ticketsData.find(t2 => t == t2._id))) {
            return  Promise.reject("Some ticket IDs are not found.")
        }

        req.ticketsData = ticketsData;

        return Promise.resolve();
    })
];

const validateRequestByRepertoireId = [
    param('repertoireId').not().isEmpty().withMessage('The ID was not provided.').bail().custom(async (value, {req}) => { 
        try {
            const repertoire = await Repertoire.findById(req.params.repertoireId);
            if (!repertoire) {
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

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports.validateRequestByRepertoireId = validateRequestByRepertoireId;
module.exports.validatePostData = validatePostData;
module.exports.Reservation = Reservation;
