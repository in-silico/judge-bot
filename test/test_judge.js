var judge = require('../judge.js');

var data = {
  _id: "1",
  path: "run1/source",    // path to the submission
  volumen: "run1",        // path to testcases
  runs: "tmp_runs",       // path to runs, default to 'data/runs'
  memory_limit: "250",    // maximum allowed memory
  time_limit: "3.5",      // maximum execution time
  compilation: "/usr/bin/g++ -o2 -static -pipe -o Main Main.cpp", // compilation line
  execution: "./Main < main.in > main.out",                       // execution line
  extension: ".cpp",      // program extension (cpp, cc, java, etc)
  checker: "run1/789",    // path to checker
  testcases: [            // array with several test cases in this format
    {
      _id: "1",
      input: "run1/123",
      output: "run1/124"
    },
    {
      _id: "2",
      input: "run1/456",
      output: "run1/457"
    }
  ]
};

var ans = judge(data, function (verdict) {
  console.log(verdict)
});
