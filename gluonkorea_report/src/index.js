import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import TestApp from './TestApp';
import $ from 'jquery';

$(document).ready(() => {
    ReactDOM.render(
        <App />,
        /* <TestApp />, */
        document.getElementById('root')
    );
});
