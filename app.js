var express = require('express');
var session = require('express-session');
var sharedsession = require("express-socket.io-session");
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');

//Mongodb connection
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var participants = [];

var routes = require('./routes/index');
var api = require('./routes/api');
var auth = require('./routes/auth');
var config = require('./config');


var db;
var mongoUrl = config.mongoUrl;

var app = express();
var http = require('http').Server(app);

MongoClient.connect(mongoUrl, function (err, database) {
  if (err)
    throw err;
  db = database;
  console.log('coll opened');
});

var server = app.listen(config.port, config.ip, function() {
  console.log('%s: Node server started on %s:%d ...',
  Date(Date.now() ), config.ip, config.port);
});

var session = require("express-session")({
  secret: "uomcollab",
  resave: true,
  saveUninitialized: true
});


var io = require('socket.io').listen(server);


// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('views', 'views');
app.set('view engine', 'html');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.query());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.methodOverride());
app.use(cookieParser());
app.use(session);
app.use(express.static(path.join(__dirname, '')));

// Share session with io sockets

io.use(sharedsession(session));

//routes
app.use('/', routes);
app.use('/auth', auth);
app.use('/api',api);


io.on('connection',function(socket){
  //console.log('socket connection');
  socket.on('create',function(room){
    classroom = room;
    //console.log("classroom is "+room);
    socket.join(room);
  });

  socket.on('connect',function(data){
    
  });

  socket.on('userConnected',function(data){
    console.log(data);
    data.socket_id = socket.id;
    
    participants.push(data);
    io.emit('participantsList',participants);
  });
  
  socket.on('disconnect',function(data){
    console.log('user disconnected');
    participants = _.without(participants,_.findWhere(participants,{socket_id: socket.id}));
    console.log(participants);
    io.emit('participantsList',participants);
  });

  socket.on('chatUpdate',function(data){
    io.emit('chatUpdate',data);
  });

});

app.get('/404',function(req,res,next){
  res.render('404.html');
});


/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('404');
  next(err);
});
// make db accessible to router
app.use(function (req, res, next) {
  req.db = db;
  next();
});
/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('404');
  /*
  res.render('error', {
    message: err.message,
    error: {}
  });*/
});

module.exports = app;


