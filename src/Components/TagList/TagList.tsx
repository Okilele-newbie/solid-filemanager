import React, { Component } from 'react';
import { connect } from 'react-redux';

import List from "@material-ui/core/List";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { styled } from '@material-ui/styles';
import Checkbox from '@material-ui/core/Checkbox';
import AntSwitch from '@material-ui/core/Switch';

import { getMetaList, MyDispatch } from '../../Actions/Actions';
import TagUtils, { MetaTag, onServerColor } from '../../Api/TagUtils'
import lodash from 'lodash'

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

export class TagList extends Component<TagListProps> {

    state = {
        loading: true,
    };

    sources = {
        local: true,
        central: false
    };

    usedTags = [] as MetaTag[]
    selectedTags = [] as MetaTag[]

    componentDidMount() {
        this.refreshView()
    }

    refreshView() {
        console.log('2 ' + this.state)
        let count = 0
        this.usedTags = [] as MetaTag[]
        if (this.sources.local) {
            count--
            TagUtils.getLocalUsedTags(this.sources.central)
                .then(foundTags => {
                    this.usedTags.push(...foundTags as MetaTag[]);
                    count++
                    if (count === 0) {
                        this.setState({ loading: false })
                    }
                })
        }

        if (this.sources.central) {
            count--
            TagUtils.getCentralUsedTags()
                .then(foundTags => {
                    if (foundTags !== undefined) {
                        this.usedTags.push(...foundTags as MetaTag[]);
                        count++
                        if (count === 0) {
                            this.setState({ loading: false })
                        }
                    }
                })
        }
    }

    //check a tag to get associated files
    handleCheck(metaTag: MetaTag, event: React.ChangeEvent<HTMLInputElement>) {
        //event.preventDefault();
        const i: number = this.selectedTags.indexOf(metaTag)
        i !== -1
            ? this.selectedTags.splice(i, 1)
            : this.selectedTags.push(metaTag)
        this.props.handleSubmit(this.selectedTags);
    }

    handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.sources = ({ ...this.sources, [name]: event.target.checked });
        this.setState({checkedLocal: true})
        this.setState({ loading: true })
        this.refreshView()
    };

    render() {
        //console.log(this.usedTags)
        return (
            <div>
                Local
                <AntSwitch
                    checked={this.sources.local}
                    onChange={this.handleChange('local')}
                    value="checkedL"
                    color="primary"
                />
                <br/>
                Central
                <AntSwitch
                    checked={this.sources.central}
                    onChange={this.handleChange('central')}
                    value="checkedC"
                    color="primary"
                />
                {this.state.loading ? "Loading ..." : this.PrintList()}
            </div>
        )

    };

    PrintList = () => {
        if (!this.state.loading) {
            this.usedTags = lodash.sortBy(this.usedTags, ['tagType', 'value']);
            return (
                < MyList className='leftPane' >
                    {this.usedTags.map(tag => {
                        const itemColor = {
                            color: tag.published ? onServerColor : 'black'
                        };
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
                                <MyListItemText id={tag.value} >
                                    <span style={itemColor}>{`${tag.value}`}</span>
                                </MyListItemText>
                            </MyListItem>
                        )
                    })
                    }
                </MyList >
            )
        }
        console.log('8 ' + this.state)

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
