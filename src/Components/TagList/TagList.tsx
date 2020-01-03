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

export class TagList extends Component<TagListProps> {

    usedTags = [[]] as MetaTag[][]
    selectedTags = [[]] as MetaTag[][]

    localOrCentral = true as boolean
    LC = 0 as number

    //showLocal(true)OrCentral(false)
    state = {
        localOrCentral: true,
        loading: true
    }

    componentDidMount() {
        this.setState({ localOrCentral: true })
        this.selectedTags[0] = []
        this.selectedTags[1] = []
        this.refreshView();
    };

    refreshView() {
        MetaUtils.getUsedTags(this.LC)
            .then(foundTags => {
                this.usedTags[this.LC] = foundTags;
                this.setState({ loading: false })
            })
        this.props.handleSubmit(this.selectedTags[this.LC], this.localOrCentral);

    }

    //Select a tag to load related Metas. Target is MetaUtils.getMetaList
    handleClick(metaTag: MetaTag) {
        //event.preventDefault();
        const i: number = this.selectedTags[this.LC].indexOf(metaTag)
        i !== -1
            ? this.selectedTags[this.LC].splice(i, 1)
            : this.selectedTags[this.LC].push(metaTag)
        this.props.handleSubmit(this.selectedTags[this.LC], this.localOrCentral);
        this.forceUpdate() //CheckBox update
    }


    //local/central
    onChange() {
        this.localOrCentral = !this.localOrCentral
        this.setState({ localOrCentral: this.localOrCentral });
        this.LC = this.localOrCentral ? 0 : 1
        this.setState({ loading: true })
        this.refreshView()
    }

    render() {
        return (
            <div>
                <div>
                    Local
                    <Switch
                        checked={!this.localOrCentral}
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
            return (
                < List style={{ minWidth: 'max-content' }} className='leftPane' >
                    {this.usedTags[this.LC].map(tag => {
                        const itemColor = {
                            color: tag.published ? onServerColor : 'black'
                        };
                        return (
                            <ListItem style={{ padding: '0 0 0 10px' }}
                                key={tag.value}
                                role={undefined}
                                dense button
                            >
                                <Checkbox style={{ padding: '0 0 0 0' }}
                                    color="primary"
                                    onChange={e => this.handleClick(tag)}
                                    checked={this.selectedTags[this.LC].find(elt => tag === elt) !== undefined}
                                />
                                <ListItemText style={{ padding: '0 0 0 0' }}
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
    handleSubmit(selectedTags: MetaTag[], localOrCentral: boolean): void;
}

interface TagListProps extends TagListOwnProps, StateProps, DispatchProps { }

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: MyDispatch, ownProps: TagListOwnProps): DispatchProps => {
    return {
        handleSubmit: (selectedTags: MetaTag[], localOrCentral: boolean) => {
            dispatch(getMetaList(selectedTags, localOrCentral));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TagList);
