const {Command, flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');

class GulpCommand extends Command {
  async run() {
    const {flags} = this.parse(GulpCommand)
    var folder = flags.Folder || "./"
    var Dev= new DevEnvDocker('/var/run/docker.sock');
    var tag =flags.Old?'7.10.1':'latest'
    if(!flags.Folder) console.log('No folder arg use current folder')
    if(flags.Shell){
      Dev.GulpShell(tag,folder)
    }else if(flags.Command){
      Dev.GulpCommand(tag,folder,flags.Command)
    }else{
      console.log("Please add a Command with -c or a Shell with -S")
    }
  }
}

GulpCommand.description = `Allow the user to launch gulp command
...
This command start a one time use docker and erase it after use, this container allow you to have access to all nodejs command
`

GulpCommand.flags = {
  Folder: flags.string({char: 'f', description: 'Folder in which the cli execute the command'}),
  Command: flags.string({char:'c',description:'Gulp command to execute'}),
  Old:flags.boolean({char:'O',description:'If the command has to be executed with the old gulp'}),
  Shell: flags.boolean({char:'s',description:'Start an interactive shell'})
}

module.exports = GulpCommand
