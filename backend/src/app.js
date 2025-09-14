const express = require('express');
const app = express();
const db = require('../src/db/db');
const userRouter = require('../src/routes/userRoutes')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require("express-session");
const flash = require('connect-flash');
app.set('view engine', 'ejs');
app.set('views', 'src/views');
app.use('/', userRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.Express_SESSION_SECRET,
    })
);
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
module.exports = app;

