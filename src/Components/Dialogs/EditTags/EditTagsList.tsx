import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import SelectTagsList from './EditTag';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux';
import { updateTextFile, MyDispatch, closeDialog } from '../../../Actions/Actions';
import { DialogStateProps, DialogDispatchProps, DialogButtonClickEvent } from '../dialogTypes';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import { Item } from '../../../Api/Item';
import SolidFileClientUtils from '../../../Api/SolidFileClientUtils';
import TagUtils, { Tag } from '../../../Api/TagUtils';


class FormDialog extends Component<EditTagsProps> {
    constructor(props: EditTagsProps) {
        super(props);
        //this.myRef = React.createRef();
        this.itemHandleClick = this.itemHandleClick.bind(this)
    }

    //private textField: React.RefObject<HTMLTextAreaElement> = createRef();
    state = {
        lastBlobUrl: null as string | null,
        content: null as string | null,
        loading: false
    };

    async componentDidUpdate() {
        console.log (`this.currentItemTags ${this.currentItemTags}`)
        this.libraryTags = TagUtils.getLibraryTags(this.props.item)
        this.currentItemTags = await TagUtils.getCurrentItemTags(this.props.item)
        if (this.props.blobUrl !== this.state.lastBlobUrl) {
            this.setState({
                lastBlobUrl: this.props.blobUrl
            });
            this.setState({
                loading: true
            });

            this.props.blobUrl && fetch(this.props.blobUrl).then(r => {
                return r.text();
            }).then(t => {
                this.setState({
                    content: t
                });
                this.setState({
                    loading: false
                });
            });
        }
    }

    libraryTags = [] as Tag[];
    currentItemTags = [] as Tag[];
    currentItem = {} as Item;
    render() {
        console.log(`Starting render: ${this.currentItemTags.length}` )
        const { handleClose, open, item } = this.props;
        if (item) {
            this.currentItem = item
            const itemName = this.currentItem.getDisplayName()

            //if (this.currentItemTags.length === 0) this.currentItemTags = TagUtils.getCurrentItemTags(item)
            console.log(`Before return: ${this.currentItemTags.length}` )

            return (
                <div>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="form-dialog-edit"
                        fullWidth={true} maxWidth={'sm'}>
                        <form>
                            <DialogTitle id="form-dialog-edit">Editing TAGS: {itemName} </DialogTitle>
                            <DialogContent>
                                <SelectTagsList
                                    libraryTags={this.libraryTags}
                                    currentItemTags={this.currentItemTags}
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
        console.log(this.currentItemTags.length)
        for (var i = 0, len = this.currentItemTags.length; i < len; i++) {
            if (this.currentItemTags[i].tagType === tag.tagType
                && this.currentItemTags[i].value === tag.value) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            this.currentItemTags.push(tag);
        } else {
            this.currentItemTags.splice(index, 1);
        }
        //console.log(`in parent ${this.userTags}`)
    };

    //trigered by the select tag pane
    async handleSave(event: DialogButtonClickEvent) {
        event.preventDefault();

        let allTags: Tag[] = await TagUtils.getAllTags() as unknown as Tag[]

        // remove previous tags of the item
        allTags = allTags.filter(el => el.fileUrl !== this.currentItem.url);

        //Add new tags
        allTags.push(...this.currentItemTags)
        SolidFileClientUtils.FileClientupdateFile(
            TagUtils.getTagIndexFullPath(),
            JSON.stringify(allTags)
        )
        TagUtils.currentItemTags = this.currentItemTags
        TagUtils.allTags = allTags

    }
}

interface StateProps extends DialogStateProps {
    item: Item;
    blobUrl: string;
}
interface DispatchProps extends DialogDispatchProps {
    handleSubmit(event: DialogButtonClickEvent, { itemName, content }: { itemName: string, content: string }): void;
}
interface EditTagsProps extends StateProps, DispatchProps { }

const mapStateToProps = (state: AppState): StateProps => {
    return {
        open: state.visibleDialogs.EDITTAGS, // TODO: rename visibleDialogs (e.g. to dialogIsOpen)
        item: state.items.selected[0],
        blobUrl: state.blob || ''
    };
};

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {
    return {
        handleClose: () => {
            dispatch(closeDialog(DIALOGS.EDITTAGS));
        },
        handleSubmit: (event, { itemName, content }) => {
            dispatch(updateTextFile(itemName, content));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormDialog);
