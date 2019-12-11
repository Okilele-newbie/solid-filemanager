import React from 'react';
import TagUtils, { Meta, MetaTag, onServerColor } from '../../../Api/TagUtils';
import CreatableSelect, { Optionx } from 'react-select/creatable';
import CallJsonP from '../../../Api/jsonp';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import './Autocomplete.css'

interface PopupProps { meta: Meta }

interface PopupState {
    suggests: Suggestion[]
}

interface MultiValueLabelProps {
    children: {},
    data: MetaTag
}

interface Suggestion {
    source: string
    label: string,
    value: string,
}
//Each tag as is a MultiValueLabel in Autocomplete componennt
class MultiValueLabel extends React.Component<MultiValueLabelProps> {

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
                {data.value}
            </div>
        )
    }
}

//class Option extends React.Component<MultiValueLabelProps> {
class OptionDisabled extends React.Component {
    render() {
        const { data } = this.props;

        const styles = {
            color: data.source === 'google' ? 'blue' : data.source === 'local' ? 'black' : onServerColor,
            align: 'left',
            textTransform: 'none',
            display: 'flex',
            justifyContent: 'left',
            padding: '3px 0px 3px 15px',
        };

        return (
            <div>
                <Button style={styles} size="small" fullWidth={true} className='Button'>
                    {data.value}
                </Button >
            </div>
        )
    }

}

export default class AutocompleteTag extends React.Component<PopupProps, PopupState> {

    constructor(props: PopupProps) {
        super(props);
        this.state = { suggests: [] };
    }

    source = '' as string

    handleRadioChange = event => {
        this.source = event.target.value
        this.handleChange('')
    };

    render() {
        return (
            <div class='bodyPlace'>
                <div class='leftPlace'>
                    <RadioGroup aria-label="gender" onChange={this.handleRadioChange}>
                        <FormControlLabel value="local" control={<Radio color="primary" />} label="Local" labelPlacement="start" />
                        <FormControlLabel value="central" control={<Radio color="primary" />} label="Central" labelPlacement="start" />
                        <FormControlLabel value="google" control={<Radio color="primary" />} label="Google" labelPlacement="start" />
                    </RadioGroup>
                </div>
                <div>
                    <CreatableSelect
                        components={{ MultiValueLabel }}
                        options={this.state.suggests}
                        value={this.props.meta.tags}
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
                </div>
            </div>
        )
    }

    //select a suggestion or delete a tag: items is the list of current selected values
    handleChangeTagList(items: Suggestion[]) {
        if (items !== null && items[0] !== undefined) {
            this.props.meta.tags = []
            items.map(item => {
                const tag: MetaTag = { 'tagType': 'NamedTag', 'value': item.value, published: false }
                this.props.meta.tags.push(tag)
            })
        }
        this.forceUpdate()
    }

    //type a letter, items in suggestions are Metatag
    handleChange(str: string) {
        if (str !== "") {

            let retVal = [] as Suggestion[]
            if (this.source === 'google') {
                CallJsonP((suggests: any[]) => {
                    //suggests[1] creates a new Io
                    suggests[1].map((item: string) => {
                        const suggestion: Suggestion = { 'label': item, 'value': item, 'source': 'google' }
                        retVal.push(suggestion)
                    })
                    this.setState({ suggests: retVal })
                }
                    , str);
            }

            if (this.source === 'local') {
                let localTags = [] as MetaTag[]
                TagUtils.getLocalUsedTags(true)
                    .then((foundTags: MetaTag[]) => {
                        foundTags.map(tag => {
                            const suggestion: Suggestion = { 'label': tag.value, 'value': tag.value, 'source': 'local' }
                            retVal.push(suggestion);
                        })
                        this.setState({ suggests: retVal })
                    })
            }

            if (this.source === 'central') {
                let serverTags = [] as MetaTag[]
                TagUtils.getCentralUsedTags()
                    .then((foundTags: MetaTag[]) => {
                        foundTags.map(tag => {
                            const suggestion: Suggestion = { 'label': tag.value, 'value': tag.value, 'source': 'central' }
                            retVal.push(suggestion);
                        })
                        this.setState({ suggests: retVal })
                    })
            }
        }
    }
}
