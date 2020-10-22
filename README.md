dockerdevcli
============

CLI for Docker dev env

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/dockerdevcli.svg)](https://npmjs.org/package/dockerdevcli)
[![Downloads/week](https://img.shields.io/npm/dw/dockerdevcli.svg)](https://npmjs.org/package/dockerdevcli)
[![License](https://img.shields.io/npm/l/dockerdevcli.svg)](https://github.com/batleforc/dockerdevcli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @nexiconseils/dockerdevcli
$ dockerdevcli COMMAND
running command...
$ dockerdevcli (-v|--version|version)
@nexiconseils/dockerdevcli/0.0.7 linux-x64 node-v10.19.0
$ dockerdevcli --help [COMMAND]
USAGE
  $ dockerdevcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dockerdevcli Container`](#dockerdevcli-container)
* [`dockerdevcli Init`](#dockerdevcli-init)
* [`dockerdevcli PhpProject`](#dockerdevcli-phpproject)
* [`dockerdevcli Portainer`](#dockerdevcli-portainer)
* [`dockerdevcli createandstart`](#dockerdevcli-createandstart)
* [`dockerdevcli glabrunner`](#dockerdevcli-glabrunner)
* [`dockerdevcli help [COMMAND]`](#dockerdevcli-help-command)

## `dockerdevcli Container`

Allow the user to interact with the container

```
USAGE
  $ dockerdevcli Container

OPTIONS
  -n, --name=name  Name of the container

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/Container.js](https://github.com/batleforc/dockerdevcli/blob/v0.0.7/src/commands/Container.js)_

## `dockerdevcli Init`

Start the DockerEnv (Start Traefik + insert nameserver to your /etc/hosts)

```
USAGE
  $ dockerdevcli Init

OPTIONS
  -d, --Stop   Stop Portainer
  -u, --Start  Start Portainer

DESCRIPTION
  ...
```

_See code: [src/commands/Init.js](https://github.com/batleforc/dockerdevcli/blob/v0.0.7/src/commands/Init.js)_

## `dockerdevcli PhpProject`

Allow the user to start a Php home made container

```
USAGE
  $ dockerdevcli PhpProject

OPTIONS
  -d, --Stop           Stop Portainer
  -f, --folder=folder  Folder who contains the project
  -n, --name=name      name to print
  -p, --port=port      Port of the project, by default 80
  -u, --Start          Start Portainer

DESCRIPTION
  ...
  The home made php container contains Composer and the Wp-Cli and is based on a PHP 7.4.11 and apache 2 image
```

_See code: [src/commands/PhpProject.js](https://github.com/batleforc/dockerdevcli/blob/v0.0.7/src/commands/PhpProject.js)_

## `dockerdevcli Portainer`

Start Portainer container

```
USAGE
  $ dockerdevcli Portainer

OPTIONS
  -d, --Stop   Stop Portainer
  -u, --Start  Start Portainer

DESCRIPTION
  ...
```

_See code: [src/commands/Portainer.js](https://github.com/batleforc/dockerdevcli/blob/v0.0.7/src/commands/Portainer.js)_

## `dockerdevcli createandstart`

Create a container with the image you have choosed 

```
USAGE
  $ dockerdevcli createandstart

OPTIONS
  -c, --ContainerName=ContainerName  name of the container
  -f, --Folder=Folder                Folder to bind (Please remember to pass the fullpath)
  -i, --ImageName=ImageName          name of the image
  -p, --Port=Port                    Exposed port

DESCRIPTION
  ...
  Create a container with the choosen image,name, port and working folder (Remember to pass the fullpath to the folder)
```

_See code: [src/commands/createandstart.js](https://github.com/batleforc/dockerdevcli/blob/v0.0.7/src/commands/createandstart.js)_

## `dockerdevcli glabrunner`

Describe the command here

```
USAGE
  $ dockerdevcli glabrunner

OPTIONS
  -c, --ContainerName=ContainerName  name of the GitlabRunner
  -d, --Stop                         Stop glabrunner
  -f, --Folder=Folder                Folder to bind (Please remember to pass the fullpath)
  -o, --Conf                         Configuration
  -u, --Start                        Start glabrunner

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/glabrunner.js](https://github.com/batleforc/dockerdevcli/blob/v0.0.7/src/commands/glabrunner.js)_

## `dockerdevcli help [COMMAND]`

display help for dockerdevcli

```
USAGE
  $ dockerdevcli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->
