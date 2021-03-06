//server set-up and message request setup
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var file = "test.db";
var db = new sqlite3.Database(file);
var exists = fs.existsSync(file);


app.use('/static', express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/mytest.html');
});


app.get('/Signin_api', function(req, res){
    var users = db.prepare('SELECT * from User where username = #username AND password = #password');
    if(name ==users[name] and pass==users[password]){
      return yes;
    } else {
      return alert(wrong info);
    }
});


io.on('connection', function(socket){
  socket.on('chat message', function(msg){

        db.serialize(function() {

          
          var stmt = db.prepare('INSERT INTO chat(posted_on,message) VALUES (?,?)');
          stmt.run(new Date().getTime(),msg);
          //console.log( new Date().getTime() );

          stmt.finalize();
        });

        

    io.emit('chat message', msg);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

