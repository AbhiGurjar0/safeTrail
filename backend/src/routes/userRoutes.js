const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, forgotPass } = require('../controllers/userAuth');
const { emergencyService } = require('../services/emergencyService');




//controllers 
router.post('/signin', loginUser);
router.post('/signup', registerUser);
router.post('/logout', logoutUser);
router.post('/forgot', forgotPass);

//services

router.post('/emergency', emergencyService);

// render Routes
router.get('/', (req, res) => {
    res.render('home');
})

router.get('/dashboard', (req, res) => {
    res.render('dashboard');
})
router.get('/login', (req, res) => {
    res.render('login');
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




module.exports = router;