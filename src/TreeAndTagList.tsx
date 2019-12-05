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
                        <TreeView />
                        <FileList />
                    </div>
                    :
                    <div className='bodyPlace'>
                        <TagList />
                        <MetaList />
                    </div>
                }
            </div >
        );
    }
}

/*
interface DispatchProps {
    init(): void;
    handleHideContextMenu(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}

interface AppProps extends DispatchProps { }

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: MyDispatch): DispatchProps => {
    return {
        init: () => {
            dispatch(initApp());
        },

        handleHideContextMenu: (event) => {
            const element = event.target as HTMLElement;
            if (!(element.tagName === 'INPUT' || /label/i.test(element.className))) {
                event.preventDefault();
            }
            dispatch(closeContextMenu());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
*/
