import React from 'react';
import ReactDOM from 'react-dom';
import App from './reportPage/App';
//import TestApp from './TestApp';
import $ from 'jquery';

$(document).ready(() => {
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
});
