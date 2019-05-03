var riak = require('basho-riak-client');

var client = new riak.Client(['127.0.0.1:8087']);


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
  return data.map(function (entity) {
    entity.unshift(uid);
    return entity;
  });
}

module.exports = {
  insertMissClick: insertMissClick,
  insertCoordination: insertCoordination,
  insertTextWatcher: insertTextWatcher
};