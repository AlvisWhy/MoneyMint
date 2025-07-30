const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const indexRouter = require('./index');

app.use(cors()); 
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', indexRouter);

module.exports = app;
