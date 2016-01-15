# judge-bot
==========

Judging system for UTPJudge project, this project will be connected
with [judge-backend](https://github.com/in-silico/judge-backend) 
using the [ZeroMQ Library](http://zeromq.org/)


Requirements/Dependencies
=========================

- [ZeroMQ](http://zeromq.org/)


Discussion in progress 
- [Docker](https://www.docker.com/)


Installation
============

```sh
$ addyour_command_here 
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

Running judge
===========
```sh
# build image
docker build -t 'debian-testing'

# or download pre-build image and tagged
docker pull jhonber/debian && docker tag -f jhonber/debian debian-testing

./judge.sh

```
Output example in JSON format
```console
{
  "time" : "3.19s",
  "memory" : "255104KB",
  "exit_code" : "0",
  "verdict" : "MEMORY_LIMIT_EXCEEDED"
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

Developed by In-silico.
