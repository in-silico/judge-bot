var exec = require('child_process').exec;
var path = require('path');
var utils = require('./utils.js')

var output = { _id: '',
              verdict:
               [ { test_case: '',
                   time: '0s',
                   memory: '0KB',
                   exit_code: -1,
                   verdict: 'COMPILATION_ERROR'
               } ]
             };

module.exports = function (data, cb) {
  var work_directory = '/tmp/run';
  var cur_dir = __dirname + '/';
  data.volumen = cur_dir + data.volumen;
  data.runs = cur_dir + data.runs;
  data.path = cur_dir + data.path;

  output._id = data._id;

  utils.prepare_judge_data(data, function (err, run_dir) {
    if (err) {
      output.verdict[0].exit_code = run_dir;
      cb(output);
    }
    else {
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
                      utils.exist_checker(path_checker, function (err, code) {
                        if (err) {
                          output.verdict[0].exit_code = code;
                          cb(output);
                        }
                        else {
                          var files = data.testcases;
                          utils.process_submit(data, files, container_id,
                            function (err, verdict) {
                              var stop_container = exec('docker kill ' +
                                                 container_id + ' &> /dev/null');
                              if (!err) {
                                cb({_id: data._id, verdict: verdict});
                              }
                              else {
                                output.verdict[0].exit_code = verdict;
                                cb(output);
                              }
                          });
                        }
                      });
                    }
                    else {
                      output.verdict[0].exit_code = 7;
                      cb(output);
                    }
                  });
              }
              else {
                output.verdict[0].exit_code = 8;
                cb(output);
              }
            });
    }
  });
}
