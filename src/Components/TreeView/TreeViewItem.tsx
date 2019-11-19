import React, { Component } from 'react';
import { connect } from 'react-redux';

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText"
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Blank from "@material-ui/icons/_Blank"
import { styled } from '@material-ui/styles';

import { enterFolderByItem, MyDispatch } from '../../Actions/Actions';

import { Item } from '../../Api/Item';
//import { Blank } from '../../Icon/Blank';

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
    fontSize: '0.9em',
});

class TreeViewItem extends React.Component<TreeViewProps> {
    state = {} as IState;
    colNumber = 2;

    render() {
        const { item, handleClick, colNumber, fn } = this.props

        const blanks = [];
        for (var it = 0; it < colNumber; it++) {
            blanks.push(<Blank key={it} />)
        }

        return (
            <MyListItem
                button
                key={item.name}
                onClick={fn.bind(this, item)}
            >
                <div
                    key={item.name}
                >
                    {blanks}
                    {item.folders && item.folders.length !== 0 ? (
                        this.state[item.url]
                            ? (<ExpandLess key={item.name} />)
                            : (<ExpandMore key={item.name} />)
                    ) : (null)}
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
    fn(folder: IFolder): void;
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