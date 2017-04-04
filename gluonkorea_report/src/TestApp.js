import React, { Component } from 'react';
import { ButtonToolbar, Button, PageHeader } from 'react-bootstrap';
import ReportExcelPage from "./ReportExcelPage";
//import LoadingBox from './LoadingBox';

class TestApp extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {

    }

    componentWillUnmount() {}

    render() {
        return (
            <ReportExcelPage />
        );
    }
}

export default TestApp;