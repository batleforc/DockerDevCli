const {Command, flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');

class CreateandstartCommand extends Command {
  async run() {
    const {flags} = this.parse(CreateandstartCommand)
    if(flags["ContainerName"]==null ||flags["ImageName"]==null)
      console.log("No ContainerName or ImageName indicated")
    const folder = flags.Folder?[].push(flags.Folder):null
    var Port= {}, ExposedPort = {}
    if(flags.Port){
      Port ={
        [flags.Port+"/tcp"]:[{
            HostPort:flags.Port
        }]
      };
      ExposedPort = {[flags.Port+"/tcp"]:{}};
    }
  var Dev= new DevEnvDocker('/var/run/docker.sock');
    Dev.CreateAndStart(flags.ImageName,flags.ContainerName,ExposedPort,Port,folder)
  }
}

CreateandstartCommand.description = `Create a container with the image you have choosed 
...
Create a container with the choosen image,name, port and working folder (Remember to pass the fullpath to the folder)
`

CreateandstartCommand.flags = {
  ImageName: flags.string({char: 'i', description: 'name of the image'}),
  ContainerName: flags.string({char:'c',description:'name of the container'}),
  Port: flags.integer({char:'p',description:'Exposed port'}),
  Folder:flags.string({char:'f',description:'Folder to bind (Please remember to pass the fullpath)'})
}

module.exports = CreateandstartCommand
