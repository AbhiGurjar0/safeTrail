const express = reqire('express');
const app = express();

app.use('/',userRouter);

module.exports = app;

