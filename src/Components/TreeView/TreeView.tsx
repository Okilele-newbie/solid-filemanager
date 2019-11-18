import React, { Component } from 'react';
import { connect } from 'react-redux';

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText"
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";

import { styled } from '@material-ui/styles';

import { enterFolderByItem, MyDispatch } from '../../Actions/Actions';
import { AppState } from '../../Reducers/reducer';
import { Item } from '../../Api/Item';

import Utils from "./Utils";
//const Utils = require('./Utils.ts');
import TreeViewItem from "./TreeViewItem";

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
    alreadyReadSubFolders?: boolean;//details of sub folders are read
}

const webId: string = 'https://okilele.solid.community/'

interface IState {
    [index: string]: boolean;
}

async function initFolders(thisObject: TreeView) {
    const rootFolder: IFolder = await Utils.FileClientReadFolder(webId)
    thisObject.folder = rootFolder
    updateFolder(thisObject, rootFolder)
}

async function updateFolder(thisObject: TreeView, e: IFolder) {
    //Show subItems
    thisObject.setState({ [e.url]: !thisObject.state[e.url] });
    //sub items of the clicked e:IFolder are already in its folder.folders
    //here they are updated so that the '+' sign is visible
    let selectedFolder: IFolder = Utils.dict[e.url];
    await Utils.updateSubFolders(selectedFolder)
    selectedFolder.alreadyReadSubFolders = true
    //Show again with arrows
    thisObject.forceUpdate()
};

export default class TreeView extends Component {
    state = {} as IState;
    folder = {} as IFolder;

    render() {

        if (this.folder.name === undefined) {
            initFolders(this)
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

    truc(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {

    }

    printRows(items: IFolder[], colNumber: number) {
        colNumber = colNumber + 1
        var blanks = ''
        for (var it = 0; it < colNumber; it++) { blanks += '. . ' }
        if (items != null) {
            return (
                items.map((item: IFolder) => {
                    return (
                        <div key={item.name}>
                            <TreeViewItem
                                item={item}
                                key={0}
                                isSelected={false}
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

