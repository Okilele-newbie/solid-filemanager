import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

interface PopupProps {
  searchString: string
}

export default class Popup extends Component<PopupProps> {
  constructor(props: PopupProps) {
    super(props);
    this.state = {
      suggests: null,
      isLoading: false
    };
    this.handleChange = this.handleChange.bind(this);
    //this.itemHandleClick = this.itemHandleClick.bind(this)
  }

  //[anchorEl, setAnchorEl] = React.useState(null);
  //anchorEl = React.useState(null);
  //setAnchorEl = React.useState(null);


  searchString = this.props.searchString

  handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    //this.setAnchorEl(event.currentTarget);
  };

  handleClose = () => {
    //this.setAnchorEl(null);
  };

  //When entering text in the field, to trigger suggests
  /*
  handleChange(event: React.ChangeEvent<HTMLSelectElement>) {

    const searchString: string = event.target.value
    if (searchString !== '') {
      let suggests = [] as string[]
      this.setState({ suggests: null, isLoading: true });
      //const tst = AppGetData(suggests, str)
      this.GetSuggestions(
        (suggests: []) => {
          console.log(suggests)
          this.setState({ suggests, isLoading: false })
        }
        , this.searchString
      );
    }
  }
*/
  handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const str = event.target.value;
    if (str !== "") {
      this.setState({ suggests: null, isLoading: true });
      //const tst = AppGetData(appointments, str)
      this.GetSuggestions((suggests) => {
        console.log(suggests)
        this.setState({ suggests, isLoading: false })
      }
        , str);
    }
  }


  GetSuggestions = (callback, searchedString) => {
    this.jsonp(
      `http://suggestqueries.google.com/complete/search?client=firefox&q=${searchedString}`,
      response => callback(response)
    );
  }

  jsonp = (url, callback) => {
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function (data) {
      delete window[callbackName];
      document.body.removeChild(script);
      callback(data);
    };

    var script = document.createElement('script');
    script.src =
      url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
  };

  render() {
    const { suggests, isLoading } = this.state;
    return (
      <div>
        <form action="">
          Search 2 :
                <TextField type="text" onChange={this.handleChange} />;

        </form>

        {isLoading && <div>Please wait...</div>}
        {suggests && this.printRows(suggests)}
      </div>
    )
  }

  printRows(suggests) {

    //const { appointments } = this.props;
    if (suggests !== null) {
      return (
        suggests[1].map((item) => {
          console.log(item)
          return (
            <div className='cols'>
              <List>
                <ListItem>
                  <ListItemText>
                    {item}
                  </ListItemText>
                </ListItem>
              </List>
            </div>
          )
        })
      )
    }
  }





}
