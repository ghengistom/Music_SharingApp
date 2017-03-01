//==============================================================================
//
//
//
//
//
//
//==============================================================================
// app.js
//==============================================================================
              /* Define variables, Modules, DB and other Stuffs*/
//==============================================================================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');
var app = express();
// mongo db server =======
var User = require('./models/user');
mongoose.connect('mongodb://localhost/melomaniac', function(err) {
  if (err) {
    console.log("Failed connecting to Mongodb!");
  } else {
    console.log("Successfully connected to Mongodb!");
  }
});
//socket io server =======
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(9001); // listen for socket io traffic on port 4200 since app runs on 3000.
//==============================================================================
                          /* Playlist */
var master_playlist = new Array();
//==============================================================================





//==============================================================================
                          /* Web app set up */
//==============================================================================
//app.set('views', path.join(__dirname, 'views'));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//==============================================================================


//==============================================================================
                        /* Socket.io */
//==============================================================================
// listen for connection
io.sockets.on('connection', function(client) {

    console.log('Client connected...');

    // when a user signs in, a join_user broadcast occurs.
    client.on('new_user', function(user){
        console.log('socket message received by app -- new_user_logged_on -- ' + user.username);
    });

    client.on('new_chat', function(chat){
      console.log('socket message recieved by app -- new_chat -- ' + chat.username + ' : ' + chat.message);
      // TODO save chat data
      // tell all the clients.
      io.emit('new_chat_announcement', chat);
    });

    client.on('new_track', function(track){
      console.log(track);
      //  save the track data in local playist array, or maybe make a new schema and persist to mongo later...
      if( master_playlist.indexOf(track) == -1 ){
        master_playlist.push(track);
        console.log("adding new track");
        // tell all the clients.
        io.emit('new_playlist_announcement', master_playlist);
     }
     else{
       console.log("track is already in array");
     }
    });

    client.on('no_playlist', function(){
      // tell all the clients.
      io.emit('new_playlist_announcement', master_playlist);
    });

});
//==============================================================================
io.sockets.on('disconnect', function(client) {
    console.log('Client disconnected...');
});
//==============================================================================



//==============================================================================

                  /* Ajax GETs and POST repsonses Defined here */

//==============================================================================
app.get('/', function(req, res){
  res.send(200, __dirname + '/public/index.html');
});
//==============================================================================
app.get('/index', function(req, res){
  res.send(200, __dirname + '/public/index.html');
});
//==============================================================================
app.post('/register', function(req, res){
  var new_user = req.body;
  // Add the user to the DB
  User.create(new_user, function(err, user){
    // tell the client if it was successful or not.
    console.log('creating user');
    if (err) {
          return res.status(500).json({err: err.message});
    }
    else{
      console.log('successful user creation: ');
      console.log(user);
      return res.json({'success': true, 'username': user.username});
    }
  });
});
//==============================================================================
app.post('/login', function(req, res){
  // get user name and password
  var possible_user = req.body;

  // look for one in database where password and user name match.
  User.findOne({username: possible_user.username, password: possible_user.password}, function(err, user){
    if (err){
      // if no match then send false.
      return res.json({'success': false, 'username': ''});
    }
    else{
      // if match, then pass back success = true and the username.
      console.log("Successful user logon");
      return res.json({'success': true, 'username': user.username});
    }
  });
});
//==============================================================================







//==============================================================================


//==============================================================================



//==============================================================================

                  /* Error Handlers */

//==============================================================================
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(req.params);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
//==============================================================================
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.status + ' : ' + err.message);
  });
}
//==============================================================================
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.status + ' : ' + err.message);
});
//==============================================================================
module.exports = app;
//==============================================================================
