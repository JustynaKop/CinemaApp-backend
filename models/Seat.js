const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    cinemaHallId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CinemaHall' 
    },
    rowNumber: {
        type: Number,
        required: true
    },
    columnNumber: {
        type: Number,
        required: true
    },
    renderingRowNumber: {
        type: Number,
        required: true
    },
    renderingColumnNumber: {
        type: Number,
        required: true
    }
});

const Seat = mongoose.model('Seat', seatSchema);

module.exports.Seat = Seat;

