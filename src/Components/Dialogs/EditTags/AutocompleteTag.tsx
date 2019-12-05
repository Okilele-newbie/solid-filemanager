import React, { useState } from 'react';
import { Meta, MetaTag } from '../../../Api/TagUtils';
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
    value: string
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
                this.values.push({ 'label': tag.value, 'value': tag.value })
            })
        }
        return (
            <CreatableSelect
                className='react-select-container'
                classNamePrefix="react-select"
                options={this.state.suggests}
                value={this.values}
                isMulti
                onChange={this.handleSelect.bind(this)}
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

    //select/delete a tag
    handleSelect(tags: Io[]) {
        //tags : all tags
        //console.log(tags)
        if (tags !== null && tags[0] !== undefined) {
            this.props.meta.tags = []
            tags.map(tag => {
                this.props.meta.tags.push({ 'tagType': 'NamedTag', 'value': tag.value })
            })
        }
        this.forceUpdate()
    }

    //type a letter
    handleChange(str: string) {
        if (str !== "") {
            //"suggests: any[]) => {..." this is call back param for GetSuggestions, 
            //will be run vhen back
            CallJsonP((suggests: any[]) => {
                let retVal = [] as Io[]
                suggests[1].map((item: string) => {
                    let o: Io = { 'label': item, 'value': item }
                    retVal.push(o)
                })
                this.setState({ suggests: retVal })
            }
                , str);
        }
    }
}
