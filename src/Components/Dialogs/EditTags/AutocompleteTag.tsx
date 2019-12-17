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
import { styled } from '@material-ui/styles';
import './Autocomplete.css'

interface PopupProps {
    meta: Meta,
    focus: () => {}
}

interface PopupState {
    suggests: Suggestion[]
}

interface MultiValueLabelProps {
    children: {},
    data: MetaTag
}

//Suggestions (options in component) need label additional property
interface Suggestion extends MetaTag {
    label: string
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
            color: 'red'//data.published ? onServerColor : 'black'
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

const MyFormControlLabel = styled(FormControlLabel)({
    padding: '0 15px 5px 0'
});
const MyRadio = styled(Radio)({
    padding: '0 20px 5px 0px'
});

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

    //select a suggestion or delete a tag: items is the list of current selected values
    handleChangeTagList(items: Suggestion[]) {
        this.props.meta.tags = items
        this.forceUpdate()
    }

    handleRadioChange = (event: React.ChangeEvent<{}>, value: string) => {
        this.source = value
        this.handleChange(this.lastStr)
        this.forceUpdate()
    };

    //type a letter, items in suggestions are Metatag
    handleChange(str: string) {
        if (str !== "") {
            this.lastStr = str
            let retVal = [] as Suggestion[]
            if (this.source === 'google') {
                CallJsonP((suggests: any[]) => {
                    //suggests[1] creates a new Io
                    suggests[1].map((item: string) => {
                        const suggestion: Suggestion = { 'tagType': 'NamedTag', 'value': item, published: false, 'label': item }
                        retVal.push(suggestion)
                    })
                    this.setState({ suggests: retVal })
                }
                    , str);
            }

            if (this.source === 'local') {
                let localTags = [] as MetaTag[]
                TagUtils.getLocalUsedTags()
                    .then((foundTags: MetaTag[]) => {
                        foundTags.map(tag => {
                            const suggestion: Suggestion = { 'tagType': 'NamedTag', 'value': tag.value, published: false, 'label': tag.value }
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
                            const suggestion: Suggestion = { 'tagType': 'NamedTag', 'value': tag.value, published: false, 'label': tag.value }
                            retVal.push(suggestion);
                        })
                        this.setState({ suggests: retVal })
                    })
            }
        }
    }

    render() {
        return (
            <div className='bodyPlace'>
                <div className='leftplace'>
                    <FormControl>
                        <RadioGroup aria-label="gender" value={this.source} onChange={this.handleRadioChange}>
                            <MyFormControlLabel value="local" control={<MyRadio color="primary" />} label="Local" labelPlacement="start" />
                            <MyFormControlLabel value="central" control={<MyRadio color="primary" />} label="Central" labelPlacement="start" />
                            <MyFormControlLabel value="google" control={<MyRadio color="primary" />} label="Google" labelPlacement="start" />
                        </RadioGroup>
                    </FormControl>
                </div>
                <div className='rightplace'>
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
            </div>
        )
    }
}
