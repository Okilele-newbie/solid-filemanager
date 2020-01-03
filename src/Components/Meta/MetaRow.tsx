import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    setSelectedItemsFromLastTo, loadAndEditFileFromTag, loadAndDisplayFileFromTag, displaySelectedMediaFileFromTag,
    rightClickOnFile, enterFolderByItem, MyDispatch, openContextMenu, toggleSelectedItem, selectItems
} from '../../Actions/Actions';
import './Meta.css';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { AppState } from '../../Reducers/reducer';
import { FileItem, FolderItem, Item } from '../../Api/Item';
import { Meta, onServerColor } from '../../Api/MetaUtils';
import FileUtils from '../../Api/FileUtils';

class MetaRow extends Component<MetaProps> {

    userId = FileUtils.userIdAndHost.userId

    render() {
        const { isSelected, meta, handleClickOnName, handleDoubleClick, handleContextMenu } = this.props;
        let prevChars = ''
        return (
            meta.hostName === this.userId ? (
                < div className="File" data-selected={isSelected} >
                    <ListItem style={{ padding: '0 16px 0px 16px' }}>
                        <ListItemText
                            onClick={handleClickOnName} onDoubleClick={handleDoubleClick} onContextMenu={handleContextMenu}>
                            <span>
                                {meta.hostName} - {meta.pathName}
                            </span>
                            {meta.tags.map(tag => {
                                const itemColor = tag.published ? { color: onServerColor } : { color: 'black' }
                                prevChars = prevChars === '' ? ' (' : ' - '
                                return (
                                    <span style={itemColor}>
                                        {prevChars}{tag.tagType}: {tag.value}
                                    </span>
                                )
                            })}
                            )
                        </ListItemText>
                    </ListItem>
                </div >
            ) : (
                    <div className="File" data-selected={isSelected}>
                        <ListItem style={{ padding: '0 16px 0px 16px' }}>
                            <ListItemText
                                onClick={handleClickOnName} onDoubleClick={handleDoubleClick} >
                                {meta.hostName} - {meta.pathName}
                                {meta.tags.map(tag => {
                                    const itemColor = tag.published ? { color: onServerColor } : { color: 'black' }
                                    prevChars = prevChars === '' ? ' (' : ' - '
                                    return (
                                        <span style={itemColor}>
                                            {prevChars}{tag.tagType}: {tag.value}
                                        </span>
                                    )
                                })}
                                )
                        </ListItemText>
                        </ListItem>
                    </div>

                )



        )
    }

}


interface MetaOwnProps {
    meta: Meta;
    //item: Item;
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
    let path = meta.pathName.split('/') as string[]
    path.shift()
    path.pop()

    let item = {} as Item
    if (meta.mimeType === 'FOLDER') item = new FolderItem('https://' + meta.hostName + meta.pathName)
    else item = new FileItem('https://' + meta.hostName + meta.pathName)

    return {
        handleDoubleClick: () => {
            if (item instanceof FileItem) {
                if (item.isEditable())
                    dispatch(loadAndEditFileFromTag(item.name, path));
                else if (item.isImage())
                    dispatch(loadAndDisplayFileFromTag(item.name, path));
                else if (item.isMedia())
                    dispatch(displaySelectedMediaFileFromTag(path));
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
