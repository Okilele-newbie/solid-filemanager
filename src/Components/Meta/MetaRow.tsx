import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    setSelectedItemsFromLastTo, loadAndEditFile, loadAndDisplayFile, displaySelectedMediaFile,
    rightClickOnFile, enterFolderByItem, MyDispatch, openContextMenu, toggleSelectedItem, selectItems
} from '../../Actions/Actions';
import './Meta.css';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { styled } from '@material-ui/styles';
import { AppState } from '../../Reducers/reducer';
import { FileItem, Item } from '../../Api/Item';
import { Meta, onServerColor } from '../../Api/MetaUtils';


const MyListItem = styled(ListItem)({
    padding: '0 16px 0px 16px'
});

class MetaRow extends Component<MetaProps> {

    render() {
        const { isSelected, meta, handleClickOnName, handleDoubleClick, handleContextMenu } = this.props;
        let tagList = '' as string
        let itemColor = { color: 'black' }
        meta.tags.forEach(tag => {
            tag.published && itemColor.color === 'black' 
            ? itemColor = { color: onServerColor } 
            : itemColor = { color: 'black' }

            if (tagList !== '') tagList += ` - ` 
            tagList += `${tag.tagType}:${tag.value}`
        })

        tagList = ` (${tagList})`

        return (
            <div className="File" data-selected={isSelected}>
                <MyListItem>
                    <ListItemText
                        onClick={handleClickOnName} onDoubleClick={handleDoubleClick} onContextMenu={handleContextMenu}
                    >
                        <span style={itemColor}>{`${meta.pathName.concat(tagList)}`}</span>
                    </ListItemText>
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
    const item = new Item('https://' + meta.hostName + meta.pathName);

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
