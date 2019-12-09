import React, { Component } from 'react';
import { connect } from 'react-redux';

import List from "@material-ui/core/List";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { styled } from '@material-ui/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';

import { getMetaList, MyDispatch } from '../../Actions/Actions';
import TagUtils, { MetaTag } from '../../Api/TagUtils'

const MyList = styled(List)({
    minWidth: 'max-content'
});

const MyListItem = styled(ListItem)({
    padding: '0 0 0 10px'
});

const MyListItemText = styled(ListItemText)({
    fontSize: '0.9em',
    padding: '0 0 0 0'
});


const MyCheckbox = styled(Checkbox)({
    padding: '0 0 0 0'
});

export class TagList extends Component<TagListProps> {
    constructor(props: any) {
        super(props)
        this.callBackFromTagUtilsGetUsedTags = this.callBackFromTagUtilsGetUsedTags.bind(this)
    }

    state = {
        loading: true,
        localOrCentral: true //true => local
    };
    usedTags = [] as MetaTag[]
    selectedTags = [] as MetaTag[]
    localOrCentral = true as boolean


    componentDidMount() {
        this.refreshView()
    }

    refreshView() {
        this.setState({ loading: true })
        TagUtils.getUsedTags(this.localOrCentral, this.callBackFromTagUtilsGetUsedTags)
            //for tags from local
            .then(foundTags => {
                this.usedTags = foundTags as MetaTag[];
                if (this.localOrCentral) this.setState({ loading: false })
            })
    }

    callBackFromTagUtilsGetUsedTags(foundTags: MetaTag[]) {
        this.usedTags = foundTags
        this.setState({ loading: false })
    }

    handleCheck(metaTag: MetaTag, event: React.ChangeEvent<HTMLInputElement>) {
        //event.preventDefault();
        const i: number = this.selectedTags.indexOf(metaTag)
        i !== -1
            ? this.selectedTags.splice(i, 1)
            : this.selectedTags.push(metaTag)
        this.props.handleSubmit(this.selectedTags);
    }

    onChange() {
        this.localOrCentral = !this.localOrCentral;
        this.refreshView()
    }

    render() {
        console.log(this.usedTags)

        return (
            this.state.loading ? "Loading ..." : this.PrintList()
        )
    };

    PrintList = () => {
        return (
            <div>
                Tags origin: Local&nbsp;
            <Switch
                    checked={this.state.localOrCentral}
                    onChange={() => { this.onChange() }}
                    value="Tree"
                    color="default"
                />
                Central
            <MyList
                    className='leftPane'>
                    {this.usedTags.map(tag => {
                        //const key = `${tag.tagType}-${tag.value}`
                        //const labelId = `checkbox-list-label-${key}`;
                        return (
                            <MyListItem
                                key={tag.value}
                                role={undefined}
                                dense button
                            >
                                <MyCheckbox
                                    color="primary"
                                    onChange={e => this.handleCheck(tag, e)}
                                />
                                <MyListItemText
                                    id={tag.value}
                                >
                                    {`${tag.value}`}

                                </MyListItemText>
                            </MyListItem>
                        )
                    })}
                </MyList>
            </div>
        )
    }
}



interface TagListOwnProps {
}

interface StateProps {
    //loading: boolean
}

interface DispatchProps {
    handleSubmit(selectedTags: MetaTag[]): void;
}

interface TagListProps extends TagListOwnProps, StateProps, DispatchProps { }

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: MyDispatch, ownProps: TagListOwnProps): DispatchProps => {
    return {
        handleSubmit: (selectedTags: MetaTag[]) => {
            dispatch(getMetaList(selectedTags));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagList);
