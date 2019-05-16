var MongoClient = require('mongodb').MongoClient;
let address = process.env.DB_ADDRESS
const client = new MongoClient(address, { useNewUrlParser: true });
const CHUNK_SIZE = process.env.DB_CHUNK
var db = null
var missclickCollectionName = "missclick"
var orientationCollectionName = "orientation"

client.connect(function (err, client) {
  if (err != null) {
    throw err
  }
  db = client.db("HealthAppDatabase")
  db.collection(missclickCollectionName).createIndex({ day: 1, user_id: "text" })
  db.collection(orientationCollectionName).createIndex({ day: 1, user_id: "text" })
})

async function insertMissClick(uid, missclickData, callback) {
  if (db == null) {
    callback(Error("Db is not connected"), false)
  } else {
    await insert(missclickCollectionName, toMap(missclickData), uid);
    callback(null, true)
  }
};

async function insertCoordination(uid, coordinationData, callback) {
  if (db == null) {
    callback(Error("Db is not connected"), false)
  } else {
    await insert(orientationCollectionName, toMap(coordinationData), uid);
    callback(null, true)
  }
};

async function insert(collection, array, uid) {
  array.forEach(async function (value) {
    let day = value.day
    delete value.day
    await db.collection(collection).updateOne(
      { user_id: uid, values_count: { $lt: CHUNK_SIZE }, day: day },
      {
        $push: { values: { $each: value.items } },
        $min: { first: value.minTime },
        $max: { last: value.maxTime },
        $inc: { values_count: value.items.length }
      },
      { upsert: true })
  });
};


function toMap(data) {
  var array = []
  var map = new Map()
  data.forEach(arrayItem => {
    delete arrayItem.id
    let key = getZeroDate(arrayItem.timestamp)
    console.log(arrayItem.timestamp)
    console.log(key)
    var value = map.get(key)
    if (value == undefined) {
      value = { minTime: arrayItem.timestamp, maxTime: arrayItem.timestamp, items: new Array(), day: key }
      map.set(key, value)
    }
    value.items.push(arrayItem)
    value.minTime = Math.min(value.minTime, arrayItem.timestamp)
    value.maxTime = Math.max(value.maxTime, arrayItem.timestamp)
    if (value.items.length >= CHUNK_SIZE) {
      array.push(value)
      map.delete(key)
    }
  })
  array.concat(map.values)
  return array;
}


function getZeroDate(timestamp) {
  return new Date(timestamp).setHours(0, 0, 0, 0)
}



module.exports = {
  insertMissClick: insertMissClick,
  insertCoordination: insertCoordination
};