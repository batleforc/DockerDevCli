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
    else
      await Dev.StartPortainer();
  }
}

PortainerCommand.description = `Start Portainer container
...

`

PortainerCommand.flags ={
  Start : flags.boolean({char:'u',description:'Start Portainer'}),
  Stop : flags.boolean({char:'d',description:'Stop Portainer'}),
}


module.exports = PortainerCommand
