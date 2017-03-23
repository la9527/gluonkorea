import React, { Component } from 'react';
import { ButtonToolbar, Button, PageHeader } from 'react-bootstrap';
import axios from 'axios';
import FileSaver from 'file-saver';
import ReportExcelPage from './ReportExcelPage';

class TestApp extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentWillUnmount() {}

    render() {
        let masterId = "test";
        return (
            <ReportExcelPage masterId={masterId} />
        );
    }
}

export default TestApp;