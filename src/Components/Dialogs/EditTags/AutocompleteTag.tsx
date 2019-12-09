import React from 'react';
import { Meta, MetaTag, zeroWidthSpace } from '../../../Api/TagUtils';
import CreatableSelect from 'react-select/creatable';
import CallJsonP from '../../../Api/jsonp';

interface PopupProps {
    meta: Meta
}
//Io: to handle data from JsonP
interface PopupState {
    suggests: Io[]
}

interface Io {
    label: string,
    value: string,
    published: boolean
}

class MultiValueLabel extends React.Component {
    red = {
        color: "red"
    };

    black = {
        color: "black"
    };

    tagHandleClick() {
        this.props.data.published = !this.props.data.published
        this.forceUpdate()
    }

    render() {
        const {
            children,
            data,
        } = this.props;

        const styles = {
            color: data.published ? 'red' : 'black'
        };

        return (
            <div id={data.value}
                style={styles}
                onClick={this.tagHandleClick.bind(this)}>
                {children}
            </div>

        )
    }
}


export default class AutocompleteTag extends React.Component<PopupProps, PopupState> {

    constructor(props: PopupProps) {
        super(props);
        this.state = {
            suggests: []
        };
    }

    values = [] as Io[];
    render() {
        this.values = []
        if (this.props.meta.tags !== undefined) {
            this.props.meta.tags.map(tag => {
                this.values.push({
                    'label': tag.value,
                    'value': tag.value,
                    'published': tag.published
                })
            })
        }
        return (
            <CreatableSelect
                components={{ MultiValueLabel }}
                className='react-select-container'
                classNamePrefix="react-select"
                options={this.state.suggests}
                value={this.values}
                isMulti
                onChange={this.handleChangeTagList.bind(this)}
                onInputChange={this.handleChange.bind(this)}
                textFieldProps={{
                    InputLabelProps: {
                        shrink: true
                    }
                }}
                {...{ ...this.props }}
            />

        )
    }

    //select/delete a tag on screen: update the list of tags of the current meta
    //which was set is in its props by EditTag
    //items: all tags on screen
    handleChangeTagList(items: Io[]) {
        if (items !== null && items[0] !== undefined) {
            this.props.meta.tags = []
            items.map(item => {
                this.props.meta.tags.push({
                    'tagType': 'NamedTag',
                    'value': item.value,
                    'published': item.published
                })
            })
        }
        this.forceUpdate()
    }

    //type a letter
    handleChange(str: string) {
        if (str !== "") {
            //"suggests: any[]) => {..." callback CallJsonP will run when done 

            CallJsonP((suggests: any[]) => {
                let retVal = [] as Io[]
                //suggests[1] creates a new Io
                suggests[1].map((item: string) => {
                    let o: Io = { 'label': item, 'value': item, 'published': false }
                    retVal.push(o)
                })
                this.setState({ suggests: retVal })
            }
                , str);
        }
    }
}
