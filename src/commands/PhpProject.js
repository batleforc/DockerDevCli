const {Command, flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');

class PhpProjectCommand extends Command {
  async run() {
    const {flags} = this.parse(PhpProjectCommand)
    var Dev= new DevEnvDocker('/var/run/docker.sock');
    if(!flags.name) return console.log("Please add the name of the container with -n or --name")
    if(flags.Start){
      Dev.StartContainer(flags.name)
    }else if(flags.Stop){
      Dev.StopContainers(flags.name)
    }else{
      if(!flags.folder) return console.log('Please add the folder where the project lies with -f or --folder')
      Dev.StartPhp(flags.name,flags.folder,flags.port)
    }
  }
}

PhpProjectCommand.description = `Allow the user to start a Php home made container
...
The home made php container contains Composer and the Wp-Cli and is based on a PHP 7.4.11 and apache 2 image 
`

PhpProjectCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
  port :  flags.string({char:'p', description:'Port of the project, by default 80'}),
  folder: flags.string({char:'f',description:'Folder who contains the project'}),
  Start : flags.boolean({char:'u',description:'Start Portainer'}),
  Stop : flags.boolean({char:'d',description:'Stop Portainer'}),
}

module.exports = PhpProjectCommand
