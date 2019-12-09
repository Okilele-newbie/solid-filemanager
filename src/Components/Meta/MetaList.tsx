import React, { Component } from 'react';
import { connect } from 'react-redux';
import MetaRow from './MetaRow'; 
import FileListEmptyMessage from './MetaListEmptyMessage';
import Loader from '../Loader/Loader'; 
//import { getMetaList} from '../../Actions/Actions';
import './Meta.css';
import { Meta } from '../../Api/TagUtils';
import { AppState } from '../../Reducers/reducer';
import './Meta.css';

class MetaList extends Component<MetaListProps> {
    render() {
        const { metas, isLoading } = this.props;
        const itemComponents = metas.map((meta, key) => {
            return <MetaRow 
                key ={meta.hostName + meta.pathName}
                meta={meta}  />;
        });

        return <div className="MetaList">
            { isLoading ? 
                <Loader /> : 
                itemComponents.length ? itemComponents : <FileListEmptyMessage />
            }
        </div>
    }
}

interface StateProps {
    metas: Meta[];
    isLoading: boolean;
}
interface MetaListProps extends StateProps {};

const mapStateToProps = (state: AppState): StateProps => {
    const metas = state.metas.inCurFolder
        .filter(meta => filterMatch(meta.hostName + meta.pathName, state.metas.filter));

    return {
        metas,
        isLoading: state.loading,
    };
};


const mapDispatchToProps = () => ({});

const filterMatch = (first: string, second: string) => {
    return first.toLocaleLowerCase().match(second.toLocaleLowerCase());
}

export default connect(mapStateToProps, mapDispatchToProps)(MetaList);


