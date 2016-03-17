var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

module.exports = {

  prepare_judge_data: function(data, cb) {
    var sub_id = path.basename(data.path);
    var run_dir = data.runs + '/' + sub_id;

    mkdirp(run_dir, function(err) {
      if (!err) {
        var cm = 'cp ' + data.volumen + '/* ' + run_dir;
        exec(cm, function(error, stdout, stderr) {
          if (!error) {
            var cm2 = 'cp ' + data.path + ' ' + run_dir + '/Main.' + data.extension;
            exec(cm2, function(error, stdout, stderr) {
              if (!error) {
                cb(run_dir);
              }
              else {
                console.log("Error: preparing data. Command " + cm2);
                console.log(error);
                process.exit(7);
              }
            });
          }
          else {
            console.log("Error: preparing data. Command " + cm);
            console.log(error);
            process.exit(7);
          }
        });
      }
      else {
        console.log("Error: preparing data");
        console.log(err);
        process.exit(7);
      }
    });
  },

  exist_checker: function (checker, callback) {
    var f = checker.split('.');
    var name = f[0];

    fs.stat(checker, function(err, stats) {
      if (!err && stats.isFile()) {

        fs.stat(name, function(err, stats) {
          if (!err && stats.isFile()) {
            callback();
          }
          else {
            var cmd = '/usr/bin/g++ ' + checker + ' -o ' + name;
            var cmp = exec(cmd, function(error, stdout, stderr) {
              if (error) {
                console.log('Error: compilation error of ' + checker);
                console.log(stderr);
                process.exit(6);
              }
              callback();
            });
          }
        });

      }
      else {
        console.log('Error: file ' + checker + ' not found!');
        if (err) console.log(err);
        process.exit(5);
      }
    });
  },

  get_files: function(path, cb) {
    fs.readdir(path, function(err, files) {
      if (err) {
        console.log('error: ', err);
        process.exit(4);
      }
      cb(files);
    });
  },

  process_submit: function(data, files, container_id, cb) {
    var verdict = [];

    process(0);

    function process(i) {
      if (i >= files.length) {
        return cb(verdict);
      }
      else {
        if (files[i] && typeof files[i].split == 'function') {
          var f = files[i].split('.');
          if (f[1] === 'in') {
            var execution = data.execution.replace('main.in', files[i]);
            execution = execution.replace('main.out', f[0] + '.other');

            var judge_params = data.time_limit + ' ' + data.memory_limit + ' ' +
              container_id + ' ' + f[0] + ' ' + data.checker.split('.')[0] +
              ' "' + execution + '"';

            var judge = exec('../judge.sh ' + judge_params,
                             function(error, stdout, stderr) {

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
          else {
            process(i + 1);
          }
        }
        else {
          process(i + 1);
        }
      }
    }
  }

};
