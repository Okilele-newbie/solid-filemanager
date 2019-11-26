
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
    full?: boolean;//details of sub folders are read
}

export default class SolidFileClientUtils {

    static serverId: string = ''

    //Interface method for FileClient.popupLogin
    static async FileClientPopupLogin(webId: string) {
        await FileClient.popupLogin()
            .then(
                (webId: string) => {
                    this.serverId = webId.split("/card")[0];
                    console.log(`Logged in as ${webId} on ${this.serverId}.`);
                }
                , (err: any) => console.log('Error while loging' + err)
            )
    }

    static getServerId() {
        //return serverId eg webId. To be replaced by dynamic data from (currently unused) previous method
        return 'https://okilele.solid.community'
    }

    static async FileClientReadFolder(fileName: string) {
        let res = {} as IFolder;
        await FileClient.readFolder(fileName).then((content: IFolder) => {
            content.name = decodeURI(content.name)
            content.folders.forEach((f: IFolder) => {
                f.name = decodeURI(f.name)
                f.folders = []
            })
            //console.log(`FileClientReadFolder read ${fileName} and return ${content.url}`)
            //return content
            res = content
        }, (err: any) => { throw new Error("copy download error  " + err) });
        console.log(`FileClientReadFolder returning ${res}`)
        return res
    }
    /* works!
        //Interface method for FileClient.readFile
        static async FileClientReadFileAsString(url: string) {
            console.log('Entering read file with url ' + url)
            let body: string = FileClient.readFile(url)
        }
    */
    //Interface method for FileClient.readFile
    static async FileClientReadFileAsString(url: string) {
        //console.log('Entering read file with url ' + url)
        let res: string = ''
        await FileClient.readFile(url).then(
            (body: string) => {
                res = body
                //console.log(`In of FileClientReadFileAsString with res=${res}`)
            }
            , (err: any) => {
                console.log(`Error when reading file ${url}, returning blank`)
                //throw new Error("read error  " + err)
            });
        //console.log(`Out of FileClientReadFileAsString with res=${res}`)
        return res as string
    }

    //Interface method for FileClient.createFile
    static async FileClientcreateFile(url: string) {
        console.log('Entering create file with url ' + url)
        FileClient.createFile(url)
            .then(
                () => { return true }
                , (err: any) => console.log('Error while creating file ' + url)
            )
    }

    //Interface method for FileClient.updateFile
    static async FileClientupdateFile(url: string, newContent: string) {
        console.log('Entering update file with url ' + url)
        FileClient.updateFile(url, newContent)
            .then(
                () => { return true }
                , (err: any) => console.log('Error while updating file ' + url)
            )
    }
}