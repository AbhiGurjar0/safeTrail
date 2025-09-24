const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, forgotPass } = require('../controllers/userAuth');
const { emergencyService } = require('../services/emergencyService');
const isLoggendIn = require('../middlewares/isLoggendIn');
const mongoose = require('mongoose');
const userModel = require('../models/User');
const journeyModel = require('../models/Journey');
const { getIO } = require("../socket");
const Trip = require('../models/Trip');
const Emergency = require('../models/emergency');
const e = require('connect-flash');

const turf = require("@turf/turf");


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

router.get('/dashboard', isLoggendIn, async (req, res) => {
    const Trips = await journeyModel.find();
    let user = await userModel.findById(req.user._id);

    res.render('dashboard', { Trips, user });
})
router.get('/login', (req, res) => {
    res.render('login');
})
router.get('/register', (req, res) => {
    res.render('register');
})
router.get('/emergencySos', isLoggendIn, async (req, res) => {
    let user = await userModel.findById(req.user._id);
    res.render('emergencySos', { user });
})
router.get('/Admin', async (req, res) => {
    let Trips = await Trip.find();
    let emergency = await Emergency.find();
    let user = await userModel.findById()
    res.render('admin', { Trips, emergencies: emergency });
})
// router.get('/Admin', (req, res) => {
//     res.render('admin');
// })
router.get('/police', isLoggendIn, async (req, res) => {
    let user = await userModel.findById(req.user._id);
    res.render('police', { user });
})
router.get('/forgot', (req, res) => {
    res.render('forgot');
})

router.post('/journey/submit', isLoggendIn, async (req, res) => {
    try {
        const { startLocation, destination, date, enddate, passengers } = req.body;

        await journeyModel.create({
            userId: req.user._id,
            startLocation,
            endLocation: destination,
            travelDate: date,
            enddate,
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
            return res.redirect('/dashboard');
        }

        await Trip.create({
            userId: req.user._id,
            startLocation: journey.startLocation,
            endLocation: journey.endLocation,
            travelDate: journey.travelDate,
            passengers: journey.passengers
        });

        getIO().emit("tripStarted", { tripId, status: "Ongoing" });

        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error starting trip:", error);
        req.flash("error", "Failed to start trip.");
        res.redirect('/dashboard');
    }
});
router.post('/endTrip', async (req, res) => {
    const { tripId } = req.body;
    try {
        await journeyModel.findByIdAndUpdate(tripId, { status: 'completed' });
        getIO().emit("tripEnded", { tripId, status: "Completed" });
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error ending trip:", error);
        req.flash("error", "Failed to end trip.");
        res.redirect('/dashboard');
    }
});
router.post('/emergencySos', isLoggendIn, async (req, res) => {
    try {
        const { payload } = req.body;

        // Notify emergency services
        await Emergency.create({
            userId: req.user._id,
            lat: payload.lat,
            long: payload.lng,
        });
        getIO().emit("emergency", { location: { lat: payload.lat, long: payload.lng }, message: payload.message });


        req.flash("success", "Emergency services notified.");
        res.json({ success: true });
    } catch (error) {
        console.error("Error notifying emergency services:", error);
        req.flash("error", "Failed to notify emergency services.");
        res.json({ success: false });
    }
});

// getIO().on("broadcast", (message) => {
//     getIO().emit("alert", { message });
// });





router.get('/map',(req,res)=>{
    res.render('A');
})

module.exports = router;