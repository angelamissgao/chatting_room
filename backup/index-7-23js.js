//var app = require('express')();

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use('/static', express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/mytest.html');
});


io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});


//database 

var sqlite3 = require('sqlite3').verbose();
var fs = require("fs");
var file = "test.db";
var db = new sqlite3.Database(file);
var exists = fs.existsSync(file);

db.serialize(function() {

  db.run('CREATE TABLE lorem (info TEXT)');
  var stmt = db.prepare('INSERT INTO lorem VALUES (?)');

  for (var i = 0; i < 10; i++) {
    stmt.run('Ipsum ' + i);
  }

  stmt.finalize();

  db.each('SELECT rowid AS id, info FROM lorem', function(err, row) {
    console.log(row.id + ': ' + row.info);
  });
});

db.close();