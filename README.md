# UTPJudge-bot
==========

Judging system for UTPJudge project, this project will be connected
with [judge-backend](https://github.com/in-silico/judge-backend) 
using the [ZeroMQ Library](http://zeromq.org/)


Requirements/Dependencies
=========================

- [ZeroMQ](http://zeromq.org/)

- [Docker](https://www.docker.com/)


Installation
============

```sh
$ git clone https://github.com/in-silico/judge-bot.git
$ cd judge-bot
$ npm install 
```

Building image
===========
```sh
# build image
$ cd debian
$ docker build -t 'debian-testing'

# or download pre-build image and tagged
$ docker pull jhonber/judge-bot && docker tag -f jhonber/judge-bot debian-testing
```

Running images
==============

This is an example of how to test one docker image (debian)

```sh
cd debian
docker build -t 'judge' .
docker run -it 'judge'
```

For download a pre-built image
```sh
docker pull jhonber/judge-bot
```

If everything went ok you will see something like this

```
root@a4be6542f399:/# 
```

Try to run some commands, for example

```
g++ --version
javac -version
```

Judging
===========
## Requirements

**Checker**: is a file in C++ used to check the contestant output, here you can include the logic for special judge. This file receives three parameters, the names of files for input file, correct output and contestant output. The exit code of this file is the verdict, 0 means Accepted and other code means Wrong Answer.

Example: [checker.cpp](https://github.com/in-silico/judge-bot/blob/master/run1/checker.cpp)

## Using judge module

The judge is a module contained in ```judge.js``` file, this module receives an object with whole information needed to judging process, each field is described in the next section. The module returns other object which is the verdict for the submission.

### Example of use

```Javascript
var judge = require('../judge.js');

var data = {
  _id: "1",
  path: "run1/source",    // path to the submission
  volumen: "run1",        // path to testcases
  runs: "tmp_runs",       // default to 'data/runs'
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
```

Testing judge
=============

```
$ node test/test_judge.js
```

## Bot API.

The full API to connect to backend is defined [here](https://github.com/in-silico/judge-backend#bot-api)

The submissions must follow the below schema:

```javascript
var data = {
  _id: "string",
  path: "string",           // path to the submission
  volumen: "string",        // path to testcases
  runs: "string",           // path tof runs, default to 'data/runs'
  memory_limit: "string",   // maximum allowed memory
  time_limit: "string",     // maximum execution time
  compilation: "string",    // compilation line
  execution: "string",      // execution line
  extension: "string",      // program extension (cpp, cc, java, etc)
  checker: "string",        // path to checker
  testcases: [              // array with several test cases in this format
    {
      _id: "string"
      input: "string",
      output: "string"
    }
  ]
}
```

The verdict must follow the below schema:

```javascript
{
  "_id": "string",          // submission id
  "verdict": [              // array with several objects. 
                            // Each object corresponds to the judgment of ONE test case
    {
      "test_case":"string", // test case id
      "time":"string",      // execution time
      "memory":"string",    // used memory
      "exit_code":"string", // exit code
      "verdict":"string"    // verdict
    }
  ]
}
```

example : 
```javascript
{
  "_id": "576205a64aade5a16e832ff2",
  "verdict": [
    {
      "test_case":"a5f4f3ae5f69b3dc8e5ad138d4e376f2",
      "time":"2s",
      "memory":"0KB",
      "exit_code":"0",
      "verdict":"TIME_LIMIT_EXCEEDED"
    }
  ]
}
```

Contributing
============

Contribution to this project is welcome and it is suggested using pull requests
in github that will then be reviewed and merged or commented on. A more specific
contribution guideline is outlined [here](https://github.com/in-silico/Contribution-guide)
or [here (ZMQ contribution guide)](http://zeromq.org/docs:contributing), 
we use that guide as reference.

Please feel free to add yourself to the 
[COLLABORATORS](https://github.com/in-silico/judge-bot/blob/master/COLLABORATORS) 
file in an alphanumerically sorted way before you raise the pull request.

Documentation
=============


Licensing
=========

The project is released under the MPLv2 license.

Please see LICENSE for full details.

_______
<a href="//github.com/in-silico" target="_blank"><p align="center"><img src="https://cloud.githubusercontent.com/assets/14989202/11768037/94347c26-a18e-11e5-84ad-a8554c9fe75d.png" width=110px></img></p></a>

<p align="center">Developed by In-silico.</p>
