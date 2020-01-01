import React from 'react';
import './MetaListEmptyMessage.css';

export default function MetaListEmptyMessage() {
    return (
        <div className="MetaListEmptyMessage">
            <div>No files or folders for the selected tags.</div>
            <div><b>Tags: </b></div>
            <div>- Switch set to Local: Black tags are only saved on Local, purple are on Local and Central.</div>
            <div>- Switch set to Central: All tags found on Central, black one are from other users, purple one are created or used by you.</div>
        </div>
    );
};