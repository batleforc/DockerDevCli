const {Command, flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');

class ContainerCommand extends Command {
  async run() {
    const {flags} = this.parse(ContainerCommand)
    var Dev= new DevEnvDocker('/var/run/docker.sock');
    if(flags.name){
      Dev.Container(flags.name)
    }else{
      console.log("Please add the name of the container with -n or --name")
    }
  }
}

ContainerCommand.description = `Allow the user to interact with the container
...
Extra documentation goes here
`

ContainerCommand.flags = {
  name: flags.string({char: 'n', description: 'Name of the container'}),
}

module.exports = ContainerCommand
