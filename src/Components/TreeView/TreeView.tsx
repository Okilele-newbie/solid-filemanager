import React, { Component } from 'react';

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import Collapse from "@material-ui/core/Collapse";
//import { styled } from '@material-ui/styles';

import FileUtils, { IFolder } from '../../Api/FileUtils';
import TreeViewItem from "./TreeViewItem";
import Loader from '../Loader/Loader'; 

interface IState {
    [index: string]: boolean;
}

/*
const MyList = styled(List)({
    width: 'max-content',
    flexShrink: 0
});
*/

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

    async initFolders() {
        
        const baseUrl = (await FileUtils.loadUserIdAndHost()).baseUrl
        
        if (baseUrl !== null) {
            this.folder = await FileUtils.fileClientReadFolder(baseUrl)

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
        for (var i = 0; i < item.folders.length; i++) {
            if (item.folders[i].known !== true) {
                item.folders[i] = await FileUtils.fileClientReadFolder(item.folders[i].url)
                item.folders[i].known = true
            }
            for (var j = 0; j < item.folders[i].folders.length; j++) {
                try {
                    if (item.folders[i].folders[j].known !== true) {
                        item.folders[i].folders[j] =
                            await FileUtils.fileClientReadFolder(item.folders[i].folders[j].url)
                            item.folders[i].folders[j].known = true
                    }
                } catch (err) {
                    //Error on some damaged folders, skip ...
                }
            }
        }
     }

    render() {
        if (this.folder.name === undefined) {
            this.initFolders()
            return (<div><Loader/></div>)
        } else {
            return (
                <div>
                    <List style={{width: 'max-content', flexShrink: 0 }}
                        subheader={<ListSubheader></ListSubheader>}>
                        {this.printRows(this.folder.folders, -1)}
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
}

