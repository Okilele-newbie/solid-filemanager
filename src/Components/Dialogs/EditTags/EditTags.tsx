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
import TagUtils, { Meta } from '../../../Api/TagUtils';
import AutocompleteTag, { Io } from './AutocompleteTag'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class FormDialog extends Component<EditTagsProps> {

    //Init mandatory as render sn invoked on left click on item, even before Edit tag is choosed
    currentMeta = {} as Meta;
    currentItem = {} as Item;

    //Ref on <Autocomplete>
    autocompleteTag = {} as AutocompleteTag

    constructor(props: EditTagsProps) {
        super(props);
    }

    componentDidUpdate() {
        //currentMeta initialized (see previous) so test in a property
        const itemUrl = new URL(this.currentItem.getUrl())
        console.log(`currentMeta url: ${this.currentMeta.pathName}`)
        if (this.props.item
            && (
                this.currentMeta.hostName !== itemUrl.hostname
                || this.currentMeta.pathName !== itemUrl.pathname
            )) {
            this.currentItem = this.props.item as Item
            console.log(`read meta for ${this.currentItem.getUrl()}`)
            TagUtils.getOrInitMeta(this.currentItem)
                .then(response => {
                    this.currentMeta = response;
                })
        }
    }

    //Ultimate target is TagUtils.updateMeta
    handleSave(event: DialogButtonClickEvent) {
        event.preventDefault();
        //Get data from Autocomplete component
        if (this.currentMeta.tags !== null) {
            this.currentMeta.tags = []
            this.autocompleteTag.values.map((item: Io) => {
                this.currentMeta.tags.push({
                    'tagType': 'NamedTag',
                    'value': item.value,
                    'published': item.published
                })
            })
        }
        //TagUtils.updateMeta(this.currentMeta)
        this.props.handleSubmit(event, this.currentMeta);
        this.setState({item: null})
    }

    handleClose = {}

    //all changes on fields, filter by name (actually one, mimeType)
    handleChange = (name: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (name === 'mimeType') this.currentMeta.mimeType = event.target.value
        this.forceUpdate()
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
                                style={{ overflow: 'visible' }}
                            >
                                <AutocompleteTag
                                    meta={this.currentMeta}
                                    ref={(autocompleteTag) => { this.autocompleteTag = autocompleteTag }} />

                                {this.currentMeta && this.currentMeta.pathName && this.currentMeta.pathName.split('.').length > 1 ? (
                                    <div><br />
                                        File has no extension, enter file type:&nbsp;
                                            <FormControl>

                                            <Select
                                                native
                                                value={this.currentMeta.mimeType}
                                                onChange={this.handleChange('mimeType')}
                                            >
                                                <option value="" />
                                                <option value={'text-plain'}>text-plain</option>
                                                <option value={'multipart/mixed'}>mixed</option>
                                                <option value={'image/jpeg}'}>image</option>
                                            </Select>
                                        </FormControl>
                                    </div>
                                ) : null}
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
