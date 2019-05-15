var riak = require('basho-riak-client');
let address = process.env.RIAK_ADDRESS.replace(new RegExp('\'', 'g'), '')
var isConnecting = false
var client;
var reconnectAttepts = process.env.RIAK_RECONECT_ATTEMPTS;
if (isNaN(reconnectAttepts)) {
  reconnectAttepts = 4
}
initiateClient()

console.log('Reconnecting atempts number = ' + reconnectAttepts);

function insertMissClick(uid, missclickData, callback) {
  insert('MissClick', mapMissClick(missclickData, uid), callback);
};

function insertCoordination(uid, coordinationData, callback) {
  insert('Coordination', mapCoordination(coordinationData, uid), callback);
};


function insert(tableName, mappedData, callback) {
  let cmd = createInsertCommand(tableName, mappedData, callback);
  client.execute(cmd);
}

var createInsertCommand = function (tableName, data, callback) {
  return new riak.Commands.TS.Store.Builder()
    .withTable(tableName)
    .withRows(data)
    .withCallback(callback)
    .build();
}

var mapMissClick = function (data, uid) {
  result = data.map(function (item) {
    return Array(uid, item.timestamp, map(item.distance), item.isMissClick)
  })
  return result;
}

var mapCoordination = function (data, uid) {
  var result = data.map(function (item) {
    return Array("123",
      item.timestamp,
      map(item.pitch),
      map(item.azimut),
      map(item.roll),
      map(item.latitude),
      map(item.longitude),
      map(item.altitude),
      map(item.speed))
  })
  return result;
}

function map(v){
  if(v == null){
    return v;
  }else{
    return v + 0.0000001
  }
}


function initiateClient() {
  if (!isConnecting) {
    console.log('Try connect to Riak')
    isConnecting = true
    client = new riak.Client([address], function (err, cl, cluster) {
      isConnecting = false;
      if (err) {
        reconnectAttepts--
        if (reconnectAttepts == 0) {
          throw new Error('Exit because can not connect to riak after');
        } else {
          setTimeout(initiateClient, 3000);
        }
      }
    });
  }
}

module.exports = {
  insertMissClick: insertMissClick,
  insertCoordination: insertCoordination
};