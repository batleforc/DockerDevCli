const {Command, flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');

class GlabrunnerCommand extends Command {
  async run() {
    const {flags} = this.parse(GlabrunnerCommand)
    const folder = [].push(flags.Folder||"")
    var Dev= new DevEnvDocker('/var/run/docker.sock');
    if(flags.Start)
      await Dev.StartContainer(flags.ContainerName);
    else if (flags.Stop)
      await Dev.StopContainers(flags.ContainerName);
    else if (flags.Remove)
      await Dev.RemoveContainer(flags.ContainerName)
    else if(flags.Conf)
      Dev.InteractiveCommand(flags.ContainerName,'register')
    else
      await Dev.CreateAndStart("gitlab/gitlab-runner",flags.ContainerName,{},{},folder)
  }
}

GlabrunnerCommand.description = `Command in developement
...
Extra documentation goes here
`

GlabrunnerCommand.flags = {
  ContainerName: flags.string({char:'c',description:'name of the GitlabRunner'}),
  Folder:flags.string({char:'f',description:'Folder to bind (Please remember to pass the fullpath)'}),
  Start : flags.boolean({char:'u',description:'Start glabrunner'}),
  Stop : flags.boolean({char:'d',description:'Stop glabrunner'}),
  Remove: flags.boolean({char:'R',description:'Remove Container'}),
  Conf: flags.boolean({char:'o',description:"Configuration"})
}

module.exports = GlabrunnerCommand