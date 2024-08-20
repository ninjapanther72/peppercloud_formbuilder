const createError = require('http-errors');
const express = require("express");
require("dotenv").config({path: ".env"});
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const process = require("node:process");
const {printError, printLog} = require("./utils/ServerUtils");

const server = express();


const TAG = "Server.js";
const SERVER_PORT = process.env.SERVER_PORT;

// view engine setup
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'pug');

server.use(logger('dev'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(cookieParser());
server.use(express.static(path.join(__dirname, 'public')));

server.use('/', indexRouter);
server.use('/users', usersRouter);

// catch 404 and forward to error handler
server.use(function(req, res, next) {
  next(createError(404));
});

// error handler
server.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function log(...text) {
  printLog(TAG, ...text);
}

function logErr(...text) {
  printError(TAG, ...text);
}


server.listen(SERVER_PORT, () => {
  log(`Server is running on ${SERVER_PORT}`);
});

module.exports = server;
