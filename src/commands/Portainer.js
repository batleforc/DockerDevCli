const {Command,flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');

class PortainerCommand extends Command {
  async run() {
    const {flags} = this.parse(PortainerCommand)
    var Dev= new DevEnvDocker('/var/run/docker.sock');
    if(flags.Start)
      await Dev.StartContainer(Dev.PortainerName);
    else if (flags.Stop)
      await Dev.StopContainers(Dev.PortainerName);
    else if (flags.Remove)
      await Dev.RemovePortainer()
    else
      await Dev.StartPortainer();
  }
}

PortainerCommand.description = `Start Portainer container /!\ User sudo
...
Portainer is a tool that allow the user to control the docker env 
`

PortainerCommand.flags ={
  Start : flags.boolean({char:'u',description:'Start Portainer'}),
  Stop : flags.boolean({char:'d',description:'Stop Portainer'}),
  Remove: flags.boolean({char:'R',description:'Remove Container'})
}


module.exports = PortainerCommand
