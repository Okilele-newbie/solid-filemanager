import config from './../config';
const FileClient = require('solid-file-client');

export interface IFolder {
    type: "folder";
    name: string; // folder name (without path),
    url: string; // full URL of the resource,
    modified: string; // dcterms:modified date
    mtime: string; // stat:mtime
    size: number;// stat:size
    parent: string;// parentFolder or undef if none,
    content: string; // raw content of the folder's turtle representation,
    files: Array<any>; // an array of files in the folder
    folders: IFolder[];// an array of sub-folders in the folder,
    known?: boolean;//details of sub folders are read (in treeview)
}

export default class SolidFileClientUtils {

    static serverId: string = ''
    static webId: string = ''

    //Interface method for FileClient.popupLogin
    static async fileClientPopupLogin() {
        await FileClient.popupLogin()
            .then(
                (webId: string) => {
                    const serverId = webId.split("/card")[0];
                    this.serverId = serverId
                    this.webId = webId
                    console.log(`Logged in as ${webId} on ${serverId}.`);
                }
                , (err: any) => console.log('Error while loging' + err)
            )
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms ));
    }

    static async getHost() {
        let baseUrl = config.getHost()
        while (baseUrl === null) {
            await this.sleep(1000)
            baseUrl = config.getHost()
        }
        return baseUrl
    }

    static async fileClientReadFolder(fileName: string) {
        let res = {} as IFolder;
        await FileClient.readFolder(fileName).then((content: IFolder) => {
            content.name = decodeURI(content.name)
            content.folders.forEach((f: IFolder) => {
                f.name = decodeURI(f.name)
                f.folders = []
            })
            res = content
        }, (err: any) => {
            alert(`User ${this.webId} is not able to read folder ${fileName} on Pod ${this.serverId}`)
        });
        return res
    }


    //Interface method for FileClient.readFile
    static async fileClientReadFileAsString(url: string) {
        //console.log('Entering read file with url ' + url)
        let res: string = ''
        await FileClient.readFile(url).then(
            (body: string) => {
                res = body
                //console.log(`In of fileClientReadFileAsString with res=${res}`)
            }
            , (err: any) => {
                console.log(`Error when reading file ${url}, returning blank`)
                //throw new Error("read error  " + err)
            });
        //console.log(`Out of fileClientReadFileAsString with res=${res}`)
        return res as string
    }

    //Interface method for FileClient.createFile
    static async fileClientcreateFile(url: string) {
        //console.log('Entering create file with url ' + url)
        FileClient.createFile(url)
            .then(
                () => { return true }
                , (err: any) => console.log('Error while creating file ' + url)
            )
    }

    //Interface method for FileClient.updateFile
    static async fileClientupdateFile(url: string, newContent: string) {
        //console.log('Entering update file with url ' + url)
        FileClient.updateFile(url, newContent)
            .then(
                () => { return true }
                , (err: any) => console.log('Error while updating file ' + url)
            )
    }
}