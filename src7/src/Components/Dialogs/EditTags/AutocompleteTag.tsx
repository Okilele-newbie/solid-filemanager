import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
//import './CreatableSelect.css'
interface PopupProps {
}

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
        this.handleChange = this.handleChange.bind(this);
        //this.itemHandleClick = this.itemHandleClick.bind(this)
    }
    //classes = useStyles();
    //const [value, setValue] = useState(null);
    render() {
        console.log(this.state.suggests)
        return (
            <CreatableSelect
            className = 'react-select-container'
            classNamePrefix="react-select"
                options={this.state.suggests}
                isMulti
                onChange={this.handleSelect}
                onInputChange={this.handleChange}
                textFieldProps={{
                    InputLabelProps: {
                        shrink: true
                    }
                }}
                {...{ ...this.props }}
            />

        )
    }

    handleSelect(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        console.log(event)
    }


    handleChange(str: string) {
        if (str !== "") {
            this.setState({ suggests: [] });
            //(suggests: string[]) => {... = callback = function run when back
            this.GetSuggestions((suggests: any[]) => {
                let retVal = [] as Io[]
                suggests[1].map((item: string) => {
                    let o: Io = { 'label': item, 'value':item}
                    retVal.push( o )
                })
                this.setState({ suggests: retVal })
            }
                , str);
        }
    }

    GetSuggestions = (callback1: { (param: string[]): void }, searchedString: string) => {
        //callback1 : function to run when done, with 'response' as param
        this.jsonp(
            `http://suggestqueries.google.com/complete/search?client=firefox&q=${searchedString}`,
            (response: string[]) => callback1(response)
        );
    }
 //{ (param: string[]): {} }) => {
    jsonp = (url: string, callback2: { (param: string[]): void } ) => {
        //callback2 = from callback1 "(response: []) => callback1(response)". Translation: "return callback1(response)"
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random()) as any;
        //console.log(`callback 2${callback2}`)
        window[callbackName] = function (data: string[]) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback2(data);
        };

        var script = document.createElement('script');
        script.src =
            url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        document.body.appendChild(script);
    };
}
