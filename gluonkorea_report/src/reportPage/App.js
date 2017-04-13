import React, { Component } from 'react';
import MasterIdSearchPage from './MasterIdSearchPage';
import ExecReport from './ExecReport';
import LoadingBox from './LoadingBox';
import './App.css';
import { Grid, Row, Col } from 'react-bootstrap';

let LOAD_TYPE = {
    READY: 'READY',
    LOADING: 'LOADING',
    COMPLETE: 'COMPLETE',
};

let PAGE_TYPE = {
    REPORT: 'REPORT',
    MASTERID_SELECT: 'MASTERID_SELECT'
};

class StatusBar extends Component {
    constructor() {
        super();
        this.state = {
            msg: ''
        }
    }

    render() {
        if ( !this.state.msg ) {
            return null;
        }
        return (
            <div className="statusMsgBoxView">
                <span className="msg">{this.state.msg}</span>
            </div>
        );
    }
}

class App extends Component {
    constructor() {
        super();

        this.state = {
            viewpage: {
                name: PAGE_TYPE.MASTERID_SELECT
            }
        };
    }

    showStorageQuata() {
        let MBConvert = function( byte ) {
            return (byte / (1024*1024)).toFixed(2) + 'MB';
        };

        if (navigator.webkitTemporaryStorage) {
            navigator.webkitTemporaryStorage.queryUsageAndQuota(
                function (usedBytes, grantedBytes) {
                    console.log(`Using Temporary : ${usedBytes} (${MBConvert(usedBytes)}) / ${grantedBytes} (${MBConvert(grantedBytes)})`);
                },
                function (e) {
                    console.log('Error', e);
                }
            );

            navigator.webkitPersistentStorage.queryUsageAndQuota (
                function(usedBytes, grantedBytes) {
                    console.log(`Using Persistent : ${usedBytes} (${MBConvert(usedBytes)}) / ${grantedBytes} (${MBConvert(grantedBytes)})`);
                },
                function(e) { console.log('Error', e);  }
            );
        }
    }

    initEvent() {
        this.showStorageQuata();
    }

    componentDidMount() {
        this.initEvent();
        let that = this;

        window._loading = new LoadingBox();

        that.refs.statusBar.setState( { msg: '' } );
    }

    onMasterIdSelectView() {
        if ( !this.refs.masterIdPage ) {
            this.setState({
                ...this.state,
                viewpage: {
                    name: PAGE_TYPE.MASTERID_SELECT
                }
            });
        } else {
            this.refs.masterIdPage.onRunSql();
        }
    }

    onMasterIdClick(month, masterId) {
        this.setState( {
            ...this.state,
            viewpage: {
                name: PAGE_TYPE.REPORT,
                month: month,
                masterId: masterId
            }
        });
    }

    render() {
        let that = this;

        console.log( 'this.state.sql.tablesNames : ', this.state.tablesNames );

        let pageControl = () => {
            let component = null;

            if ( that.state.viewpage.name === PAGE_TYPE.MASTERID_SELECT ) {
                console.log( 'pageControl :: REPORT' );
                component = (
                    <MasterIdSearchPage ref="masterIdPage" onMasterIdClick={::this.onMasterIdClick} />
                );
            } else if ( that.state.viewpage.name === PAGE_TYPE.REPORT ) {
                console.log('pageControl :: REPORT');
                component = (
                    <ExecReport ref="reportPage" masterId={that.state.viewpage.masterId} month={that.state.viewpage.month} onExit={::this.onMasterIdSelectView} />
                );
            }
            return component;
        };

        return (
            <Grid fluid={true}>
                <Row>
                    <Col xs={12}>
                        {pageControl()}
                    </Col>
                </Row>
                <StatusBar ref="statusBar" />
            </Grid>
        );
    }
}

export default App;
