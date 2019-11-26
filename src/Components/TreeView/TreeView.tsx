import React, { Component } from 'react';

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import Collapse from "@material-ui/core/Collapse";

import SolidFileClientUtils, { IFolder } from '../../Api/SolidFileClientUtils';
import TreeViewItem from "./TreeViewItem";

/*
interface IDict {
    [index: string]: IFolder;
}
*/

interface IState {
    [index: string]: boolean;
}



export default class TreeView extends Component {
    state = {} as IState;
    folder = {} as IFolder;

    //dict = {} as IDict

    constructor(props: any) {
        super(props)
        this.itemHandleClick = this.itemHandleClick.bind(this)
    }

    itemHandleClick(folder: IFolder) {
        this.updateFolder(folder)
        this.setState({ [folder.url]: !this.state[folder.url] });
    };

    render() {

        if (this.folder.name === undefined) {
            this.initFolders()
            return (<div></div>)
        } else {
            return (
                <div>
                    <List
                        subheader={
                            <ListSubheader></ListSubheader>
                        }>
                        {this.printRows(
                            this.folder.folders,
                            -1)}
                    </List>
                </div>
            )
        }

    };

    printRows(items: IFolder[], colNumber: number) {
        colNumber = colNumber + 1
        if (items != null) {
            return (
                items.map((item: IFolder) => {
                    return (
                        <div key={item.name}>
                            <TreeViewItem
                                item={item}
                                key={0}
                                colNumber={colNumber}
                                itemHandleClick={this.itemHandleClick}
                                expColl={this.state[item.url]}
                            />
                            {item.folders != null ? (
                                <Collapse
                                    key={item.name + 'col'}
                                    component="div"
                                    in={this.state[item.url]}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    {this.printRows(item.folders, colNumber)}
                                </Collapse>
                            ) : (null)}
                        </div>
                    )
                })

            );
        }
        colNumber = colNumber - 1
    }

    async initFolders() {

        console.log('1')
        //await SolidFileClientUtils.FileClientPopupLogin()
        this.folder = await SolidFileClientUtils.FileClientReadFolder(
            SolidFileClientUtils.getServerId()
        )
        //get folders in the root
        await this.updateFolder(this.folder)

        //and then update those folders so that the arrows (if any) are visible
        for (var i = 0; i < this.folder.folders.length; i++) {
            await this.updateFolder(this.folder.folders[i])
        }
        this.forceUpdate()
    }

    //also called on folder icon click
    async updateFolder(item: IFolder) {
        console.log('2.1' + item.folders.length)
        //sub items of the clicked e:IFolder are already in its folder.folders
        //here for each of those sub items are updated so that the arrow sign on the parent is visible
        if (!item.full) {
            for (var i = 0; i < item.folders.length; i++) {
                //console.log(`      - Try to read items of ${item.folders[i].url}`)
                item.folders[i] = await SolidFileClientUtils.FileClientReadFolder(item.folders[i].url)
            }
            item.full = true
            //console.log('Set subfolder.full for ' + item.url)
        }
        //this.setState({ [item.url]: !this.state[item.url] });
    };

    //Read details of subfolders of a folder
    async updateSubFolders(folder: IFolder) {
        for (var i = 0; i < folder.folders.length; i++) {
            try {
                //console.log(`      - Try to read items of ${folder.folders[i].url}`)
                var subFolder = await SolidFileClientUtils.FileClientReadFolder(folder.folders[i].url)
                //console.log(`       added subFolder ${subFolder.url}`)
                folder.folders[i] = subFolder;
            } catch (err) {
                //Error on some damaged folders, set an empty [] for interface validation
                //console.log ('Got an error while reading ' + folder.folders[i].url)
                //folder.folders[i] = <IFolder>{};
            } finally {
                // Error already caught at deeper level
            }
        }
    }

}

