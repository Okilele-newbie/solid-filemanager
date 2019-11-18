const FileClient = require('solid-file-client');

interface IFolder {
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

export interface IDict {
    [index: string]: IFolder;
}

export default class Utils {

    static dict = {} as IDict

    //Interface for FileClient.popupLogin
    static async FileClientPopupLogin(webId: string) {
    FileClient.popupLogin()
    .then(
        (webId: string) => { console.log(`Logged in as ${webId}.`); }
        , (err: any) => console.log('Error while loging' + err))
    }

    static async FileClientReadFolder(url:string) {
        //console.log('Entering asyncCallFileClientReadFolder with url ' + url)
        const folder: IFolder = await FileClient.readFolder(url)
        folder.name = decodeURI(folder.name)
        folder.folders.forEach((f: IFolder) => { 
            f.name = decodeURI(f.name)
            f.folders = []
        })

        this.dict[folder.url] = folder;
        
        return folder
    }

    //Load folders in the folders attribute of IFolder
    static async updateSubFolders(folder: IFolder) {
        //console.log('SOLID - Try to read sub items of ' + folder.url)
        for (var i = 0; i < folder.folders.length; i++) {
            try {
                //console.log('      - Try to read items of ' + folder.folders[i].url)
                var subsFolder = await Utils.FileClientReadFolder(folder.folders[i].url)
                folder.folders[i] = subsFolder;
            } catch (err) {
                //Error on some of my folders, set an empty [] for interface validation
                //console.log ('Got an error while reading ' + folder.folders[i].url)
                //folder.folders[i] = <IFolder>{};
             }
        }
    }
}