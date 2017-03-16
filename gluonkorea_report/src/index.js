import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import $ from 'jquery';

$(document).ready(() => {
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
});
