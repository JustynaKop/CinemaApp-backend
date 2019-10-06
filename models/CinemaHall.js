const mongoose = require('mongoose');
const {body, param, validationResult} = require('express-validator');

const cinemaHallSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

const validatePostData = [
    body('name', "Cinema hall name is required.").not().isEmpty(),
    body('seats.*.renderingRowNumber', "Seat renderig row number is required and it needs to be greater than 0.").isInt({ gt : 0}),
    body('seats.*.renderingColumnNumber', "Seat renderig column number is required and it needs to be greater than 0.").isInt({ gt : 0}),
    body('seats').isArray({ min : 1}).bail().withMessage("Cinema hall has to be created with at least one seat.").custom((value, {req}) => { 
        if (!validationResult(req).isEmpty()) {
            return Promise.resolve();
        }
        let tranformedValue = value.map(element => 'row' + element.renderingRowNumber.toString() + 'col' + element.renderingColumnNumber.toString());
        let duplicates = tranformedValue.filter((element, index, array) => array.indexOf(element) !== index);
        return duplicates.length > 0 ? Promise.reject("Some seats are placed on same position with another seats.") : Promise.resolve();
    }),
];

const validateRequestById = [
    param('id').not().isEmpty().withMessage('The ID was not provided.').bail().custom(async (value, {req}) => { 
        try {
            const hall = await CinemaHall.findById(req.params.id);
            if (!hall) {
                return Promise.reject('The cinema hall with the given ID was not found.');
            }
            req.cinemaHall = hall;
            return Promise.resolve();
        }
        catch(ex) {
            console.log(ex);
            return Promise.reject("Cant't obtain cinema hall data.");
        }
    }),
];

const CinemaHall = mongoose.model('CinemaHall', cinemaHallSchema);

module.exports.validateRequestById = validateRequestById;
module.exports.validatePostData = validatePostData;
module.exports.CinemaHall = CinemaHall;
