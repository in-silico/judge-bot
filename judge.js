var exec = require('child_process').exec;
var path = require('path');
var utils = require('./utils.js')

module.exports = function (data, cb) {
  var work_directory = '/tmp/run';
  var cur_dir = __dirname + '/';
  data.volumen = cur_dir + data.volumen;
  data.runs = cur_dir + data.runs;
  data.path = cur_dir + data.path;

  utils.prepare_judge_data(data, function (run_dir) {

    var launch_params = '-m ' + data.memory_limit + 'm -w ' + work_directory +
                        ' -v ' + run_dir + ':' + work_directory;

    var launch_container = exec(cur_dir + 'launch_container.sh ' + launch_params,
          function (error, stdout, stderr) {
            if (error === null) {
              var container_id = stdout.split('\n')[0];
              var compile_params = container_id + ' ' + data.compilation;
              var compile = exec(cur_dir + 'compile_in_container.sh ' + compile_params,
                function (error, stdout, stderr) {
                  if (error === null) {
                    var name = path.basename(data.checker);
                    var path_checker = run_dir + '/' + name;
                    utils.exist_checker(path_checker, function () {
                      var files = data.testcases;
                        utils.process_submit(data, files, container_id,
                          function (verdict) {
                            var stop_container = exec('docker kill ' +
                                               container_id + ' &> /dev/null');
                            cb(verdict);
                        });
                      });
                  }
                  else {
                    console.log("compile error: ", error);
                    console.log("stdout: ", stdout);
                    console.log("stderr: ", stderr);
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
}
