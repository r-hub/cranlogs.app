var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs')
var whiskers = require('whiskers');

var downloads = require('./routes/downloads');
var top       = require('./routes/top');
var trending  = require('./routes/trending');
var badges    = require('./routes/badges');
var index     = require('./routes/index');

var app = express();

// view engine setup
app.engine('.html', whiskers.__express);
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log',
					   {flags: 'a'});
app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('combined'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/downloads', downloads);
app.use('/top', top);
app.use('/trending', trending);
app.use('/badges', badges);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
