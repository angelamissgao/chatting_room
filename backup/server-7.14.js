var fs = require('fs');
var express = require('express');
var app = express();

app.use('/static', express.static('static'));

app.get('/', function (req, res) {
  res.sendFile('/Users/angelagao/Dropbox/CMU/18653_Foundation_of_SW_Engineering/WebContent/mytest.html')

  // fs.readFile('mytest.html', function(err, data) {
  //   res.render(data);
  // })
});

// app.get('/style.css', function (req, res) {
//   res.sendFile('/Users/angelagao/Dropbox/CMU/18653 Foundation of SW Engineering/WebContent/style.css')
// });

app.get('/handler1', function(req, response) {
  response.send("hello handler1 baober");
});

var server = app.listen(3000, function () {
var host = server.address().address;
var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});