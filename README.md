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
$ addyour_command_here 
```

Running judge
===========
```sh
# build image
docker build -t 'debian-testing'

# or download pre-build image and tagged
docker pull jhonber/debian && docker tag -f jhonber/debian debian-testing
```

**data.json** configuration: change **\<absolute path\>**

```javascript
{
  "memory_limit": "250",
  "time_limit": "3.5",
  "compilation": "/usr/bin/g++ -o2 -static -pipe -o source source.cpp",
  "execution": "./source < main.in > main.out",
  "work_directory": "/tmp/run",
  "volumen": "/<absolute path>/judge-bot/run1"
}

```

**Test cases**: each test case needs files **\*.in** and **\*.out** respectively input file and expected output file, where **x** is the test case number.


```sh
node run.js
```

Output example in JSON format
```console
{
 "test_case" : "3",
 "time" : "0.26s",
 "memory" : "132536KB",
 "exit_code" : "0",
 "verdict" : "OK"
}
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
docker pull jhonber/debian
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
