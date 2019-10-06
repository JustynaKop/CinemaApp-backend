const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

app.use(cors());
app.options("*", cors({ 
    "origin" : "*",
    "methods" : "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    "allowedHeaders" : "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, x-auth-token"
}));

mongoose.connect('mongodb+srv://Justyna:Aleksander@cinema-gpalg.mongodb.net/cinemaDatabase', { 
    useNewUrlParser: true, useUnifiedTopology: true
})
.then(() => console.log('connected to MongoDB...'))
.catch(err => console.error('Could not connect to MongoDB...'))
mongoose.set('useCreateIndex', true);
//Express body parser
app.use(express.json());

// Routes
app.use('/hall', require('./routes/CinemaHallsController.js'));
app.use('/movie', require('./routes/MovieController.js'));
app.use('/ticket', require('./routes/TicketController.js'));
app.use('/repertoire', require('./routes/RepertoireController.js'));
app.use('/reservation', require('./routes/ReservationController.js'));

const PORT = process.env.PORT || 5005;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
