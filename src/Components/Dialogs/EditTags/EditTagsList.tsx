import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux';
import { updateMeta, MyDispatch, closeDialog } from '../../../Actions/Actions';
import { DialogStateProps, DialogDispatchProps, DialogButtonClickEvent } from '../dialogTypes';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import { Item } from '../../../Api/Item';
import TagUtils, { Tag, Meta, MetaTag } from '../../../Api/TagUtils';
import Popup from './Popup'

class FormDialog extends Component<EditTagsProps> {
    constructor(props: EditTagsProps) {
        super(props);
        //this.itemHandleClick = this.itemHandleClick.bind(this)
    }

    //When entering text in the field, to trigger suggests
    searchString: string = ''
    showSuggests: boolean = false

    //Just call Redux handleSubmit
    handleSave(event: DialogButtonClickEvent) {
        event.preventDefault();
        //TagUtils.updateMeta(this.currentItemMeta)
        const meta = this.currentItemMeta
        this.props.handleSubmit(event, { meta });
    }


    currentItemMeta = {} as Meta;
    currentItem = {} as Item;
    handleClose = {}

    async componentDidUpdate() {
        if (this.props.item) this.currentItemMeta = await TagUtils.getMeta(this.props.item)
    }

    render() {
        //handle close: Rdux, sent by store
        const { handleClose, open, item } = this.props;

        if (item) {
            this.currentItem = item
            this.handleClose = handleClose
            //console.log(`Before return: ${this.currentItemTags.length}`)
            return (
                <div>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="form-dialog-edit"
                        fullWidth={true} maxWidth={'sm'}>
                        <form>
                            <DialogTitle
                                id="form-dialog-edit">Editing TAGS: {this.currentItem.getDisplayName()}
                            </DialogTitle>
                            <DialogContent>
                                <Popup />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary" type="button">
                                    Close
                                </Button>
                                <Button color="primary" onClick={this.handleSave.bind(this)} type="submit">
                                    Save
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                </div>
            );
        } else return (null)
    }
}

interface StateProps extends DialogStateProps {
    item: Item;
    suggests: string[],
    isLoading: boolean
}

interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, { meta }: { meta: Meta }): void;
}
interface EditTagsProps extends StateProps, DispatchProps { }

const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.EDITTAGS, // TODO: rename visibleDialogs (e.g. to dialogIsOpen)
        item: state.items.selected[0],
        suggests: [],
        isLoading: false
    };
};

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {
    return {
        handleClose: () => {
            dispatch(closeDialog(DIALOGS.EDITTAGS));
        },
        handleSubmit: (event, { meta }) => {
            dispatch(updateMeta(meta));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
