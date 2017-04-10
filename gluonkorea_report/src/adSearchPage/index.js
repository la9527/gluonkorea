import React from 'react';
import ReactDOM from 'react-dom';
import AdSearchPage from './AdSearchPage';
import $ from 'jquery';

$(document).ready(() => {
    ReactDOM.render(
        <AdSearchPage />,
        document.getElementById('root')
    );
});