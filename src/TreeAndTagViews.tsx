import React, { Component } from 'react';
import { MuiThemeProvider as MaterialUI } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import TreeView from './Components/TreeView/TreeView';
import TagView from './Components/TagView/TagView';

import './App.css'

interface State {
    showTreeOrTag: boolean;
}

export default class TreeAndTagViews extends Component<{}, State> {

    state = {
        showTreeOrTag: false as boolean
    }

    onChange() {
        this.setState({
            showTreeOrTag: !this.state.showTreeOrTag
        });
    }

    render() {
        return (
            <div className="App">
                Switch
                <Switch
                    checked={this.state.showTreeOrTag}
                    onChange={() => { this.onChange() }}
                    value="Tree or tags"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />

                <div className="TreeAndTagViews">
                    {this.state.showTreeOrTag ? <TreeView /> : null}
                    {!this.state.showTreeOrTag ? <TagView /> : null}
                </div>
            </div>
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
