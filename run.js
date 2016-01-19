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
                fs.readdir(data.volumen, function(err, files) {
                  if (err) {
                    console.log('error: ', err);
                    process.exit(4);
                  }

                  process_submit(0);

                  function is_numeric(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                  }

                  function process_submit(i) {
                    if (i >= files.length) return 0;
                    else {
                      if (files[i] && typeof files[i].split == 'function') {
                        var f = files[i].split('.');
                        if (f[0] === 'in' && is_numeric(f[1])) {
                          var execution = data.execution.replace('main.in', files[i]);
                          execution = execution.replace('main.out', 'other.' + f[1]);

                          var judge_params = data.time_limit + ' ' + data.memory_limit + ' ' +
                                            container_id + ' ' + f[1] + ' "' + execution + '"';

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
