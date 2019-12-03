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
import AutocompleteTag from './AutocompleteTag'
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';

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
        //TagUtils.updateMeta(this.currentMeta)
        this.props.handleSubmit(event, this.currentMeta);
    }

    currentMeta = {} as Meta;
    currentItem = {} as Item;
    handleClose = {}

    async componentDidUpdate() {
        if (this.props.meta) this.currentMeta = await TagUtils.getMeta(this.props.item)
    }

    handleChange = (name: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (name === 'fileType') this.currentMeta.fileType = event.target.value
        if (name === 'application') this.currentMeta.application = event.target.value
    };

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
                        fullScreen={false}
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="form-dialog-edit"
                        fullWidth={true} maxWidth={'sm'}
                        PaperProps={{
                            style: {
                                overflow: 'visible'
                            }
                        }}
                    >
                        <form>
                            <DialogTitle
                                id="form-dialog-edit">Editing TAGS: {this.currentItem.getDisplayName()}
                            </DialogTitle>
                            <DialogContent
                                style={{
                                    overflow: 'visible'
                                }}
                            >
                                <AutocompleteTag />

                                <FormControl>
                                    <InputLabel htmlFor="File type">File type</InputLabel>
                                    <Select
                                        native
                                        value={this.currentMeta.fileType}
                                        onChange={this.handleChange('fileType')}

                                    >
                                        <option value="" />
                                        <option value={10}>text-plain</option>
                                        <option value={20}>multipart/mixed</option>
                                        <option value={30}>image</option>
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <InputLabel htmlFor="Application">Application</InputLabel>
                                    <Select
                                        native
                                        value={this.currentMeta.application}
                                        onChange={this.handleChange('application')}

                                    >
                                        <option value="" />
                                        <option value={"Solidagram"}>Solidagram</option>
                                        <option value={"fb"}>Solid-fb</option>

                                    </Select>
                                </FormControl>
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
                </div >
            );
        } else return (null)
    }
}

interface StateProps extends DialogStateProps {
    meta: Meta
    item: Item
}

interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, meta: Meta): void;
}

interface EditTagsProps extends StateProps, DispatchProps { }

const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.EDITTAGS, // TODO: rename visibleDialogs (e.g. to dialogIsOpen)
        meta: state.metas.selected[0],
        item: state.items.selected[0]
    };
}

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {
    return {
        handleClose: () => {
            dispatch(closeDialog(DIALOGS.EDITTAGS));
        },
        handleSubmit: (event, meta) => {
            dispatch(updateMeta(meta));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
