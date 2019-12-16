import React, { Component } from 'react';
import Switch from '@material-ui/core/Switch';
import TreeView from './Components/TreeView/TreeView';
import TagList from './Components/TagList/TagList';
import FileList from './Components/FileList/FileList';
import MetaList from './Components/Meta/MetaList';

import './TreeAndTagList.css'


export default class TreeAndTagList extends Component<{}> {

    state = {
        showTreeOrTag: true
    }

    onChange() {
        this.setState({
            showTreeOrTag: !this.state.showTreeOrTag
        });
    }

    render() {
        return (
            <div>
                <div className='treeAndTagHeader'>
                    Tags
                    <Switch
                        checked={this.state.showTreeOrTag}
                        onChange={() => { this.onChange() }}
                        color="default"
                    />
                    Tree
                </div>
                <div>
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
            </div>
        );
    }
}
