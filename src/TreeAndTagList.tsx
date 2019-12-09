import React, { Component } from 'react';
import Switch from '@material-ui/core/Switch';
import TreeView from './Components/TreeView/TreeView';
import TagList from './Components/TagList/TagList';
import FileList from './Components/FileList/FileList';
import MetaList from './Components/Meta/MetaList';

import './App.css'

interface State {
    showTreeOrTag: boolean;
}

export default class TreeAndTagList extends Component<{}, State> {

    state = {
        showTreeOrTag: true as boolean
    }

    onChange() {
        this.setState({
            showTreeOrTag: !this.state.showTreeOrTag
        });
    }

    render() {
        return (
            <div className="App">
                Tags
                <Switch
                    checked={this.state.showTreeOrTag}
                    onChange={() => { this.onChange() }}
                    value="Tree"
                    color="default"
                />
                Tree
                {this.state.showTreeOrTag ?
                    <div className='bodyPlace'>
                        <div className='leftView'><TreeView /></div>
                        <FileList />
                    </div>
                    :
                    <div className='bodyPlace'>
                        <div className='leftView'><TagList /></div>
                        <MetaList />
                    </div>
                }
            </div >
        );
    }
}
