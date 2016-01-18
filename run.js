var exec = require('child_process').exec;
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
                var judge_params = data.time_limit + ' ' + data.memory_limit +
                                   ' ' + container_id + ' "' + data.execution + '"';

                var judge = exec('./judge.sh ' + judge_params,
                  function(error, stdout, stderr) {

                    if (error === null) {
                      console.log(stdout);
                    }
                    else {
                      console.log("judge error: ", error);
                      process.exit(3);
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
