import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { connect } from 'react-redux';
import { loadAndEditTags, MyDispatch } from '../../../Actions/Actions';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { Item } from '../../../Api/Item';
import { AppState } from '../../../Reducers/reducer';

function EditTagsAction(props: EditTagsActionProps) {
    const { handleClick, selectedItems } = props;
    return (
        <MenuItem onClick={() => handleClick(selectedItems)}>
            <ListItemIcon>
                <OpenInBrowserIcon />
            </ListItemIcon>
            <Typography variant="inherit">
                Edit tags
            </Typography>
        </MenuItem>        
    );
}

interface EditTagsActionProps {
    handleClick(selectedItems: Item[]): void;
    selectedItems: Item[];
}

const mapStateToProps = (state: AppState) => {
    return {
        selectedItems: state.items.selected
    };
};

const mapDispatchToProps = (dispatch: MyDispatch) => {
    return {
        handleClick: (selectedItems: Item[]) => {
            dispatch(loadAndEditTags(selectedItems[0].name));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditTagsAction);
