var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var work_directory = '/tmp/run';


var container_id;

module.exports = function(data, cb) {
  var cur_dir = path.dirname(process.cwd()) + '/';
  data.volumen = cur_dir + data.volumen;
  data.runs = cur_dir + data.runs;
  data.path = cur_dir + data.path;
  data.checker = path.basename(data.checker);

  function prepare_data(data, cb) {
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
  }

  prepare_data(data, function(run_dir) {

    var launch_params = '-m ' + data.memory_limit + 'm -w ' + work_directory + ' -v ' +
                       run_dir + ':' + work_directory;

    var launch_container = exec('../launch_container.sh ' + launch_params,
          function(error, stdout, stderr) {
            if (error === null) {
              container_id = stdout.split('\n')[0];
              var compile_params = container_id +' ' + data.compilation;
              var compile = exec('../compile_in_container.sh ' + compile_params,
                function(error, stdout, stderr) {

                  if (error === null) {

                    function check(checker, callback) {
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
                    }

                    var path_checker = data.volumen + '/' + data.checker;
                    check(path_checker, function() {
                      fs.readdir(data.volumen, function(err, files) {
                        if (err) {
                          console.log('error: ', err);
                          process.exit(4);
                        }

                        process_submit(0);
                        var verdict = [];

                        function process_submit(i) {
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
                                                     process_submit(i + 1);
                                                   }
                                                   else {
                                                     console.log("judge error: ", error);
                                                     process.exit(3);
                                                   }
                                                 });
                              }
                              else {
                                process_submit(i + 1);
                              }
                            }
                            else {
                              process_submit(i + 1);
                            }
                          }
                        }
                      });
                    });
                  }
                  else {
                    console.log("compile error: ", error);
                    process.exit(2);
                  }
                });
            }
            else {
              console.log("launch container error: ", error);
              process.exit(1);
            }
          });
  });

  process.on('exit', function(code) {
    var stop_container = exec('docker kill ' + container_id + ' &> /dev/null');
  });

}
