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

interface Tag {
  id: string,
  name: string,
  description: string
}

interface SelecTagListProps {
  allTags: Tag[]
  itemHandleClick(id: string): void;
}

/*
const useStyles = makeStyles((theme: { palette: { background: { paper: any; }; }; }) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));
*/

const MyList = styled(List)({
  width: '100%',
  maxWidth: 360,
});



export default class CheckboxList extends Component<SelecTagListProps> {
  //[checked, setChecked] = React.useState('');



  handleToggle(id: string) {
    /*
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    */

    //const newChecked = [...checked];
    /*
    const found = this.selectedTags.find(element => element = id);
    if (found === 'undefined') {
      this.selectedTags.push(id);
    } else {
      var index = this.selectedTags.indexOf(id);
      if (index !== -1) this.selectedTags.splice(index, 1);
    }
    */
    //setChecked(selectedTags);
  };

  render() {
    const { allTags, itemHandleClick } = this.props
    return (
      <MyList>

        {allTags.map(tag => {
          const labelId = `checkbox-list-label-${tag.id}`;
          return (
            <ListItem
              key={tag.id}
              role={undefined}
              dense button
              onClick={itemHandleClick.bind(this, tag.id)}

            >
              <ListItemIcon>
                <Checkbox
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={tag.name} primary={tag.name} />
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
