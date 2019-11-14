import React from "react";
import ReactDOM from "react-dom";

//import PropTypes from "prop-types";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Collapse from "@material-ui/core/Collapse";
import { styled } from '@material-ui/styles';
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
//import { withStyles } from "@material-ui/core/styles";

import Utils from "./Utils.js";

const MyTableBody = styled(TableBody)({
    padding: '0 0px 0px 0px',
});
const MyTableRow = styled(TableRow)({
    height: 'auto',
});
const MyTableCell = styled(TableCell)({
    padding: '0 0px 0px 0px',
    fontSize: '1em',
});

const rootElement = document.getElementById("root");
const baseUrl = 'https://okilele.solid.community/'

//------------    On load    --------------------------------------------------

async function readRootFolder() {
    console.log(`Enter readFolder ${baseUrl}`)
    var items = null;
    var folder = await Utils.asyncCallFileClientReadFolder(baseUrl)
    //First column
    items = folder.folders;
    items.concat(folder.files)
    items.map(item => { item.name = decodeURI(item.name); return null })
    ReactDOM.render(<TreeView items={items} />, rootElement);

    //subitems of 1st col
    await Utils.readSubItems(items)
    ReactDOM.render(<TreeView items={items} />, rootElement);

}

//------------    On update    --------------------------------------------------

async function updateFolder(thisObject, allItems, e) {
    //Show subItems
    thisObject.setState({ [e.name]: !thisObject.state[e.name] });
    //console.log('1. Beginning updating folder ' + e.url)
    await preloadSubItems(allItems, allItems, e.url)
    //console.log('2. Done with updating folder ' + e.url)
    //console.log('going to render DOM')
    //Show again with arrows
    ReactDOM.render(<TreeView items={allItems} />, rootElement);
};

async function preloadSubItems(allItems, currentItems, parentUrl) {
    //search the clicked item in allItems
    //then find sub items of the clicked one and update it
    for (var it = 0; it < currentItems.length; it++) {
        var testedItem = currentItems[it]
        console.log('exploring subs of ' + testedItem.url)

        if (!testedItem.subsubItemsAlreadyUpdated === true
            && testedItem.items
            && testedItem.url === parentUrl) {
            console.log('  -working on subs of ' + testedItem.url);
            //found clicked item : read subs and update its sub items
            await Utils.readSubItems(testedItem.items)
            testedItem.subsubItemsAlreadyUpdated = true
            console.log('  -done reading/updating items, going to update parent folder');
            InsertUpdatedItem(allItems, testedItem)
            break
        } else {
            //go on searching in subs if any
            if (testedItem.items) {
                await preloadSubItems(allItems, testedItem.items, parentUrl)
            }
        }
    }

}

function InsertUpdatedItem(currentItems, itemToInsert) {
    currentItems.map(item => {
        if (itemToInsert.url === item.url) {
            console.log('      - updating ' + itemToInsert.url)
            item = itemToInsert
        } else {
            if (item.items) {
                InsertUpdatedItem(item.items, itemToInsert)
            }
        }
        return null;
    })
}

//--------------------------------------------------------------
class TreeView extends React.Component {
    state = {};

    handleClick = e => {
        updateFolder(this, this.props.items, e)
    };

    render() {
        if (this.props.items === null) {
            readRootFolder()
        }
        return (
            <div>
                <Table aria-label="simple table">
                    <TableHead>
                    </TableHead>
                    <MyTableBody>
                        {this.printRows(this.props.items, -1)}
                    </MyTableBody>
                </Table>
            </div>
        )
    };

    printRows(items, colNumber) {
        colNumber = colNumber + 1
        var blanks = ''
        for (var it = 0; it < colNumber; it++) { blanks += '. . ' }

        if (items != null) {
            return (
                items.map(item => {
                    return (
                        <div key={item.url}>
                            <MyTableRow
                                button
                                state={item.name}
                            >

                                <MyTableCell
                                    component="td" scope="row"
                                    onClick={this.handleClick.bind(this, item)}>
                                    {blanks}
                                    {item.items && item.items.length > 0
                                        ? (this.state[item.name]
                                            ? (<ExpandLess />)
                                            : (<ExpandMore />))
                                        : ('. . . ')}
                                </MyTableCell>

                                <MyTableCell
                                    component="td" scope="row">
                                    {item.name}
                                </MyTableCell>
                            </MyTableRow>
                            <Collapse
                                key={item.url}
                                component="div"
                                in={this.state[item.name]}
                                timeout="auto"
                                unmountOnExit
                            >
                                {item.items != null ? (
                                    <div>
                                        {this.printRows(item.items, colNumber)}
                                    </div>
                                ) : (null)}
                            </Collapse>
                        </div>
                    )
                })

            );
        }
        colNumber= colNumber - 1
    }

}

/*
TreeView.propTypes = {
    classes: PropTypes.object.isRequired
};
*/

//export default withStyles(styles)(TreeView);
export default (TreeView);
