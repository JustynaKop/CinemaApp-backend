const mongoose = require('mongoose');
const {body, param } = require('express-validator');

const ticketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    basePriceRatio: {
        type: Number,
        required: true
    }
});

const validatePostData = [
    body('name').not().isEmpty().withMessage("Title is required."),
    body('basePriceRatio').isFloat({ min : 0 }).withMessage("Base price ration should be float value grater than 0.")
];

const validateRequestById = [
    param('id').not().isEmpty().withMessage('The ID was not provided.').bail().custom(async (value, {req}) => { 
        try {
            const ticket = await Repertoire.findById(req.params.id);
            if (!ticket) {
                return Promise.reject('The ticket with the given ID was not found.');
            }
            req.ticket = ticket;
            return Promise.resolve();
        }
        catch(ex) {
            console.log(ex);
            return Promise.reject("Cant't obtain ticket data.");
        }
    }),
];

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports.validateRequestById = validateRequestById;
module.exports.validatePostData = validatePostData;
module.exports.Ticket = Ticket;
