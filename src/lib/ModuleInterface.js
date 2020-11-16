var Docker = require('dockerode');
var os = require('os');
const {exec,spawn} = require('child_process');
var fs = require('fs')

module.exports=class DevEnvDocker {
    constructor(SocketPath){
        this.docker = new Docker({socketPath:SocketPath})
        this.socketPath=SocketPath;
        this.DockerDns="ruudud/devdns"
        this.Traefikimg="traefik"
        this.Traefikname="rp"
        this.PortainerImg="portainer/portainer-ce"
        this.PortainerName="portainer"
        this.DnsSuffix="localhost";
        this.promisifyStream = (stream) => new Promise((resolve, reject) => { 
            stream.on('data', (d) => console.log(d.toString()))
            stream.on('end', resolve)
            stream.on('error', reject)
        })
        DevEnvDocker.init()
    }
    static init(){console.log(`~~DockerDev~~`);console.log("/!\\Warning if you face an error containing an EACCES connect please launch the command again with Sudo right")}
    pull(ImageName,tag='latest'){
        console.log('Please wait image is loading')
        var image
        if(ImageName.includes(':')!=-1) image =ImageName
        else image = `${ImageName}:${tag}`
        const promise1 = new Promise((resolve,reject)=>{
            this.docker.pull(image, (err, stream) => {
                if(err) return resolve(err);
                try{
                    this.docker.modem.followProgress(stream, onFinished, onProgress);
                }catch(test){
                    console.log(test)
                    resolve()
                }
                
                function onFinished(err2, output) {
                    if (!err2) {
                        console.log('\nDone pulling.');
                    } else {
                        console.log(err2);
                    }
                    resolve();
                }
                function onProgress(event) {
                }
            });
        })
        return promise1;
    }
    async CreateAndStart(ImageName,ContainerName,ExposePort,BindingPort,Folder,Port,ImageTag="Latest"){
        var value = await this.FindIndexContainerByName(ContainerName)
        if(value!=-1) {console.log("Container already started");return;}
        if(ImageTag=="Latest"||!await this.ImageExist(ImageName)) await this.pull(ImageName,ImageTag);
        console.log(`Creating Container ${ContainerName}`)
        this.docker.createContainer({
            Image : ImageTag=="Latest"?ImageName:`${ImageName}:${ImageTag}`,
            name: String(ContainerName).toLowerCase(),
            Hostname : ContainerName,
            ExposedPorts : ExposePort,
            HostConfig:{
                Binds:Folder,
                PortBindings:BindingPort,
                RestartPolicy:{
                    "Name":"always"
                }
            },
            Labels:{
                [`traefik.http.services.${ContainerName}.loadbalancer.server.port`]: Port.toString(),
                [`traefik.http.routers.${ContainerName}.rule`]:`HostRegexp(\`${ContainerName}.${this.DnsSuffix}\`,\`{subdomain:[a-zA-Z0-9-]+}.${ContainerName}.${this.DnsSuffix}\`)`
            }
        }).catch((err)=>{
            console.log("Error during the creation of the container")
            console.log("Error : "+err)
        })
        .then((container)=>{
            console.log("PLOP")
            console.log(`Starting Container ${ContainerName}`)
            container.start();
        }).catch((err)=>console.log("Error during the start of the container \nError:"+err))
        .then(()=>console.log(`Container is started with the name ${ContainerName} and the image ${ImageName}, Your container is accesible at ${ContainerName}.localhost if Traefik is started or else run dockerdevcli`))
    }
    async StartTraefik(){
        var value = await this.FindIndexContainerByName(this.Traefikname)
        if(value!=-1) {console.log("Container already started");return;}
        if(!await this.ImageExist(this.Traefikimg)) await this.pull(this.Traefikimg);
        await this.docker.createContainer({
            Image:this.Traefikimg,
            name:this.Traefikname,
            'Env':[
                "TRAEFIK_API_INSECURE=true",
                "TRAEFIK_PROVIDERS_DOCKER_DEFAULTRULE=Host(`{{ trimPrefix `/` .Name }}.localhost`)",
                "TRAEFIK_PING=TRUE",
                "TRAEFIK_API=true",
                "TRAEFIK_ACCESSLOG=true"
            ],
            HostConfig:{
                Binds : [`${this.socketPath}:/var/run/docker.sock`],
                PortBindings :{
                    '80/tcp' :[{
                        HostPort:'80'
                    }],'8080/tcp' :[{
                        HostPort:'8080'
                    }],
                },
                RestartPolicy:{
                    "Name":"always"
                }
            },
            ExposedPorts : {"8080/tcp":{},"80/tcp":{}},
        }).catch((err)=>{
            console.log("Error during the creation of the container")
            console.log("Error : "+err)
        })
        .then((container)=>{
            console.log(`Starting Container ${this.Traefikname}`)
            container.start();
        }).catch((err)=>console.log("Error during the start of the container \nError:"+err))
        .then(()=>console.log(`Traefik is ready to rock \nPlease go to http://localhost:8080`))
    }
    async StartPortainer(){
        var value = await this.FindIndexContainerByName(this.PortainerName)
        if(value!=-1) {console.log("Container already started");return;}
        if(!await this.ImageExist(this.PortainerImg)) await this.pull(this.PortainerImg);
        this.docker.createVolume({
            Name: "portainer_data"
        })
        console.log(`Creating Container ${this.PortainerName}`)
        await this.docker.createContainer({
                Image:this.PortainerImg,
                name: this.PortainerName,
                HostConfig: {
                    Binds : [`${this.socketPath}:/var/run/docker.sock`,'portainer_data:/data'],
                    PortBindings: {
                        '9000/tcp': [{
                            HostPort: '9000',
                        }],
                    },
                    RestartPolicy:{
                        "Name":"always"
                    }
                },
                Labels:{
                    "traefik.port":"9000",
                    "traefik.http.services.portainer.loadbalancer.server.port":"9000"
                },
                ExposedPorts : {"9000/tcp":{}},
        }).catch((err)=>{
            console.log("Error during the creation of the container")
            console.log("Error : "+err)
        })
        .then((container)=>{
            console.log(`Starting Container ${this.PortainerName}`)
            container.start();
        }).catch((err)=>console.log("Error during the start of the container \nError:"+err))
        .then(()=>console.log(`Portainer is ready to rock \nPlease go to http://localhost:9000 or http://portainer.localhost if traefik is correctly configured\nPlease note that if it's the first time you may need to configure the container`))
    }
    async StartPhp(Name,Folder,Port){
        exec("pwd",async (err,stdout)=>{
            var projectfolder = Folder.includes('.')!=-1? process.env.PWD?Folder.replace('.',process.env.PWD.trim()):Folder.replace('.',stdout.trim()):Folder;
            await this.CreateAndStart("nexiconseils/php:Latest",Name,{},{},[`${projectfolder}:/app`],Port?Port:80)
        })
    }
    async LinkDns(){
        console.log(`Warning: If you are under wsl env please execute the LinkDns script as admin under cmd or powershell, Your Os is recognise as ${process.platform}.`);
        console.log(`Welcome ${os.userInfo().username}`)
        if(process.platform.includes("linux")){
            this.ifexistputin('/etc/hosts')
        }
        else if(process.platform.includes("darwin")){
            this.ifexistputin('/etc/hosts') //Provisoire en attente de test
        }
        else if(process.platform.includes("win")){
            this.ifexistputin('c:\\Windows\\System32\\drivers\\etc\\hosts')
        }else{
            console.log("Your opperating system isn't supported yet")
        }
    }
    async GetCurrentDirectory(Folder,callback){
        exec("pwd",async (err,stdout)=>{
            var projectfolder = Folder.includes('.')!=-1? process.env.PWD?Folder.replace('.',process.env.PWD.trim()):Folder.replace('.',stdout.trim()):Folder;
            callback(projectfolder)
        })
    }
    async ImageExist(name){
        const value = await this.docker.listImages()
        var exist=false;
        value.forEach(element => {
            try{
                console.log(element)
                if (element.RepoTags!==undefined&&typeof element.RepoTags[0]!==undefined&& String(element.RepoTags[0]).includes(name))
                exist = true;
            }catch(ex){
                return
            }
        },this);
        return exist
        
    }
    async ifexistputin(path){
        fs.readFile(path,(err,data)=>{
            if(err) console.log(`Can't access the file ${path}`);
            var dnsredirect='127.0.0.1 *.localhost\n'
            var dnsredirect2='127.0.0.1 *.*.localhost\n'
            var dnsredirect3='127.0.0.1 www.*.*.localhost\n'
            var dnsredirect4='127.0.0.1 www.*.localhost\n'
            this.input(path,dnsredirect,data)
            this.input(path,dnsredirect2,data)
            this.input(path,dnsredirect3,data)
            this.input(path,dnsredirect4,data)
            this.AfterInput()
        })
    }
    async input(path,string,data){
        if(data.indexOf(string)==-1){
            fs.appendFile(path,string,(err)=>{if(err) console.log(err)})
        }
    }
    AfterInput(error){
        if(error){
            console.log("You need to try again with Sudo Right")
            console.log(error)
        }else{
            exec(`curl -L ${this.DnsSuffix}:80`,()=>{
                console.log("It works")
            })
        }
    }
    FindIndexContainerByName(Name){
        return this.docker.listContainers({"all":true})
            .then((containers)=> containers.findIndex((element => element.Names[0]==`/${Name}`)))
    }
    GetContainerID(Name){
        return this.FindIndexContainerByName(Name)
            .then((Index)=>{
                if(Index==-1) return -1;
                return this.docker.listContainers({"all":true})
                    .then((Containers)=>Containers[Index].Id)
            })
    }
    StopContainers(Name){
        return this.GetContainerID(Name)
            .then((ID)=>{
                if(ID==-1) return;
                var swap=this.docker.getContainer(ID);
                console.log('Container succesfuly stoped')
                return swap.stop()
                .then(()=>swap);
            })
    }
    StartContainer(Name){
        return this.GetContainerID(Name)
            .then((ID)=>{
                console.log(ID)
                var swap
                if(ID==-1) return;
                //swap=this.docker.getContainer()
                //else
                swap=this.docker.getContainer(ID);
                console.log("Container succesfuly started")
                return swap.start()
                .then(()=>swap);
            })
    }
    RemoveContainer(Name){
        return this.GetContainerID(Name).then((id)=>{
            if(id==-1) return console.log("The container doesn't exist")
            return this.docker.getContainer(id).remove().catch(()=>{
                return this.docker.getContainer(id).stop().then(()=>{
                    return this.docker.getContainer(id).remove()
                })
                
            }).then(()=>console.log(`Container ${Name} succesfuly deleted`))
        })
    }
    GetContainer(Name){
        return this.GetContainerID(Name)
            .then((ID)=>{
                if(ID==-1) return
                var swap = this.docker.getContainer(ID)
                return swap
            })
    }
    Container(Name){
        const shell = spawn(`docker`,['exec','-it',Name,'bash'] ,{stdio:'inherit'})
        shell.on('close',(code)=>{console.log(`[${Name} Shell] terminated :${code}`)})
    }
    InteractiveCommand(Name,command){
        const shell = spawn(`docker`,['exec','-it',Name,'command'] ,{stdio:'inherit'})
        shell.on('close',(code)=>{console.log(`[${Name} Shell] terminated :${code}`)})
    }
    async GulpShell(tag,folder){
        if(tag=="Latest"||!await this.ImageExist('node'+tag)) await this.pull('node',tag);
        this.GetCurrentDirectory(folder,(projectfolder)=>{
            console.log('Your file is mounted in the /app directory please use cd /app to be able to use your file')
            const shell = spawn('docker',['run','-it','--rm','-v',`${projectfolder}:/app`,`node:${tag}`,'bash'],{stdio:'inherit'})
            shell.on('close',(code)=>{console.log(`[Shell] terminated :${code}`)})
        })
    }
    async GulpCommand(tag,folder,command,ignorechecknodemodules=false){
        if(tag=="Latest"||!await this.ImageExist('node'+tag)) await this.pull('node',tag);
        if (!ignorechecknodemodules&&!fs.existsSync(folder+'/node_modules')) {
            console.log("Project not installed, install in progress")
            await this.GulpCommand(tag,folder,'npm install',true)
            console.log("Project installed")
        }
        this.GetCurrentDirectory(folder,(projectfolder)=>{
            const shell = spawn('docker',['run','-it','--rm','-v',`${projectfolder}:/app`,`node:${tag}`,'bash','-c',`cd //app && ${command}`],{stdio:'inherit'})
            shell.on('close',(code)=>{console.log(`Gulp command ${command} terminated :${code}`)})
        })
    }
    async RemovePortainer(){await this.RemoveContainer(this.PortainerName)}
    async RemoveTraefik(){await this.RemoveContainer(this.Traefikname)}
}