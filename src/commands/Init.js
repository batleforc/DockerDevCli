const {Command, flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');



class HelloCommand extends Command {
  async run() {
    const {flags} = this.parse(HelloCommand)
    var Dev= new DevEnvDocker('/var/run/docker.sock');
    if(flags.Start)
      await Dev.StartContainer(Dev.Traefikname);
    else if (flags.Stop)
      await Dev.StopContainers(Dev.Traefikname);
    else if (flags.Remove)
      await Dev.RemoveTraefik()
    else
      await Dev.StartTraefik();
    await Dev.LinkDns();
    
  }
}

HelloCommand.description = `Start the DockerEnv (Start Traefik + insert nameserver to your /etc/hosts)
...
The init command add an entry to your hosts file and start a Reverse proxy who automaticaly update direct {ContainerName}.localhost to the choosen container
`

HelloCommand.flags = {
  Start : flags.boolean({char:'u',description:'Start Portainer'}),
  Stop : flags.boolean({char:'d',description:'Stop Portainer'}),
  Remove: flags.boolean({char:'R',description:'Remove Container'}),
}

module.exports = HelloCommand
