//server set-up and message request setup
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var file = "test.db";
var db = new sqlite3.Database(file);
var exists = fs.existsSync(file);


app.use('/static', express.static('static'));
//POST request bodyParser define;
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.get('/signup', function(req, res){
  console.log("sucess sighup");
  res.sendFile(__dirname + '/signup.html');
});


app.get('/chat', function(req, res){
   console.log('cookies: ', req.cookies);
   if ( isEmptyObject(req.cookies) ) {
     console.log('no cookies found');
    res.sendFile(__dirname + '/login.html');
   } 
   
   else {
    res.sendFile(__dirname + '/mytest.html');
   }
});

function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}
// app.get('/good-login', function(req, res){
//   res.sendFile(__dirname + '/mytest.html');
// });

//sign up
app.post('/creatuser', function(req,res){ 
  var username=req.body.username;
  var email=req.body.email;
  var password=req.body.password;
  var gender=req.body.gender;
  

  var user = db.prepare('INSERT INTO users(username,email,salt,gender) VALUES (?,?,?,?)');
    user.run(username,email,password,gender);

  console.log("User name =", username);

  res.sendFile(__dirname + '/mytest.html');
} );


app.post('/signin', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.get('SELECT * FROM users WHERE username = ? AND salt = ?', username, password, function(err, row) {
    if (row) {
      res.send('yes');
    }
    else {
      res.send('no');
    }
  });

  console.log("User name =", username);
});



//Passport and login-7.19
// var crypto = require('crypto');
// var passport = require('passport')
//   , LocalStrategy = require('passport-local').Strategy;

//   //var sqlite3 = require('sqlite3');
//   // var db = new sqlite3.Database('./database.sqlite3');


// function hashPassword(password, salt) {
//   var hash = crypto.createHash('sha256');
//   hash.update(password);
//   hash.update(salt);
//   return hash.digest('hex');
// }

// passport.use(new LocalStrategy(function(username, password, done) {
//   return done(null, true);
//   db.get('SELECT salt FROM users WHERE username = ?', username, function(err, row) {
//     console.log(row);
//     if (!row) return done(null, false);
//     //var hash = hashPassword(password, row.salt);
//     var hash = row.salt
//     db.get('SELECT username, id FROM users WHERE username = ? AND salt = ?', username, hash, function(err, row) {
//       console.log(row);
//       if (!row) return done(null, false);
//       return done(null, row);
//     });
//   });
// }));

// // passport.serializeUser(function(user, done) {
// //   return done(null, user.id);
// // });

// // passport.deserializeUser(function(id, done) {
// //   db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
// //     if (!row) return done(null, false);
// //     return done(null, row);
// //   });
// // });

// ...
// app.post('/login', passport.authenticate('local', { successRedirect: '/good-login',
//                                                     failureRedirect: '/login' }));




//Chatting tool using Socket.io
io.on('connection', function (socket){
   console.log('a user connected');
   var stats={connection:0};
   stats.connection++;
   console.log("number is "+stats.connection);

//update online users
  var users = [];
  socket.on("adduser",function(user){
    
    users.push(user)
    // console.log( users.push(user) );
    // console.log(users);

    //var socket.user=user;
    //users.push(user);
    updateClients();
  });

  socket.on('discontect',function(){
    stats.connection--;
    console.log('user disconnected');
    for(var i=0;i<users.length;i++){
      if(users[i]==socket.user){
        delete users[users[i]];
      }
    }
    updateClients();
  });

  function updateClients(){
    
    io.sockets.emit('update',users);
  }


//Give last 10 message to newly loged in users;
  db.serialize(function(stream){
    db.each('SELECT message,posted_on,username FROM (SELECT message,chat_id,posted_on,username FROM chat INNER JOIN users ON users.id=chat.userid ORDER BY chat_id DESC LIMIT 10) ORDER BY chat_id',function(err,row){
      io.emit('stream',row);
    });
  });
    

  socket.on('tweet', function(tweet){
    db.serialize(function() {
      var dbname=tweet.username;
        db.get('SELECT id FROM users WHERE username=?', dbname,function(err,row){  
          if(row){
            var stmt = db.prepare('INSERT INTO chat(posted_on, userid, message) VALUES (?,?,?)');
            stmt.run(new Date().getTime(), row.id, tweet.msg);
            stmt.finalize();
          }
        });
      });
    tweet.time= new Date().getTime();
    io.emit('chat message',tweet);
    console.log(tweet);
  });
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});



