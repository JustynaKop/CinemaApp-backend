const {validatePostData, validateRequestById, CinemaHall} = require('../models/CinemaHall'); 
const {Seat} = require('../models/Seat'); 
const {checkValidation} = require('../middleware/Validation');
const express = require('express');
const router = express.Router();

const transformSeatsData = (seatsWithHall) => {
    const result = seatsWithHall.reduce((arr, el) => { 
        arr[el.cinemaHallId._id] = arr[el.cinemaHallId._id] || { cinemaHall : el.cinemaHallId.toObject(), seats: [] };
        const {cinemaHallId, ...rest} = el.toObject();
        arr[el.cinemaHallId._id].seats = [...arr[el.cinemaHallId._id].seats, rest];
        return arr;
    }, {});
    return Object.values(result);
}

router.get('/', async (req, res) => {
	try {
        const seats = await Seat.find().populate('cinemaHallId');
        return res.status(200).json({ status: "sucess" , cinemaHallsData: transformSeatsData(seats)});
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

router.get('/:id', validateRequestById, checkValidation, async (req, res) => {
	try {
        const seats = await Seat.find({cinemaHallId: req.cinemaHall._id}).populate('cinemaHallId');
        const result = transformSeatsData(seats);
        return res.status(200).json({ status: "sucess" , cinemaHallData: result[0]});
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

router.delete('/:id', validateRequestById, checkValidation, async (req, res) => { //Sprawdzić czy nei ma rezerwacji powiązanych z salą.
	try {
        await Seat.collection.remove({cinemaHallId: req.cinemaHall});
        await req.cinemaHall.remove();
        return res.status(200).json({ status: "sucess" });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

//Dodaje nową salę do bazy danych, wraz z konfiguracją siedzeń.
router.post('/', validatePostData, checkValidation, async (req, res) => {
	try {
        let hall = new CinemaHall({ name: req.body.name });
        await hall.save();

        //Grupowanie po numerze wiersza (powstaje tablica tablic zawierajacych dane poszczególnych rzedów).
        const groupedByRows = req.body.seats.reduce((arr, el) =>  {
            arr[el.renderingRowNumber] = [...(arr[el.renderingRowNumber] || []), el];
            return arr;
        }, []).filter(group => group);

        //Utworzenie instacji modeli Seat, tak aby wygenerowana została numeracja siedzeń pomijająca ewentualne dziury.
        const groupedSeats = groupedByRows.map((arr, rowIndex) => {
            return [...arr].sort((a, b) => a.renderingColumnNumber - b.renderingColumnNumber).map((val, columnIndex) => new Seat({ 
                cinemaHallId: hall._id,
                rowNumber: rowIndex + 1,
                columnNumber: columnIndex + 1,
                renderingRowNumber: val.renderingRowNumber,
                renderingColumnNumber: val.renderingColumnNumber
            }));
        });

        //Spłaszczenie danych zawierajacych instacje modelu Seat (tak aby z tablicy tablic została utworzona jedna tablica zawierająca elementy ze wszystkich tablic podrzędnych).
        const seats = groupedSeats.reduce((arr, elem) => [...arr, ...elem] , []);

        await Seat.collection.insertMany(seats)

        const result = {
            cinemaHall: hall.toObject(),
            seats: seats.map(seat => seat.toObject())
        }

        return res.status(200).json({ status: "sucess" , cinemaHallData: result });
	}
    catch(ex) {
        console.log(ex);
        return res.status(500).json({ status: "requestFailed", errors: ['There was an unhadled error while processing the request.'] });
    }
});

module.exports = router;