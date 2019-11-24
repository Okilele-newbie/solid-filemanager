import React, { Component, createRef } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import SelectTagsList from './SelectTagsList';
import DialogTitle from '@material-ui/core/DialogTitle';
import { connect } from 'react-redux';
import { updateTextFile, MyDispatch, closeDialog } from '../../../Actions/Actions';
import { DialogStateProps, DialogDispatchProps, DialogButtonClickEvent } from '../dialogTypes';
import { AppState } from '../../../Reducers/reducer';
import { DIALOGS } from '../../../Actions/actionTypes';
import { Item } from '../../../Api/Item';

interface Tag {
    id: string,
    name: string,
    description: string
}

function getTags() {
    var json = {
        list: [
            {
                id: "key1",
                name: "name",
                description: "description of name"
            },
            {
                id: "key2",
                name: "nick",
                description: "description of nick"
            },
            {
                id: "key3",
                name: "title",
                description: "description of title"
            }
        ]
    }
    return json.list
}

class FormDialog extends Component<EditTagsProps> {
    constructor(props:EditTagsProps) {
        super(props);
        //this.myRef = React.createRef();
        this.itemHandleClick = this.itemHandleClick.bind(this)
    }

    selectedTags: string[] = []

    itemHandleClick(id: string) {
        var index = this.selectedTags.indexOf(id);
        if (index === -1) {
            this.selectedTags.push(id);
        } else {
            this.selectedTags.splice(index, 1);
        }
        console.log(`in parent ${this.selectedTags}`)
    };

    //private textField: React.RefObject<HTMLTextAreaElement> = createRef();
    state = {
        lastBlobUrl: null as string | null,
        content: null as string | null,
        loading: false
    };

    componentDidUpdate() {
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

    handleSave(event: DialogButtonClickEvent) {
        event.preventDefault();
        //const selectedTags = this.selectedTags;
        /*
        const textField = this.textField.current;
        const item = this.props.item;
        if (textField && item) {
            const content = textField.value;
            this.props.handleSubmit(event, {
                itemName: item.name,
                content
            });
        }
        */
    }

    render() {
        const allTags: Tag[] = getTags();
        const { handleClose, open, item } = this.props;
        const itemName = item ? item.getDisplayName() : 'No item selected';
        const textAreaStyle = {
            width: '100%',
            minHeight: '300px'
        };
        //const textArea = <textarea style={textAreaStyle} defaultValue={this.state.content || ''} ref={this.textField} />;

        return (
            <div>
                <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-edit" fullWidth={true} maxWidth={'sm'}>
                    <form>
                        <DialogTitle id="form-dialog-edit">Editing TAGS: {itemName} </DialogTitle>
                        <DialogContent>
                            <SelectTagsList
                                allTags={allTags}
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
