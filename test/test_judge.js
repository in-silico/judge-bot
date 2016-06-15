var judge = require('../judge.js');

var data = {
  _id: "1",
  path: "run1/source.cpp",// path to the submission
  volumen: "run1",        // path to testcases
  runs: "tmp_runs",       // default to 'data/runs'
  memory_limit: "250",    // maximum allowed memory
  time_limit: "3.5",      // maximum execution time
  compilation: "/usr/bin/g++ -o2 -static -pipe -o Main Main.cpp", // compilation line
  execution: "./Main < main.in > main.out",                       // execution time
  extension: ".cpp",      // program extension (cpp, cc, java, etc)
  checker: "789",         // path to checker
  testcases: [            // array with several test cases in this format
    {
      _id: "1",
      input: "123",
      output: "124"
    },
    {
      _id: "2",
      input: "456",
      output: "457"
    }
  ]
};

var ans = judge(data, function (verdict) {
  console.log(verdict)
});
