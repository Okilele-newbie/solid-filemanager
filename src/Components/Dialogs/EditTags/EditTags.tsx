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
import MetaUtils, { Meta, MetaTag } from '../../../Api/MetaUtils';
import AutocompleteTag from './AutocompleteTag'
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class FormDialog extends Component<EditTagsProps> {

    constructor(props: any) {
        super(props)
        this.setSaveButtonText = this.setSaveButtonText.bind(this)
    }

    //sent to TreeViewItem for expand/collapse handled here
    setSaveButtonText(saveTextLevel: number) {
        if (saveTextLevel === 1) this.saveButtonText = 'Save all to local'
        if (saveTextLevel === 2) this.saveButtonText = 'Save all to local and some to central'
        if (saveTextLevel === 3) this.saveButtonText = 'Save all to local and central'
        this.setState({ saveText: this.saveButtonText });
    };

    //Init mandatory as render sn invoked on left click on item, even before Edit tag is choosed
    currentMeta = {} as Meta;
    saveButtonText = ''

    componentDidUpdate() {

    }

    //target function is MetaUtils.updateMeta
    handleSave(event: DialogButtonClickEvent) {
        event.preventDefault();
        //cleanup new tags created with autocomplete properties (label and source)
        let cleanedTags = [] as MetaTag[]
        if (this.currentMeta.tags) {
            this.currentMeta.tags.forEach(tag => {
                cleanedTags.push({ 'tagType': 'FreeTag', 'value': tag.value, published: tag.published })
            })
        }
        this.currentMeta.tags = cleanedTags
        this.props.handleSubmit(event, this.currentMeta);
        this.setState({ item: null })
        MetaUtils.allLocalMetas = []
    }

    handleClose = {}

    //changes on mimeType
    handleChange = (name: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (name === 'mimeType') this.currentMeta.mimeType = event.target.value
        this.forceUpdate()
    };

    render() {
        if (this.props.item) {
            MetaUtils.getOrInitMeta(this.props.item)
                .then(response => {
                    this.currentMeta = response;
                })
        }
        //handle close: Rdux, sent by store
        const { handleClose, open, item } = this.props;

        if (item) {
            //this.currentItem = item
            this.handleClose = handleClose
            let extension = '' as string
            if (this.currentMeta && this.currentMeta.pathName) {
                const spl = this.currentMeta.pathName.split('.') as string[]
                if (spl.length > 1) extension = spl[1]
            }

            return (
                <div id='1'>
                    <Dialog id='2'
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
                        <form id='3 '>
                            <DialogTitle
                                id="form-dialog-edit">Editing TAGS : {item.getDisplayName()}
                            </DialogTitle>
                            <DialogContent
                                style={{ overflow: 'visible' }}
                            >
                                <AutocompleteTag
                                    meta={this.currentMeta}
                                    setSaveButtonText={this.setSaveButtonText}
                                />

                                {extension === ''
                                    ? (
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
                                    ) : (<div><br />Extension file : {extension}</div>)}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary" type="button">
                                    Close
                                </Button>
                                <Button color="primary" onClick={this.handleSave.bind(this)} type="submit">
                                    {this.saveButtonText}
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
    saveText: string
}

interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, meta: Meta): void;
}

interface EditTagsProps extends StateProps, DispatchProps { }

const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.EDITTAGS, // TODO: rename visibleDialogs (e.g. to dialogIsOpen)
        meta: state.metas.selected[0],
        item: state.items.selected[0],
        saveText: ''
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
