var f_admin = require('firebase-admin');
var express = require('express');
var riak = require('./riak')
const app = express();
const port = 8080;
var serviceAccount = require("FirebasePrivateKey.json");

f_admin.initializeApp({
  credential: f_admin.credential.cert(serviceAccount),
  databaseURL: "https://healthapp-9f4a5.firebaseio.com"
});

// app.post('*',function (req,res,next) {
//   var idToken = req.get('Authorization');
//   f_admin.auth().verifyIdToken(idToken)
//   .then(function(decodedToken) {
//     res.locals.uid = decodedToken.uid;
//     next();
//   }).catch(function(error) {
//     res.status(401).send({errorCode:401,errorMessage:'Cannot verifyToken'})
//   });
// });
app.post('*',function (req,res,next) {
  res.locals.uid = "123";
  next();
});
missclickTestData = [
  [1, 4.5, false],
  [2, 4.6, false]]
coordinatorTestData = [
  [1, 1.1, 1.1, 1.3, 1.1, 1.1, 1.2],
  [2, 2.1, 2.1, 2.3, 2.1, 2.1, 2.2],
  [3, 3.1, 3.1, 3.3, 3.1, 3.1, 3.2],
  [4, 4.1, 4.1, 4.3, 4.1, 4.1, 4.2]]
textTestData = [
  [1, 's', 100],
  [2, 'ss', 200],
  [3, 'sss', 300]]

app.post('/missclick', function (req, res, next) {
  riak.insertMissClick(res.locals.uid, missclickTestData, function (err, result) {
    if (result == true) {
      res.send('ok');
    } else {
      res.status(500).send(err);
    }
  })
});

app.post('/coordination', function (req, res, next) {
  riak.insertCoordination(res.locals.uid, coordinatorTestData, function (err, result) {
    if (result == true) {
      res.send('ok');
    } else {
      res.status(500).send(err);
    }
  })
});


app.post('/text', function (req, res, next) {
  riak.insertTextWatcher(res.locals.uid, textTestData, function (err, result) {
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



