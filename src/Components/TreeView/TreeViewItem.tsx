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
//import { IFolder } from '../../Api/IFolder';

import Utils from "./Utils";
//const Utils = require('./Utils.ts');

const webId: string = 'https://okilele.solid.community/'

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

interface IState {
    [index: string]: boolean;
}


//------------------------------------------
async function updateFolderItem(thisObject: TreeViewItem, e: IFolder) {
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

const MyListItem = styled(ListItem)({
    padding: '0 16px 0px 16px',
});

const MyListItemText = styled(ListItemText)({
    fontSize: '0.9em',
});

class TreeViewItem extends React.Component<FileProps> {
    state = {} as IState;
    handleClickFolder = (item: IFolder) => {
        updateFolderItem(this, item);
    };

    render() {
        const { item, handleClick } = this.props
        console.log(`handleClick=${handleClick}`)
        return (
            <MyListItem
                button
                key={item.name}
            >
                {"spaces"}
                <div


                >

                </div>

                <MyListItemText
                    key={item.name + 'txt'}
                    onClick={handleClick}
                >
                    {item.name}
                    Something
                </MyListItemText>

            </MyListItem>
        )
    }
}

/*
                {"blanks"}
*/
/*
                <div
                    key={item.name}
                    onClick={this.handleClickFolder.bind(this, item)}
                >
*/
/*
                    {item.folders && item.folders.length !== 0 ? (
                        this.state[item.url]
                            ? (<ExpandLess key={item.name} />)
                            : (<ExpandMore key={item.name} />)
                    ) : (null)}
*/

interface FileOwnProps {
    item: IFolder;
}
interface StateProps {
    isSelected: boolean;
}
interface DispatchProps {
    handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}
interface FileProps extends FileOwnProps, StateProps, DispatchProps { }

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: MyDispatch, ownProps: FileOwnProps): DispatchProps => {
    return {
        handleClick: () => {
            console.log(`mapDispatchToProps, ownProps.item ${ownProps.item}`)
            //const item = ownProps.item;
            const item = new Item(ownProps.item.url)
            dispatch(enterFolderByItem(item));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeViewItem);