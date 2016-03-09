var fs = require('fs');
var net = require('net');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var uuid = require('node-uuid');

module.exports = JClient;

var self;
function JClient(opts) {
  if (!(this instanceof JClient)) return new JClient(opts);
  if (!opts) opts = {}
  this._recTime = opts.recTime || 3;
  this._dir = opts.dir || '../';
  this._id = uuid.v4();
  this._readyFiles = new EventEmitter();
  this._curDownload = {};

  self = this;
}

JClient.prototype.start = function(cb) {
  self.client = net.connect(this.port || 7777, function () {
    if (cb)
      cb(self.client);
    var msg = ['ready'];
    self.client.write(JSON.stringify(msg));
  });

  self.client.on('data', self.handleData);

  self.client.on('close', function() {
    console.log('retrying in %j second(s)', self._recTime);
    setTimeout(self.start, self._recTime * 1000, cb);
  });

  self.client.on('error', function(err) {
    console.log('connection error', err);
  })
}

JClient.prototype.getFile = function(file, next) {
  var msg = ['file', file, self._id];
  console.log('file', msg);
  var tmp = path.join(self._dir, file + self._id);

  function success() {
    self.client.write(JSON.stringify(msg) + '\0');
    self._curDownload[file] = fs.createWriteStream(tmp);
    self._readyFiles.once(file, function() {
      fs.rename(tmp, path.join(self._dir, file), next);
    });
  }

  fs.stat(path.dirname(tmp), function(err, fstat) {
    if (err) {
      fs.mkdir(path.dirname(tmp), success)
    } else {
      success();
    }
  });

}

JClient.prototype.getFiles = function(files, id, data, cb) {
  if (files.length == id) {
    if (cb)
      return cb(data);
    return;
  }

  fs.stat(path.join(self._dir, files[id]), function(err, fstat) {
    if (err)
      self.getFile(files[id], function() {
        return self.getFiles(files, id + 1, data, cb);
      })
    else
      return self.getFiles(files, id + 1, data, cb);
  })

}

JClient.prototype.handleData = function(data) {
  var msg = data.toString().split('\0');
  for (var i = 0; i < msg.length; ++i) {
    if (msg[i].length === 0) continue;
    var cur  = JSON.parse(msg[i]);
    var op = cur[0];
    if (op === 'submission') {
      var info = cur[1];
      var files = [info.path];
      for (var i = 0; i < info.testcases.length; ++i) {
        files.push(info.testcases[i].in);
        files.push(info.testcases[i].out);
      }
      self.getFiles(files, 0, info, self.judge)
    } else if (op === 'file') {
      console.log('getchunk');
      var buff = new Buffer(cur[2].data);
      self._curDownload[cur[1]].write(buff);
    } else if (op === 'endfile') {
      console.log('endfile', cur[1]);
      self._readyFiles.emit(cur[1]);
      self._curDownload[cur[1]].end();
      delete  self._curDownload[cur[1]];
    }

  }
}

JClient.prototype.judge = function(data) {
  console.log('judging', data);
  var ans = ['judgement', {_id: data._id, verdict: 'accepted'}];
  self.client.write(JSON.stringify(ans))
}
