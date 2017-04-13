import React, { Component } from 'react';
import { ButtonToolbar, Button, PageHeader } from 'react-bootstrap';
//import ReportExcelPage from "./ReportExcelPage";
//import LoadingBox from './LoadingBox';
//import MasterIdSearchPage from './reportPage/MasterIdSearchPage';
import ExecReport from './reportPage/ExecReport';

class TestApp extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {

    }

    componentWillUnmount() {}

    render() {
        let masterId = '11music';
        let month = '201701';

        return (
            <ExecReport masterId={masterId} month={month} />
        );
    }
}

export default TestApp;