const {Command, flags} = require('@oclif/command')
var DevEnvDocker = require('../lib/ModuleInterface');

class GlabrunnerCommand extends Command {
  async run() {
    const {flags} = this.parse(GlabrunnerCommand)
    const folder = [].push(flags.Folder||"")
    var Dev= new DevEnvDocker('/var/run/docker.sock');
    if(flags.Start)
      await Dev.StartContainer(Dev.PortainerName);
    else if (flags.Stop)
      await Dev.StopContainers(Dev.PortainerName);
    else
      await Dev.CreateAndStart("gitlab/gitlab-runner",flags.ContainerName,{},{},folder)
  }
}

GlabrunnerCommand.description = `Describe the command here
...
Extra documentation goes here
`

GlabrunnerCommand.flags = {
  ContainerName: flags.string({char:'c',description:'name of the GitlabRunner'}),
  Folder:flags.string({char:'f',description:'Folder to bind (Please remember to pass the fullpath)'}),
  Start : flags.boolean({char:'u',description:'Start glabrunner'}),
  Stop : flags.boolean({char:'d',description:'Stop glabrunner'}),
  Conf: flags.boolean({char:'o',description:"Configuration"})
}

module.exports = GlabrunnerCommand