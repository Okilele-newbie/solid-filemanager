import React from 'react';
import { connect } from 'react-redux';

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText"
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { styled } from '@material-ui/styles';

import { enterFolderByItem, MyDispatch } from '../../Actions/Actions';

import { Item } from '../../Api/Item';

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

class TreeViewItem extends React.Component<TreeViewProps> {

    state = {} as IState;
    colNumber = 2;

    render() {
        //handleClick to show details on other view, from Redux
        //itemHandleCkick from parent to expand/collapse
        const { item, handleClick, colNumber, itemHandleClick } = this.props

        return (
            <MyListItem
                button
                key={item.name}
                onClick={itemHandleClick.bind(this, item)}
            >
                {this.blanks(colNumber)}
                <div
                    key={item.name}
                >
                    {item.folders && item.folders.length !== 0 ? (
                        this.props.expColl
                            ? (<ExpandLess key={item.name} />)
                            : (<ExpandMore key={item.name} />)
                    ) : (this.Blank())}
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

    Blank = () =>
        <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <path d="" fill="#fff" />
        </svg>;


    blanks(colNumber: number) {
        const blanks = [];
        for (var it = 0; it < colNumber; it++) {
            blanks.push(
                this.Blank()
            )
        }
        return blanks
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
