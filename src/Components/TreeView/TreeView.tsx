import React, { Component } from 'react';

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import Collapse from "@material-ui/core/Collapse";
import { styled } from '@material-ui/styles';

import SolidFileClientUtils, { IFolder } from '../../Api/SolidFileClientUtils';
import TreeViewItem from "./TreeViewItem";
import Loader from '../Loader/Loader'; 

import config from '../../config';

interface IState {
    [index: string]: boolean;
}


const MyList = styled(List)({
    width: 'max-content',
    flexShrink: 0
});

export default class TreeView extends Component {
    state = {} as IState;
    folder = {} as IFolder;

    constructor(props: any) {
        super(props)
        this.itemHandleClick = this.itemHandleClick.bind(this)
    }

    //sent to TreeViewItem for expand/collapse handled here
    itemHandleClick(folder: IFolder) {
        this.updateFolder(folder)
        this.setState({ [folder.url]: !this.state[folder.url] });
    };

    render() {
        if (this.folder.name === undefined) {
            this.initFolders()
            return (<div><Loader/></div>)
        } else {
            return (
                <div>
                    <MyList
                        subheader={<ListSubheader></ListSubheader>}>
                        {this.printRows(this.folder.folders, -1)}
                    </MyList>
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
        //await SolidFileClientUtils.fileClientPopupLogin()
        const baseUrl = config.getHost()
        console.log(baseUrl)
        if (baseUrl !== null) {
            this.folder = await SolidFileClientUtils.fileClientReadFolder(baseUrl)

            //get folders in the root
            await this.updateFolder(this.folder)
            this.forceUpdate()

            //and then update those folders so that the arrows (if any) are visible
            for (var i = 0; i < this.folder.folders.length; i++) {
                await this.updateFolder(this.folder.folders[i])
            }
            this.forceUpdate()
        }
    }

    //also called on folder icon click
    async updateFolder(item: IFolder) {

        //level 0: "item" has just its name and the list of names of ...
        //level 1: subfolders: Read it to get the list of its ...
        //level 2: subfolders and read them to get the number their subfolders and be able to show them as well as the expand/collapse icon for level1.
        console.log(`updating folder level 0: ${item.url}`)

        for (var i = 0; i < item.folders.length; i++) {
            console.log(`- adding: ${item.folders[i].url}`)
            if (item.folders[i].known !== true) {
                item.folders[i] = await SolidFileClientUtils.fileClientReadFolder(item.folders[i].url)
                item.folders[i].known = true
            }
            for (var j = 0; j < item.folders[i].folders.length; j++) {
                try {
                    if (item.folders[i].folders[j].known !== true) {
                        item.folders[i].folders[j] =
                            await SolidFileClientUtils.fileClientReadFolder(item.folders[i].folders[j].url)
                            item.folders[i].folders[j].known = true
                    }
                } catch (err) {
                    //Error on some damaged folders, skip ...
                }
            }
        }
        //console.log('Set subfolder.full for ' + item.url)
    }

}

