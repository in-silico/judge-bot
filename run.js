var exec = require('child_process').exec;
var fs = require('fs');
var data = require('./data.json');

var launch_params = '-m ' + data.memory_limit + 'm -w ' + data.work_directory + ' -v ' +
                     data.volumen + ':' + data.work_directory;

var container_id;

var launch_container = exec('./launch_container.sh ' + launch_params,
      function(error, stdout, stderr) {
        if (error === null) {
          container_id = stdout.split('\n')[0];
          var compile_params = container_id +' ' + data.compilation;
          var compile = exec('./compile_in_container.sh ' + compile_params,
            function(error, stdout, stderr) {

              if (error === null) {

                function check(checker, callback) {

                  fs.stat(checker + '.cpp', function(err, stats) {
                    if (!err && stats.isFile()) {

                        fs.stat(checker, function(err, stats) {
                          if (!err && stats.isFile()) {
                            callback();
                          }
                          else {
                            var cmd = '/usr/bin/g++ ' + checker + '.cpp -o ' + checker;
                            var cmp = exec(cmd, function(error, stdout, stderr) {
                              if (error) {
                                console.log('Error: compilation error of ' + checker + '.cpp');
                                console.log(stderr);
                                process.exit(6);
                              }
                              callback();
                            });
                          }
                      });

                    }
                    else {
                      console.log('Error: file ' + checker + '.cpp not found!');
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

                    function process_submit(i) {
                      if (i >= files.length) return 0;
                      else {
                        if (files[i] && typeof files[i].split == 'function') {
                          var f = files[i].split('.');
                          if (f[1] === 'in') {
                            var execution = data.execution.replace('main.in', files[i]);
                            execution = execution.replace('main.out', f[0] + '.other');

                            var judge_params = data.time_limit + ' ' + data.memory_limit + ' ' +
                              container_id + ' ' + f[0] + ' ' + data.checker +
                              ' "' + execution + '"';

                            var judge = exec('./judge.sh ' + judge_params,
                                             function(error, stdout, stderr) {

                                               if (error === null) {
                                                 console.log(stdout);
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

process.on('exit', function(code) {
  var stop_container = exec('docker kill ' + container_id + ' &> /dev/null');
});
