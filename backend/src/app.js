const express = require('express');
const app = express();
const db = require('../src/db/db');
const userRouter = require('../src/routes/userRoutes')
app.use('/', userRouter);

module.exports = app;

