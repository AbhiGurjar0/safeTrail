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
    // categorize trips: upcoming, ongoing, completed
    const ongoingTrips = await journeyModel.find({ status: 'in-progress' });
    const completedTrips = await journeyModel.find({ status: 'completed' });

    // upcoming = not started yet and travelDate is today or in future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingTrips = await journeyModel.find({
        status: { $nin: ['in-progress', 'completed'] },
        travelDate: { $gte: today }
    });
    let user = await userModel.findById(req.user._id);

    res.render('dashboard', { Trips, user, upTrips: upcomingTrips, comTrips: completedTrips });
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
router.get('/Owner', (req, res) => {
    res.render('owner');
})
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
        // Ensure the user doesn't already have an ongoing trip (change query to remove userId if you want a global single-running-trip rule)
        const existingOngoing = await journeyModel.findOne({ userId: req.user._id, status: 'in-progress' });
        if (existingOngoing) {
            // req.flash("success", "Trip started and saved successfully.");
            return res.status(400).json({ success: false, message: "You already have an ongoing trip." });
        }

        const journey = await journeyModel.findById(tripId);
        if (!journey) {
            return res.status(404).json({ success: false, message: "Journey not found." });
        }

        // Mark journey in-progress
        journey.status = 'in-progress';
        await journey.save();

        await Trip.create({
            userId: req.user._id,
            startLocation: journey.startLocation,
            endLocation: journey.endLocation,
            travelDate: journey.travelDate,
            passengers: journey.passengers
        });
        // req.flash("success", "Trip started and saved successfully.");

        getIO().emit("tripStarted", { tripId, status: "Ongoing" });
        res.status(200).json({ success: true, tripDetails: { startLocation: journey.startLocation, endLocation: journey.endLocation }, message: "Trip started successfully." });
    } catch (error) {
        console.error("Error starting trip:", error);
        res.status(500).json({ success: false, message: "Failed to start trip." });
    }
});
router.post('/endTrip', async (req, res) => {
    const { tripId } = req.body;
    try {
        await journeyModel.findByIdAndUpdate(tripId, { status: 'completed' });
        getIO().emit("tripEnded", { tripId, status: "Completed" });
        res.status(200).json({ success: true, message: "Trip ended successfully." });
    } catch (error) {
        console.error("Error ending trip:", error);
        res.status(500).json({ success: false, message: "Failed to end trip." });
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





router.get('/map', (req, res) => {
    res.render('A');
})

// ADD THIS CODE BLOCK BEFORE module.exports

// Route to update user settings
router.post('/user/settings/location', isLoggendIn, async (req, res) => {
    try {
        const { locationSharing } = req.body;
        const userId = req.user._id;

        // A list of valid options
        const validSettings = ['always', 'demand', 'off'];
        if (!validSettings.includes(locationSharing)) {
            return res.status(400).json({ message: 'Invalid setting value' });
        }

        // Find the user and update their preference in the database
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { 'settings.locationSharing': locationSharing },
            { new: true, runValidators: true } // Options to return the new doc and run schema validation
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Setting saved successfully', settings: updatedUser.settings });

    } catch (error) {
        console.error('Error saving setting:', error);
        res.status(500).json({ message: 'Server error while saving setting' });
    }
});


// This line should be right after the code you just added
router.post('/user/contacts/add', isLoggendIn, async (req, res) => {
    try {
        const { name, number } = req.body;
        const user = await userModel.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newContact = { name, number };
        user.emergencyContacts.push(newContact);
        await user.save();

        // Return the newly added contact so the frontend can display it
        res.status(201).json(user.emergencyContacts[user.emergencyContacts.length - 1]);

    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ message: 'Server error while adding contact' });
    }
});

router.get('/owner', async (req, res) => {
    const Users = await journeyModel.find({ status: 'in-progress' });
    res.render('owner', { Users });
})

module.exports = router;