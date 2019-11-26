import React, { Component, RefObject } from 'react';
import { styled } from '@material-ui/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import {Tag} from '../../../Api/TagUtils';

interface SelecTagListProps {
  libraryTags: Tag[]
  currentItemTags: Tag[]
  itemHandleClick(tag: Tag): void;
}

const MyList = styled(List)({
  width: '100%',
  maxWidth: 360,
});

export default class CheckboxList extends Component<SelecTagListProps> {

  render() {
    const { libraryTags, currentItemTags, itemHandleClick } = this.props
    return (
      <MyList>

        {libraryTags.map(tag => {
          const key = `${tag.tagType}-${tag.description}`
          const labelId = `checkbox-list-label-${key}`;
          return (
            <ListItem
              key={`${tag.tagType}-${tag.description}`}
              role={undefined}
              dense button
              onClick={itemHandleClick.bind(this, tag)}

            >
              <ListItemIcon>
                <Checkbox
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': key }}
                />
              </ListItemIcon>
              <ListItemText id={tag.description} primary={tag.description} />
              <ListItemSecondaryAction>
                <IconButton
                  aria-label="comments">
                  <CommentIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </MyList>
    )
  };
}
