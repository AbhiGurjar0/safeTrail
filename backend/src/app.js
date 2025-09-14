const express = require('express');
const app = express();
const db = require('../src/db/db');
const userRouter = require('../src/routes/userRoutes')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// const path = require('path');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const flash = require('connect-flash');
app.set('view engine', 'ejs');
app.set('views', 'src/views');
app.use('/', userRouter);

module.exports = app;

