import React, { Component } from 'react';
import { connect } from 'react-redux';

import List from "@material-ui/core/List";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { styled } from '@material-ui/styles';
import Checkbox from '@material-ui/core/Checkbox';

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


export class TagView extends Component<TagViewProps> {
    state = {
        loading: true
    };
    usedTags = [] as MetaTag[]
    selectedTags = [] as MetaTag[]

    componentDidMount() {
        TagUtils.getUsedTags()
            .then(foundTags => { this.usedTags = foundTags })
            .then(() => this.setState({ loading: false }))
    }

    handleCheck(metaTag: MetaTag, event: React.ChangeEvent<HTMLSelectElement>) {
        //event.preventDefault();
        const i: number = this.selectedTags.indexOf(metaTag)
        i !== -1
            ? this.selectedTags.splice(i, 1)
            : this.selectedTags.push(metaTag)
        this.props.handleSubmit(this.selectedTags);
    }

    render() {
        const loading = this.state.loading
        return (
            loading ? "Loading ..." : this.PrintList()
        )
    };

    PrintList = () => {
        return (
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
        )
    }
}



interface TagViewOwnProps {
}

interface StateProps {
    //loading: boolean
}

interface DispatchProps {
    handleSubmit(selectedTags: MetaTag[]): void;
}

interface TagViewProps extends TagViewOwnProps, StateProps, DispatchProps { }

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: MyDispatch, ownProps: TagViewOwnProps): DispatchProps => {
    return {
        handleSubmit: (selectedTags: MetaTag[]) => {
            dispatch(getMetaList(selectedTags));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagView);
