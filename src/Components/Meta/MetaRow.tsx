import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    setSelectedItemsFromLastTo, loadAndEditFile, loadAndDisplayFile, displaySelectedMediaFile,
    rightClickOnFile, enterFolderByItem, MyDispatch, openContextMenu, toggleSelectedItem, selectItems
} from '../../Actions/Actions';
import './Meta.css';

import { Meta } from '../../Api/TagUtils';
import { FileItem, Item } from '../../Api/Item';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from "@material-ui/core/Divider";
//import FolderIcon from '@material-ui/icons/Folder';
import { styled } from '@material-ui/styles';
//import FileIcon from '@material-ui/icons/InsertDriveFile';
import blue from '@material-ui/core/colors/blue';
import { AppState } from '../../Reducers/reducer';

const MyListItem = styled(ListItem)({
    padding: '0 16px 0px 16px'
});

const MyListItemText = styled(ListItemText)({
    //fontSize: '4.5rem',
});


export default class MetaRow extends Component<MetaProps> {

    render() {
        //const classes = useStyles();
        const { meta } = this.props;
        /*
        const iconStyle = {
            backgroundColor: isSelected ? blue['A200'] : undefined
        };
        */
       //meta.fileUrl.split(("/[.,\/ -]/"))[meta.fileUrl.split(("/[.,\/ -]/")).length - 1]
        const realSize = null //(item instanceof FileItem) ? item.getDisplaySize() : null;
        console.log ('in MetaRow')
        return (
            <div className="Meta">
                <MyListItem>
                    <MyListItemText
                        className="metaname"
                        primary={meta.fileUrl.split(('\/'))[meta.fileUrl.split(('\/')).length - 1]}
                        secondary={realSize}
                    />
                </MyListItem>
            </div>
        );
    }
}

interface MetaOwnProps {
    meta: Meta;
}
interface StateProps {
    //isSelected: boolean;
}
interface DispatchProps {
}
interface MetaProps extends MetaOwnProps, StateProps, DispatchProps { }