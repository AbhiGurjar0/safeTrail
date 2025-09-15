const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, forgotPass } = require('../controllers/userAuth');
const { emergencyService } = require('../services/emergencyService');
const isLoggendIn = require('../middlewares/isLoggendIn');
const userModel = require('../models/User');
const journeyModel = require('../models/Journey');
const { getIO } = require("../socket");
const Trip = require('../models/Trip');



//controllers 
router.post('/signin', loginUser);
router.post('/signup', registerUser);
router.post('/logout', logoutUser);
router.post('/forgot', forgotPass);

//services

router.post('/emergency', emergencyService);


// render Routes
router.get('/', isLoggendIn, async (req, res) => {
    let user = null;
    if (req.user) {
        user = await userModel.findById(req.user._id);
    }

    res.render('home', { user });
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard');
})
router.get('/login', (req, res) => {
    res.render('login');
})
router.get('/register', (req, res) => {
    res.render('register');
})
router.get('/emergencySos', (req, res) => {
    res.render('emergencySos');
})
router.get('/Admin', (req, res) => {
    res.render('admin');
})
router.get('/Admin', (req, res) => {
    res.render('admin');
})
router.get('/police', (req, res) => {
    res.render('police');
})
router.get('/forgot', (req, res) => {
    res.render('forgot');
})

router.post('/journey/submit', isLoggendIn, async (req, res) => {
    try {
        const { startLocation, destination, date, time, passengers } = req.body;

        await journeyModel.create({
            userId: req.user._id,
            startLocation,
            endLocation: destination,
            travelDate: date,
            travelTime: time,
            passengers

        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error submitting journey:", error);
        req.flash("error", "Failed to submit journey.");
        res.redirect('/dashboard');
    }
});
router.get('/details', async (req, res) => {
    const Trips = await journeyModel.find();
    res.render('tripDetails', { Trips });
})
router.post('/startTrip', isLoggendIn, async (req, res) => {
    const { tripId } = req.body;
    try {
        const journey = await journeyModel.findByIdAndUpdate(tripId, { status: 'in-progress' }, { new: true });
        if (!journey) {
            req.flash("error", "Journey not found.");
            return res.redirect('/details');
        }

        await Trip.create({
            userId: req.user._id,
            startLocation: journey.startLocation,
            endLocation: journey.endLocation,
            travelDate: journey.travelDate,
            travelTime: journey.travelTime,
            passengers: journey.passengers
        });

        getIO().emit("tripStarted", { tripId, status: "Ongoing" });

        res.redirect('/details');
    } catch (error) {
        console.error("Error starting trip:", error);
        req.flash("error", "Failed to start trip.");
        res.redirect('/details');
    }
});
router.post('/endTrip', async (req, res) => {
    const { tripId } = req.body;
    try {
        await journeyModel.findByIdAndUpdate(tripId, { status: 'completed' });
        getIO().emit("tripEnded", { tripId, status: "Completed" });
        res.redirect('/details');
    } catch (error) {
        console.error("Error ending trip:", error);
        req.flash("error", "Failed to end trip.");
        res.redirect('/details');
    }
});



module.exports = router;