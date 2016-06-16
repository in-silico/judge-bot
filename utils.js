var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

var cur_dir = __dirname + '/';

module.exports = {

  prepare_judge_data: function (data, cb) {
    var sub_id = data._id;
    var run_dir = data.runs + sub_id;
    var testcases = data.testcases;

    mkdirp(run_dir, function (err) {
      if (!err) {
        var name = path.basename(data.checker);
        var cmd = 'cp ' + data.path + ' ' + run_dir + '/Main' + data.extension +
          '; cp ' + data.checker + ' ' + run_dir + '/' + name + '.cpp';
        exec(cmd, function (error, stdout, stderr) {
          if (!error) {
            cb(run_dir);
          }
          else {
            console.log("Error: preparing data. Command " + cmd);
            console.log(error);
            process.exit(7);
          }
        });

        for (var i = 0; i < testcases.length; ++i) {
          var inp = path.basename(testcases[i].input);
          var out = path.basename(testcases[i].output);

          var input = data.volumen + '/' + inp;
          var output = data.volumen + '/' + out;
          var cmd = 'cp ' + input + ' ' + output + ' ' + run_dir;
          exec(cmd, function (error, stdout, stderr) {
            if (error) {
              console.log("Error: preparing data. Command " + cmd);
              console.log(error);
              process.exit(7);
            }
          });
        }
      }
      else {
        console.log("Error: preparing data");
        console.log(err);
        process.exit(7);
      }
    });
  },

  exist_checker: function (checker, callback) {
    var checker2 = checker + '.cpp'
    fs.stat(checker2, function (err, stats) {
      if (!err && stats.isFile()) {
        var cmd = '/usr/bin/g++ ' + checker2 + ' -o ' + checker;
        var cmp = exec(cmd, function (error, stdout, stderr) {
          if (error) {
            console.log('Error: compilation error of ' + checker2);
            console.log(stderr);
            process.exit(6);
          }
          callback();
        });
      }
      else {
        console.log('Error: file ' + checker2 + ' not found!');
        if (err) console.log(err);
        process.exit(5);
      }
    });
  },

  process_submit: function (data, files, container_id, cb) {
    var verdict = [];

    process(0);

    function process(i) {
      if (i >= files.length) {
        return cb(verdict);
      }
      else {
        var input  = path.basename(files[i].input);
        var output = path.basename(files[i].output);
        var checker = path.basename(data.checker);

        var execution = data.execution.replace('main.in', input);
        execution = execution.replace('main.out', input + '.out');

        var judge_params = data.time_limit + ' ' + data.memory_limit +
          ' ' + container_id + ' ' + input + ' ' + output + ' ' +
          checker + ' "' + execution + '"';

        var judge = exec(cur_dir + './judge.sh ' + judge_params,
                         function (error, stdout, stderr) {

                           if (error === null) {
                             var v = JSON.parse(stdout);
                             verdict.push(v);
                             process(i + 1);
                           }
                           else {
                             console.log("judge error: ", error);
                             process.exit(3);
                           }
                         });
      }
    }
  }

};
