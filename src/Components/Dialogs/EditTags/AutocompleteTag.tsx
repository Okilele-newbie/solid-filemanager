import React, { useState } from 'react';
import { Meta, MetaTag } from '../../../Api/TagUtils';
import CreatableSelect from 'react-select/creatable';

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
            this.GetSuggestions((suggests: any[]) => {
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

    /*
        GetSuggestions = (callback1: { (param: string[]): void }, searchedString: string) => {
            const autoComplete = `http://suggestqueries.google.com/complete/search?client=firefox&q=${searchedString}`
            //callback1 : param as function to run when done
            this.jsonp(
                autoComplete,
                (response: string[]) => callback1(response)
            );
        }
    */
    GetSuggestions = (callback1: { (param: string[]): void }, searchedString: string) => {
        //const autoComplete = `http://127.0.0.1:5984/solidfilemanager/"006" -d"{\"test\":\"true\"}"`
        const autoComplete = `http://suggestqueries.google.com/complete/search?client=firefox&q=${searchedString}`

        this.makeCorsRequest(autoComplete)
    }
    //{ (param: string[]): {} }) => {
    jsonp = (url: string, callback2: { (param: string[]): void }) => {
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

    //------------------------------------------
    // Make the actual CORS request.
    makeCorsRequest(url: string) {
        // This is a sample server that supports CORS.
        var url = 'http://html5rocks-cors.s3-website-us-east-1.amazonaws.com/index.html';

        var xhr = this.createCORSRequest('GET', url);
        if (!xhr) {
            alert('CORS not supported');
            return;
        }

        // Response handlers.
        xhr.onload = function () {
            var text = xhr.responseText;
            var title = this.getTitle(text);
            alert('Response from CORS request to ' + url + ': ' + title);
        };

        xhr.onerror = function () {
            alert('Woops, there was an error making the request.');
        };

        xhr.send();
    }

    // Create the XHR object.
    createCORSRequest(method: string, url: string) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);
        //} else if (typeof XDomainRequest != "undefined") {
            // XDomainRequest for IE.
            //xhr = new XDomainRequest();
            //xhr.open(method, url);
        } else {
            // CORS not supported.
            xhr = null;
        }
        return xhr;
    }

    // Helper method to parse the title tag from the response.
    getTitle(text:string) {
        return text.match('<title>(.*)?</title>')[1];
    }
}
