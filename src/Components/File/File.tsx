import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    setSelectedItemsFromLastTo, loadAndEditFile, loadAndDisplayFile, displaySelectedMediaFile,
    rightClickOnFile, enterFolderByItem, MyDispatch, openContextMenu, toggleSelectedItem, selectItems
} from '../../Actions/Actions';
import './File.css';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from "@material-ui/core/Divider";
import FolderIcon from '@material-ui/icons/Folder';
import { styled } from '@material-ui/styles';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import blue from '@material-ui/core/colors/blue';
import { FileItem, Item } from '../../Api/Item';
import { AppState } from '../../Reducers/reducer';

const MyListItem = styled(ListItem)({
    padding: '0 16px 0px 16px',
});

const MyListItemText = styled(ListItemText)({
    fontSize: '4.5rem',
});


class File extends Component<FileProps> {

    render() {
        //const classes = useStyles();
        const { isSelected, item, handleClick, handleClickOnFolder, handleDoubleClick, handleContextMenu } = this.props;
        const iconStyle = {
            backgroundColor: isSelected ? blue['A200'] : undefined
        };
        const realSize = (item instanceof FileItem) ? item.getDisplaySize() : null;
        return (
            <div className="File" onClick={handleClick} onDoubleClick={handleDoubleClick} onContextMenu={handleContextMenu} data-selected={isSelected}>
                <MyListItem>
                    <ListItemIcon>
                        <div style={iconStyle} onClick={handleClickOnFolder}>
                            {(item instanceof FileItem) ? <FileIcon /> : <FolderIcon />}
                        </div>
                    </ListItemIcon>
                    <MyListItemText className="filename" primary={item.getDisplayName()} secondary={realSize} />
                    <Divider absolute />
                </MyListItem>
            </div>
        );
    }
}


interface FileOwnProps {
    item: Item;
}
interface StateProps {
    isSelected: boolean;
}
interface DispatchProps {
    handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
    handleClickOnFolder(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
    handleDoubleClick(): void;
    handleContextMenu(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}
interface FileProps extends FileOwnProps, StateProps, DispatchProps { }


const mapStateToProps = (state: AppState, ownProps: FileOwnProps): StateProps => {
    return {
        isSelected: state.items.selected.includes(ownProps.item)
    };
};


const mapDispatchToProps = (dispatch: MyDispatch, ownProps: FileOwnProps): DispatchProps => {
    return {
        handleDoubleClick: () => {
            const item = ownProps.item;

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
                dispatch(setSelectedItemsFromLastTo(ownProps.item));
            } else {
                dispatch(rightClickOnFile(ownProps.item));
            }

            dispatch(openContextMenu({ x, y }));
        },

        handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent) => {
            event.stopPropagation();

            if (event.ctrlKey) {
                dispatch(toggleSelectedItem(ownProps.item));
            } else if (event.shiftKey) {
                dispatch(setSelectedItemsFromLastTo(ownProps.item));
            } else {
                dispatch(selectItems([ownProps.item]));
            }
        },
        handleClickOnFolder: (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent) => {
            const item = ownProps.item;
            dispatch(enterFolderByItem(item));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(File);
