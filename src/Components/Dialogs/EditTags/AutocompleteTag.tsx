import React from 'react';
import MetaUtils, { Meta, MetaTag, onServerColor } from '../../../Api/MetaUtils';
import CreatableSelect from 'react-select/creatable';
import CallJsonP from '../../../Api/jsonp';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
//import { styled } from '@material-ui/styles';
import './Autocomplete.css'

interface MultiValueLabelProps {
    children: {},
    data: MetaTag
}

//Each tag is a MultiValueLabel in Autocomplete componennt
class MultiValueLabel extends React.Component<MultiValueLabelProps> {
    //Click a tag to publish it
    tagHandleClick() {
        this.props.data.published = !this.props.data.published
        this.forceUpdate()
    }

    render() {
        const { data } = this.props;
        const styles = {
            color: data.published ? onServerColor : 'black'
        };

        return (
            <div id={data.value}
                style={styles}
                onClick={this.tagHandleClick.bind(this)}>
                {data.tagType}: {data.value}
            </div>
        )
    }
}

interface PopupProps {
    [x: string]: any,
    meta: Meta,
    setSaveButtonText(saveTextLevel: number): void;
}

interface PopupState {
    suggests: Suggestion[]
}
//Suggestions (options in component) need label additional property
interface ISuggestion extends MetaTag {
    label: string
}

class Suggestion {
    tagType: string
    value: string
    published: boolean
    label: string

    constructor(text: string) {
        this.tagType = 'FreeTag'
        this.value = text;
        this.published = false;
        this.label = text;
    }
}

export default class AutocompleteTag extends React.Component<PopupProps, PopupState> {

    constructor(props: PopupProps) {
        super(props);
        this.state = { suggests: [] };
        this.creatableSelect = React.createRef();
        this.focusCreatableSelect = this.focusCreatableSelect.bind(this);
    }

    creatableSelect = {} as React.RefObject<PopupProps>
    source = 'local'
    lastStr = ''

    focusCreatableSelect() {
        if (this.creatableSelect.current) this.creatableSelect.current.focus();
    }

    componentDidMount() {
        this.focusCreatableSelect()
    }

    //select a suggestion or delete a tag: items parameter is the list of ALL selected values
    handleChangeTagList(items: Suggestion[]) {
        if (items) {
            for (var i = 0; i < items.length; i++) {
                if (!(items[i] instanceof Suggestion)) {
                    items[i] = new Suggestion(items[i].label)
                }
            }
        }
        this.props.meta.tags = items
        this.setSaveButtonText()
        this.forceUpdate()
    }

    //Called from here when modifying the list of tags and send to parent
    setSaveButtonText() {
        let saveTextLevel = 0
        if (this.props.meta.tags) {
            this.props.meta.tags.forEach((tag) => {
                if (saveTextLevel === 0) {
                    if (tag.published) saveTextLevel = 3
                    if (!tag.published) saveTextLevel = 1
                }
                if ((saveTextLevel === 1 && tag.published)
                    || (saveTextLevel === 3 && !tag.published)) {
                    saveTextLevel = 2
                }
            })
        }
        this.props.setSaveButtonText(saveTextLevel)
    }

    //Change source of suggestions for tags
    handleRadioChange = (event: React.ChangeEvent<{}>, value: string) => {
        this.source = value
        this.handleChange(this.lastStr)
        this.forceUpdate()
    };

    //type a letter. items in suggestions are Metatag
    handleChange(str: string) {
        if (str !== "") {
            this.lastStr = str
            let retVal = [] as Suggestion[]
            if (this.source === 'google') {
                CallJsonP((suggests: any[]) => {
                    //suggests[1] creates a new Io
                    suggests[1].forEach((item: string) => {
                        //const suggestion: Suggestion = { 'tagType': 'FreeTag', 'value': item, published: false, 'label': item }
                        const suggestion = new Suggestion(item)
                        retVal.push(suggestion)
                    })
                    this.setState({ suggests: retVal })
                }
                    , str);
            }

            if (this.source === 'local') {
                MetaUtils.getLocalUsedTags()
                    .then((foundTags: MetaTag[]) => {
                        foundTags.forEach(tag => {
                            //const suggestion: Suggestion = { 'tagType': 'FreeTag', 'value': tag.value, published: false, 'label': tag.value }
                            const suggestion = new Suggestion(tag.value)
                            retVal.push(suggestion);
                        })
                        this.setState({ suggests: retVal })
                    })
            }

            if (this.source === 'central') {
                MetaUtils.getCentralUsedTags()
                    .then((foundTags: MetaTag[]) => {
                        foundTags.forEach(tag => {
                            //const suggestion: Suggestion = { 'tagType': 'FreeTag', 'value': tag.value, published: false, 'label': tag.value }
                            const suggestion = new Suggestion(tag.value)
                            retVal.push(suggestion);
                        })
                        this.setState({ suggests: retVal })
                    })
            }
        }
        //Also trigered when clikcing on item to make it published/not
        this.setSaveButtonText()
    }

    //set all to published
    selectAllToCentral(event: React.ChangeEvent<HTMLInputElement>) {
        this.props.meta.tags.forEach((tag) => {
            tag.published = event.target.checked
        })
        this.setSaveButtonText()
        this.forceUpdate()
    }

    render() {
        return (
            <div className='bodyPlace'>
                <div className='leftplace'>
                    <FormControl>
                        <RadioGroup aria-label="gender" value={this.source} onChange={this.handleRadioChange}>
                            <FormControlLabel value="local" control={<Radio color="primary" style={{ padding: '0 20px 5px 0px' }} />} label="Local" labelPlacement="start" style={{ padding: '0 15px 5px 0' }} />
                            <FormControlLabel value="central" control={<Radio color="primary" style={{ padding: '0 20px 5px 0px' }} />} label="Central" labelPlacement="start" style={{ padding: '0 15px 5px 0' }} />
                            <FormControlLabel value="google" control={<Radio color="primary" style={{ padding: '0 20px 5px 0px' }} />} label="Google" labelPlacement="start" style={{ padding: '0 15px 5px 0' }} />
                        </RadioGroup>
                    </FormControl>
                </div>
                <div className='rightplace'>
                    <div>
                        <CreatableSelect
                            ref={this.creatableSelect}
                            components={{ MultiValueLabel }}
                            options={this.state.suggests}
                            value={this.props.meta.tags}
                            isMulti
                            className='creatableSelect'
                            onChange={this.handleChangeTagList.bind(this)}
                            onInputChange={this.handleChange.bind(this)}
                        />
                    </div>
                    <div>
                        <Checkbox
                            color="primary" style={{ padding: '0 0 0 0' }}
                            onChange={e => this.selectAllToCentral(e)}
                        /> Publish all tags to central
                    </div>
                </div>
            </div>
        )
    }
}
