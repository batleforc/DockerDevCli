var Docker = require('dockerode');
var os = require('os');
const {exec} = require('child_process');
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
    static init(){console.log(`
    /$$$$$$$                      /$$                           /$$$$$$$                      
   | $$__  $$                    | $$                          | $$__  $$                     
   | $$  \ $$  /$$$$$$   /$$$$$$$| $$   /$$  /$$$$$$   /$$$$$$ | $$  \ $$  /$$$$$$  /$$    /$$
   | $$  | $$ /$$__  $$ /$$_____/| $$  /$$/ /$$__  $$ /$$__  $$| $$  | $$ /$$__  $$|  $$  /$$/
   | $$  | $$| $$  \ $$| $$      | $$$$$$/ | $$$$$$$$| $$  \__/| $$  | $$| $$$$$$$$ \  $$/$$/ 
   | $$  | $$| $$  | $$| $$      | $$_  $$ | $$_____/| $$      | $$  | $$| $$_____/  \  $$$/  
   | $$$$$$$/|  $$$$$$/|  $$$$$$$| $$ \  $$|  $$$$$$$| $$      | $$$$$$$/|  $$$$$$$   \  $/   
   |_______/  \______/  \_______/|__/  \__/ \_______/|__/      |_______/  \_______/    \_/   
   `)}
    pull(ImageName,tag='latest'){
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
    async CreateAndStart(ImageName,ContainerName,ExposePort,BindingPort,Folder,ImageTag="Latest"){
        var value = await this.FindIndexContainerByName(ContainerName)
        if(value!=-1) {console.log("Container already started");return;}
        if(!await this.ImageExist(ImageName)||ImageTag!="Latest") await this.pull(ImageName,ImageTag);
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

            }
        }).catch((err)=>{
            console.log("Error during the creation of the container")
            console.log("Error : "+err)
        })
        .then((container)=>{
            console.log(`Starting Container ${ContainerName}`)
            container.start();
        }).catch((err)=>console.log("Error during the start of the container \nError:"+err))
        .then(()=>console.log(`Container is started with the name ${ContainerName} and the image ${ImageName}, Your container is accesible at ${ContainerName}.localhost if Traefik is started or else run dockerdevcli`))
    }
    async StartTraefik(){
        var value = await this.FindIndexContainerByName(this.Traefikname)
        if(value!=-1) {console.log("Container already started");return;}
        if(!await this.ImageExist(this.Traefikimg)) await this.pull(this.Traefikimg);
        console.log(`Creating Container ${this.Traefikname}`)
        await this.docker.createContainer({
            Image:this.Traefikimg,
            name:this.Traefikname,
            HostConfig:{
                Binds : [`${this.socketPath}:/var/run/docker.sock`,__dirname+'/traefik/traefik.yml:/etc/traefik/traefik.yml'],
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
                    Binds : [`${this.socketPath}:/var/run/docker.sock`],
                    PortBindings: {
                        '8000/tcp': [{
                            HostPort: '8000',
                        }],
                        '9000/tcp': [{
                            HostPort: '9000',
                        }],
                    },
                    RestartPolicy:{
                        "Name":"always"
                    }
                },
                Volumes:{
                    "portainer_data/data":{}
                },
                ExposedPorts : {"9000/tcp":{},"8000/tcp":{}},
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
    async ImageExist(name){
        const value = await this.docker.listImages()
        var exist=false;
        value.forEach(element => {
            if (String(element.RepoTags[0]).includes(name))
                exist = true;
        },this);
        return exist
        
    }
    async ifexistputin(path){
        fs.readFile(path,(err,data)=>{
            if(err) console.log(`Can't access the file ${path}`);
            var dnsredirect='127.0.0.1 *.localhost'
            if(data.indexOf(dnsredirect)==-1){
                fs.appendFile(path,dnsredirect,err=>{
                    this.AfterInput(err)
                })
            }
            else{
                this.AfterInput(err)
            }
        })
    }
    AfterInput(error){
        if(error){
            console.log("You need to try again with Sudo Right")
            console.log(error)
        }else{
            exec(`curl -L ${this.DnsSuffix}:80`,(error2)=>{
                if(error2) return console.log(error2)
                console.log("It works")
            })
        }
    }
    FindIndexContainerByName(Name){
        return this.docker.listContainers()
            .then((containers)=> containers.findIndex((element => element.Names[0]==`/${Name}`)))
    }
    GetContainerID(Name){
        return this.FindIndexContainerByName(Name)
            .then((Index)=>{
                if(Index==-1) return -1;
                return this.docker.listContainers()
                    .then((Containers)=>Containers[Index].Id)
            })
    }
    StopContainers(Name){
        return this.GetContainerID(Name)
            .then((ID)=>{
                if(ID==-1) return;
                var swap=this.docker.getContainer(ID);
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
                return swap.start()
                .then(()=>swap);
            })
    }
    RemoveContainer(Name){
        return this.StopContainers(Name)
            .then(async(ID)=>{
                if(ID==-1)return;
                var swap
                if(ID==undefined){
                    swap = await this.docker.getContainer(Name);
                }
                else{
                    swap=this.docker.getContainer(ID)
                }
                swap.remove()
                return swap
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
    async RemovePortainer(){await this.RemoveContainer(this.PortainerName)}
    async RemoveTraefik(){await this.RemoveContainer(this.Traefikname)}
}