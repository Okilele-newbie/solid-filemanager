import React, { Component } from 'react';
import { connect } from 'react-redux';

import List from "@material-ui/core/List";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
//import { styled } from '@material-ui/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';

import { getMetaList, MyDispatch } from '../../Actions/Actions';
import MetaUtils, { MetaTag, onServerColor } from '../../Api/MetaUtils'
import lodash from 'lodash'

/*
const MyList = styled(List)({
    minWidth: 'max-content'
});

const MyListItem = styled(ListItem)({
    padding: '0 0 0 10px'
});

const MyListItemText = styled(ListItemText)({
    fontSize: '0.9em',
    padding: '0 0 0 0',
});

const MyCheckbox = styled(Checkbox)({
    padding: '0 0 0 0'
});
*/

export class TagList extends Component<TagListProps> {

    usedTags = [] as MetaTag[]
    selectedTags = [] as MetaTag[]

    state = {
        showLocalOrCentral: true,
        loading: true
    }

    componentDidMount() {
        this.setState({showLocalOrCentral: false})
        this.refreshView();
    };

    refreshView() {
        this.usedTags = [] as MetaTag[]
        if (this.state.showLocalOrCentral) {
            MetaUtils.getLocalUsedTags()
                .then(foundTags => {
                    this.usedTags.push(...foundTags as MetaTag[]);
                    this.setState({ loading: false })
                })
        }

        if (!this.state.showLocalOrCentral) {
            MetaUtils.getCentralUsedTags()
                .then(foundTags => {
                    if (foundTags !== undefined) {
                        this.usedTags.push(...foundTags as MetaTag[]);
                        this.setState({ loading: false })
                    }
                })
        }
    }

    //Select a tag to load related Metas. Target is MetaUtils.getLocalMetaList
    handleClick(metaTag: MetaTag) {
        //event.preventDefault();
        const i: number = this.selectedTags.indexOf(metaTag)
        i !== -1
            ? this.selectedTags.splice(i, 1)
            : this.selectedTags.push(metaTag)
        this.props.handleSubmit(this.selectedTags, this.state.showLocalOrCentral);
        this.forceUpdate() //CheckBox update
    }
    

    //local/central
    onChange() {
        this.selectedTags = []
        this.setState({ showLocalOrCentral: !this.state.showLocalOrCentral });
        this.setState({ loading: true })
        this.refreshView()
    }

    render() {
        return (
            <div>
                <div>
                    Local
                    <Switch
                        checked={this.state.showLocalOrCentral}
                        onChange={() => { this.onChange() }}
                        color="default"
                    />
                    Central
                </div>
                {this.state.loading ? "Loading ..." : this.PrintList()}
            </div>
        )
    };

    PrintList = () => {
        if (!this.state.loading) {
            this.usedTags = lodash.sortBy(this.usedTags, ['tagType', 'value']);
            return (
                < List style={{minWidth: 'max-content'}} className='leftPane' >
                    {this.usedTags.map(tag => {
                        const itemColor = {
                            color: tag.published ? onServerColor : 'black'
                        };
                        return (
                            <ListItem style={{ padding: '0 0 0 10px'}}
                                key={tag.value}
                                role={undefined}
                                dense button
                            >
                                <Checkbox style={{ padding: '0 0 0 0'}}
                                    color="primary"
                                    onChange={e => this.handleClick(tag)}
                                    checked={this.selectedTags.find(elt => tag === elt) !== undefined}
                                />
                                <ListItemText style={{ padding: '0 0 0 0'}}
                                    id={tag.value}
                                    onClick={e => this.handleClick(tag)}>
                                    <span style={itemColor}>{`${tag.tagType}: ${tag.value}`}</span>
                                </ListItemText>
                            </ListItem>
                        )
                    })
                    }
                </List >
            )
        }
    }
}



interface TagListOwnProps {
}

interface StateProps {
    //loading: boolean
}

interface DispatchProps {
    handleSubmit(selectedTags: MetaTag[], showLocalOrCentral: boolean): void;
}

interface TagListProps extends TagListOwnProps, StateProps, DispatchProps { }

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: MyDispatch, ownProps: TagListOwnProps): DispatchProps => {
    return {
        handleSubmit: (selectedTags: MetaTag[], showLocalOrCentral: boolean) => {
            dispatch(getMetaList(selectedTags, showLocalOrCentral));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagList);
