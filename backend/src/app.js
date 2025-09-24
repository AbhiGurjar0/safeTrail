require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('../src/db/db');
connectDB();
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
const Ai = require('../src/routes/ai');
const { initSocket } = require("./socket");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = initSocket(server);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET || "secretKey",
    })
);
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
app.use('/', userRouter);
app.use('/ai',Ai);
module.exports = server;

