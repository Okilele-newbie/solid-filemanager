import React, { Component } from 'react';
import { connect } from 'react-redux';
import {enterFolderByItem, MyDispatch} from '../../Actions/Actions';
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText"
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";

import { styled } from '@material-ui/styles';

import Utils from "./Utils";
//const Utils = require('./Utils.ts');

const webId: string = 'https://okilele.solid.community/'

const MyListItem = styled(ListItem)({
    padding: '0 16px 0px 16px',
});

const MyListItemText = styled(ListItemText)({
    fontSize: '0.9em',
});

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
    alreadyReadSubFolders?: boolean;//details of sub folders are read
}

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

class TreeView extends Component {

    state = {} as IState;
    folder = {} as IFolder;

    handleClickOnIcon = (e: IFolder) => {
        updateFolder(this, e);
    };

    render() {
        const { handleClickOnText } = this.props;
 
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
                        {this.printRows(this.folder.folders, -1, handleClickOnText)}
                    </List>
                </div>
            )
        }

    };

    printRows(items: IFolder[], colNumber: number, handleClickOnText;{} {
        colNumber = colNumber + 1
        var blanks = ''
        for (var it = 0; it < colNumber; it++) { blanks += '. . ' }
        if (items != null) {
            return (
                items.map((item: IFolder) => {
                    return (
                        <div key={item.name}>
                            <MyListItem
                                button
                                key={item.name}
                            >
                                {blanks}
                                <div
                                    key={item.name}
                                    onClick={this.handleClickOnIcon.bind(this, item)}
                                >
                                    {item.folders && item.folders.length !== 0 ? (
                                        this.state[item.url]
                                            ? (<ExpandLess key={item.name} />)
                                            : (<ExpandMore key={item.name} />)
                                    ) : (null)}
                                </div>

                                <MyListItemText
                                    key={item.name + 'txt'}
                                    onClick={handleClickOnText(this, item)}
                                >
                                    {decodeURI(item.name)}
                                </MyListItemText>

                            </MyListItem>

                            <Collapse
                                key={item.name + 'col'}
                                component="div"
                                in={this.state[item.url]}
                                timeout="auto"
                                unmountOnExit
                            >
                                {item.folders != null ? (
                                    this.printRows(item.folders, colNumber)
                                ) : (null)}
                            </Collapse>{" "}
                        </div>
                    )
                })

            );
        }
        colNumber = colNumber - 1
    }
}

const mapStateToProps = (state: AppState, ownProps: FileOwnProps): StateProps => {
    return {
        isSelected: state.items.selected.includes(ownProps.item)
    };
};


const mapDispatchToProps = (dispatch: MyDispatch, ownProps: FileOwnProps): DispatchProps => {
    return {
        handleClickOnText: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent) => {
            const item = ownProps.item;
            dispatch(enterFolderByItem(item));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeView);
