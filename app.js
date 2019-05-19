var express = require('express');
var riak = require('./mongo')
var bodyParser = require('body-parser');
const app = express();
const port = 8080;

app.post('*', function (req, res, next) {
  var idToken = req.get('Authorization');
  if (idToken == null) {
    res.status(401).send({ errorCode: 401, errorMessage: 'User without id' })
  } else {
    res.locals.uid = idToken;
    next();
  }
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));



app.post('/missclick', function (req, res, next) {
  try {
    riak.insertMissClick(res.locals.uid, req.body, function (err, result) {
      if (result == true) {
        res.send('ok');
      } else {
        res.status(500).send(err);
      }
    })
  } catch (err) {
    res.status(500).send(err)
  }
});

app.post('/coordination', function (req, res, next) {
  try {
    riak.insertCoordination(res.locals.uid, req.body, function (err, result) {
      if (result == true) {
        res.send('ok');
      } else {
        res.status(500).send(err);
      }
    })
  } catch (err) {
    res.status(500).send(err)
  }
});

app.listen(port, function () {
  console.log('Health app listening on port '+port+ '!')
})
