import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
    setSelectedItemsFromLastTo, loadAndEditFile, loadAndDisplayFile, displaySelectedMediaFile,
    rightClickOnFile, enterFolderByItem, MyDispatch, openContextMenu, toggleSelectedItem, selectItems
} from '../../Actions/Actions';
import './Meta.css';

import { Meta } from '../../Api/TagUtils';
//import { FileItem, Item } from '../../Api/Item';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
//import ListItemIcon from '@material-ui/core/ListItemIcon';
//import Divider from "@material-ui/core/Divider";
//import FolderIcon from '@material-ui/icons/Folder';
import { styled } from '@material-ui/styles';
//import FileIcon from '@material-ui/icons/InsertDriveFile';
import blue from '@material-ui/core/colors/blue';
import { AppState } from '../../Reducers/reducer';
import { FileItem, Item } from '../../Api/Item';

const MyListItem = styled(ListItem)({
    padding: '0 16px 0px 16px'
});

const MyListItemText = styled(ListItemText)({
    //fontSize: '4.5rem',
});


class MetaRow extends Component<MetaProps> {

    render() {
        //const classes = useStyles();
        const { isSelected, meta, handleClickOnName, handleDoubleClick, handleContextMenu } = this.props;
        const iconStyle = {
            backgroundColor: isSelected ? blue['A200'] : undefined
        };
        const realSize = null //(item instanceof FileItem) ? item.getDisplaySize() : null;
        let tagList = '' as string
        meta.tags.map(tag => {
            tagList === ''
                ? tagList += `${tag.value}`
                : tagList += ` - ${tag.value}`
        })
        tagList = ` (${tagList})`
        return (
            <div className="File" data-selected={isSelected}>
                <MyListItem>
                    <MyListItemText className="metaname"
                        primary={meta.fileUrl.split(('\/'))[meta.fileUrl.split(('\/')).length - 1].concat(tagList)}
                        onClick={handleClickOnName} onDoubleClick={handleDoubleClick} onContextMenu={handleContextMenu}
                    />
                </MyListItem>
            </div>
        );
    }
}


interface MetaOwnProps {
    meta: Meta;
    item: Item;
}
interface StateProps {
    isSelected: boolean;
}
interface DispatchProps {
    handleClickOnName(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
    handleDoubleClick(): void;
    handleContextMenu(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}
interface MetaProps extends MetaOwnProps, StateProps, DispatchProps { }

const mapStateToProps = (state: AppState, ownProps: MetaOwnProps): StateProps => {
    return {
        isSelected: state.metas.selected.includes(ownProps.meta)
    };
};

const mapDispatchToProps = (dispatch: MyDispatch, ownProps: MetaOwnProps): DispatchProps => {
    const meta = ownProps.meta;
    const item = new Item(meta.fileUrl, 0);

    return {

        handleDoubleClick: () => {

            if (item instanceof FileItem) {
                if (item.isEditable())
                    dispatch(loadAndEditFile(item.name));
                else if (item.isImage())
                    dispatch(loadAndDisplayFile(item.name));
                else if (item.isMedia())
                    dispatch(displaySelectedMediaFile());
            }
            else
                dispatch(enterFolderByItem(item));
        },

        handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent) => {
            event.preventDefault();
            event.stopPropagation();

            let x = 0;
            let y = 0;

            if (event.nativeEvent instanceof MouseEvent) {
                x = event.nativeEvent.clientX;
                y = event.nativeEvent.clientY;
            }
            else if (event.nativeEvent instanceof TouchEvent) {
                x = event.nativeEvent.touches[0].pageX;
                y = event.nativeEvent.touches[0].pageY;
            }
            else {
                console.warn("Unknown click event", event);
            }

            if (event.shiftKey) {
                dispatch(setSelectedItemsFromLastTo(item))//ownProps.item));
            } else {
                dispatch(rightClickOnFile(item))//ownProps.item));
            }

            dispatch(openContextMenu({ x, y }));
        },

        handleClickOnName: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent) => {
            event.stopPropagation();

            if (event.ctrlKey) {
                dispatch(toggleSelectedItem(item))//ownProps.item));
            } else if (event.shiftKey) {
                dispatch(setSelectedItemsFromLastTo(item))//ownProps.item));
            } else {
                dispatch(selectItems([item]))//ownProps.item]));
            }
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MetaRow);
