import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import SelectTagsList from './EditTag';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux';
import { updateMeta, MyDispatch, closeDialog } from '../../../Actions/Actions';
import { DialogStateProps, DialogDispatchProps, DialogButtonClickEvent } from '../dialogTypes';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import { Item } from '../../../Api/Item';
import TagUtils, { Tag, Meta, MetaTag } from '../../../Api/TagUtils';


class FormDialog extends Component<EditTagsProps> {
    constructor(props: EditTagsProps) {
        super(props);
        this.itemHandleClick = this.itemHandleClick.bind(this)
    }

    //private textField: React.RefObject<HTMLTextAreaElement> = createRef();
    state = {
        //lastBlobUrl: null as string | null,
        //content: null as string | null,
        //loading: false
    };

    libraryTags = [] as Tag[];
    currentItemMeta = {} as Meta;
    currentItem = {} as Item;
    handleClose = {}

    async componentDidUpdate() {
        if (this.props.item) this.currentItemMeta = await TagUtils.getMeta(this.props.item)
    }

    render() {
        this.libraryTags = TagUtils.getLibraryTags()
        //console.log(`Starting render: ${this.currentItemTags.length}` )
        const { handleClose, open, item } = this.props;
        //console.log(handleClose)
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
                                <SelectTagsList
                                    libraryTags={this.libraryTags}
                                    currentMeta={this.currentItemMeta}
                                    itemHandleClick={this.itemHandleClick}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary" type="button">
                                    Close
                            </Button>
                                <Button color="primary" onClick={this.handleSave.bind(this)} type="submit">
                                    Update
                            </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                </div>
            );
        } else return (null)
    }

    //Sent to select tag pane and used here
    itemHandleClick(tag: Tag) {
        //var index = this.userTags.indexOf(tag);
        var index = -1;
        console.log(this.currentItemMeta.tags.length)
        for (var i = 0, len = this.currentItemMeta.tags.length; i < len; i++) {
            if (this.currentItemMeta.tags[i].tagType === tag.tagType
                && this.currentItemMeta.tags[i].value === tag.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            const metaTag: MetaTag = {
                tagType: tag.tagType,
                value: tag.value
            }
            this.currentItemMeta.tags.push(metaTag);
        } else {
            this.currentItemMeta.tags.splice(index, 1);
        }
    };

    //trigered by the select tag pane
    handleSave(event: DialogButtonClickEvent) {
        event.preventDefault();
        //TagUtils.updateMeta(this.currentItemMeta)
        const meta = this.currentItemMeta
        this.props.handleSubmit(event, { meta });
    }
}

interface StateProps extends DialogStateProps {
    item: Item;
    //blobUrl: string;
}
interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, { meta }: { meta: Meta }): void;
}
interface EditTagsProps extends StateProps, DispatchProps { }

const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.EDITTAGS, // TODO: rename visibleDialogs (e.g. to dialogIsOpen)
        item: state.items.selected[0],
        //blobUrl: state.blob || ''
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
