var express = require('express');
var bodyParser = require('body-parser')

require('./dbAccess/init.js')('./test.db').then(startServer);

var app = express();
app.use(bodyParser.json())
app.set('view engine', 'ejs');

function startServer(dbApi) {
  console.log('DB initialized');

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });

  app.post('/add', function (req, res) {
    dbApi.add(req.body)
    .then(function() {
      res.status(200).end();
    })
    .catch(function(err) {
      console.log('Something is wrong', err);
      res.status(500).end();
    });
  });

  app.get('/exec', function(req, res) {
    res.render('pages/exec');
  });
  app.post('/exec', function(req, res) {
    console.log(req.body.query);
    dbApi.exec(req.body).then(function(obj) {
      res.send(JSON.stringify(obj));
    }).catch(function (err) {
      res.status(500).send(JSON.stringify(err));
    });
  });
}
