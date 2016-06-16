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
          '&& cp ' + data.checker + ' ' + run_dir + '/' + name + '.cpp';
        exec(cmd, function (error, stdout, stderr) {
          if (!error) {
            process(0);

            function process (i) {
              if (i >= testcases.length) {
                return cb(null, run_dir);
              }
              else {
                var input = testcases[i].input;
                var output = testcases[i].output;
                var cmd = 'cp ' + input + ' ' + output + ' ' + run_dir;
                exec(cmd, function (error, stdout, stderr) {
                  if (error) {
                    return cb(true, 1);
                  }
                  else {
                    process(i + 1);
                  }
                });
              }
            }

          }
          else {
            cb(true, 2);
          }
        });
      }
      else {
        cb(true, 3);
      }
    });
  },

  exist_checker: function (checker, cb) {
    var checker2 = checker + '.cpp'
    fs.stat(checker2, function (err, stats) {
      if (!err && stats.isFile()) {
        var cmd = '/usr/bin/g++ ' + checker2 + ' -o ' + checker;
        var cmp = exec(cmd, function (error, stdout, stderr) {
          if (error) {
            cb(true, 4);
          }
          else {
            cb(null);
          }
        });
      }
      else {
        cb(true, 5);
      }
    });
  },

  process_submit: function (data, files, container_id, cb) {
    var verdict = [];

    process(0);

    function process (i) {
      if (i >= files.length) {
        return cb(null, verdict);
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
                             cb(true, 6);
                           }
                         });
      }
    }
  }

};
