import React, { Component } from 'react';

import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import Collapse from "@material-ui/core/Collapse";
import { styled } from '@material-ui/styles';

import SolidFileClientUtils, { IFolder } from '../../Api/SolidFileClientUtils';
import TagViewItem from './TagViewItem'

import { Tag, Meta} from '../../Api/TagUtils'

const MyList = styled(List)({
    minWidth: 'max-content'
});

export default class TagView extends Component {
    folder = {} as IFolder;

    readUsedTags() {

    }

    const MyList = styled(List)({
        width: '100%',
        maxWidth: 360,
    });

    render() {
        //const { libraryTags, currentMeta, itemHandleClick } = this.props
        return (
            <MyList>
                {TagUtils.getUsedTags.map(tag => {
                    const key = `${tag.tagType}-${tag.description}`
                    const labelId = `checkbox-list-label-${key}`;
                    return (
                        < ListItem
                            key={`${tag.tagType}-${tag.description}`
                            }
                            role={undefined}
                            dense button
                            onClick={itemHandleClick.bind(this, tag)}

                        >
                            <ListItemIcon>
                                <Checkbox
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': key }}
                                    checked={currentMeta.tags.filter(el => el.tagType + el.value === tag.tagType + tag.value).length !== 0}
                                />
                            </ListItemIcon>
                            <ListItemText id={tag.description} primary={tag.description} />

                        </ListItem>
                    );
                })
                }
            </MyList >
        )
    };

}

