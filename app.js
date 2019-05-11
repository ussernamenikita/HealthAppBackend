var f_admin = require('firebase-admin');
var express = require('express');
var riak = require('./riak')
const app = express();
const port = 8080;
var serviceAccount = require("./secrets/FirebasePrivateKey.json");

f_admin.initializeApp({
  credential: f_admin.credential.cert(serviceAccount),
  databaseURL: "https://healthapp-9f4a5.firebaseio.com"
});

app.post('*', function (req, res, next) {
  var idToken = req.get('Authorization');
  f_admin.auth().verifyIdToken(idToken)
    .then(function (decodedToken) {
      res.locals.uid = decodedToken.uid;
      next();
    }).catch(function (error) {
      res.status(401).send({ errorCode: 401, errorMessage: 'Cannot verifyToken' })
    });
});

// app.post('*',function (req,res,next) {
//   res.locals.uid = "123";
//   next();
// })

app.use(express.json());



app.post('/missclick', function (req, res, next) {
  riak.insertMissClick(res.locals.uid, req.body, function (err, result) {
    if (result == true) {
      res.send('ok');
    } else {
      res.status(500).send(err);
    }
  })
});

app.post('/coordination', function (req, res, next) {
  riak.insertCoordination(res.locals.uid, req.body, function (err, result) {
    if (result == true) {
      res.send('ok');
    } else {
      res.status(500).send(err);
    }
  })
});

app.listen(port, function () {
  console.log('Health app listening on port 8080!')
})



