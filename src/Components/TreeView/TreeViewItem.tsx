import React, { Component } from 'react';
import { connect } from 'react-redux';

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText"
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { styled } from '@material-ui/styles';

import { enterFolderByItem, MyDispatch } from '../../Actions/Actions';

import { Item } from '../../Api/Item';

//import { Blank } from '../../Icon/Blank';
//import Blank from "@material-ui/icons/Blank" // Works and icon

//import { IFolder } from '../../Api/IFolder';

import Utils from "./Utils";
//const Utils = require('./Utils.ts');

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

const MyListItem = styled(ListItem)({
    padding: '0 16px 0px 16px',
});

const MyListItemText = styled(ListItemText)({
    fontSize: '0.8em',
    padding: '0 0px'
});

//                {Utils.blanks(colNumber)}
//Utils.Blank()
class TreeViewItem extends React.Component<TreeViewProps> {

    state = {} as IState;
    colNumber = 2;

    render() {
        const { item, handleClick, colNumber, itemHandleClick } = this.props

        return (
            <MyListItem
                button
                key={item.name}
                onClick={itemHandleClick.bind(this, item)}
            >
                {Utils.blanks(colNumber)}
                <div
                    key={item.name}
                >
                    {item.folders && item.folders.length !== 0 ? (
                        this.props.expColl
                            ? (<ExpandLess key={item.name} />)
                            : (<ExpandMore key={item.name} />)
                    ) : (Utils.Blank())}
                </div>

                <MyListItemText
                    key={item.name + 'txt'}
                    onClick={handleClick}
                >
                    {item.name}
                </MyListItemText>

            </MyListItem>
        )
    }
}

interface TreeViewOwnProps {
    item: IFolder;
    colNumber: number;
    itemHandleClick(folder: IFolder): void;
    expColl: boolean
}
interface StateProps {
}
interface DispatchProps {
    handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}
interface TreeViewProps extends TreeViewOwnProps, StateProps, DispatchProps { }

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: MyDispatch, ownProps: TreeViewOwnProps): DispatchProps => {
    return {
        handleClick: () => {
            const item = new Item(ownProps.item.url)
            dispatch(enterFolderByItem(item));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeViewItem);
