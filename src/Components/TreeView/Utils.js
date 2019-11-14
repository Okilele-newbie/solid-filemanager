const fileClient = require('solid-file-client');

class Utils {
    static async asyncCallFileClientReadFolder(url) {
        var folder = await fileClient.readFolder(url)
        return folder
    }

    static async readSubItems(items) {
        for (var i = 0; i < items.length; i++) {
            try {
                //console.log('SOLID - Try to read items of ' + items[i].url)
                var subsFolder = await Utils.asyncCallFileClientReadFolder(items[i].url)
                console.log('SOLID - Was able to read items of ' + items[i].name)
                console.log('sub folders of ' + items[i].name + ' : ' + subsFolder.folders)
                console.log('sub files of ' + items[i].name + ' : ' + subsFolder.files)
                items[i].items = subsFolder.folders;
                //items[i].items.concat(subsFolder.files)
                items[i].items.map(item => { 
                    console.log('decoding item of ' + items[i].name + ' : ' + item.name)
                    item.name = decodeURI(item.name) 
                })
            } catch (err) { }
        }
    }
}


export default (Utils)