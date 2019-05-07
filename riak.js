var riak = require('basho-riak-client');
let address = process.env.RIAK_ADDRESS.replace(new RegExp('\'', 'g'), '')
var isConnecting = false
var client;
var reconnectAttepts = process.env.RIAK_RECONECT_ATTEMPTS;
if(isNaN(reconnectAttepts)){
  reconnectAttepts = 4
}
initiateClient()

console.log('Reconnecting atempts number = '+reconnectAttepts);

function insertMissClick(uid, missclickData, callback) {
  insert('MissClick', missclickData, uid, callback);
};

function insertCoordination(uid, coordinationData, callback) {
  insert('Coordination', coordinationData, uid, callback);
};

function insertTextWatcher(uid, textData, callback) {
  insert('TextWatcher', textData, uid, callback);
};

function insert(tableName, data, uid, callback) {
  let cmd = createInsertCommand(tableName, mapData(uid, data), callback);
  client.execute(cmd);
}

var createInsertCommand = function (tableName, data, callback) {
  return new riak.Commands.TS.Store.Builder()
    .withTable(tableName)
    .withRows(data)
    .withCallback(callback)
    .build();
}

var mapData = function (uid, data) {
  let result = data.map(function (entity) {
    let array = Object.values(entity);
    array.unshift(uid);
    return array;
  });
  return result;
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
  insertCoordination: insertCoordination,
  insertTextWatcher: insertTextWatcher
};