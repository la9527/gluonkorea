import WorkerControl from './WorkerControl';
import React, { Component } from 'react';
import TableView from './TableView';
import { tableNames } from './ReportQuery';
import QueryViewPage from './QueryViewPage';
import TableViewPage from './TableViewPage';
import FileUploaderView from './FileUploaderView';
import MasterIdSelectPage from './MasterIdSelectPage';
import ReportPage from './ReportPage';
import './App.css';
import { Grid, Row, Col, Panel, PageHeader, ButtonToolbar, Button } from 'react-bootstrap';

let workerImp = new WorkerControl();

window.sendSql = function(sql, resultFunc ) {
    if ( resultFunc ) {
        workerImp.sendSql(sql, resultFunc);
    } else {
        workerImp.sendSql(sql, function (res) {
            console.log(res);
        });
    }
};

let LOAD_TYPE = {
    READY: 'READY',
    LOADING: 'LOADING',
    COMPLETE: 'COMPLETE',
};

let PAGE_TYPE = {
    TABLE: 'TABLE',
    QUERY: 'QUERY',
    REPORT: 'REPORT',
    MASTERID_SELECT: 'MASTERID_SELECT'
};

class App extends Component {
    constructor() {
        super();

        this.state = {
            showFileUpload: true,
            sql: {},
            status: {},
            tablesNames: [],
            viewpage: {
                name: PAGE_TYPE.QUERY
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

        workerImp.setStatusMsg( function( msg ) {
            that.setState( {
                ...that.state,
                status: { msg: msg }
            });
        });
        workerImp.setLoadDoneMsg( function( msg ) {
            console.log( 'setLoadDoneMsg', msg.tableName );

            that.setState( {
                ...this.state,
                showFileUpload: true
            });

            that.showTables();
        });
    }

    showTables() {
        let that = this;
        workerImp.sendSql('SHOW TABLES', null, function (res) {
            that.setState({
                ...that.state,
                tablesNames: (res && res.result) ? res.result : []
            });
        }, true);
    }

    onRunSql( e ) {
        e.preventDefault();

        let that = this;
        let sql = this.refs.sqlTextArea.value;
        if ( !sql ) {
            return;
        }

        workerImp.sendSql(sql, function (res) {
            if ( res ) {
                if (res.type === 'error') {
                    that.setState({
                            ...that.state,
                            sql: {table: null, msg: res.msg}
                        });
                } else {
                    that.setState({ ...that.state,
                        sql: {table: res.result, msg: null}
                    });
                }
            }
        });
    }

    onTableView( tableName ) {
        console.log( 'onTableView', tableName );
        this.setState( {
            ...this.state,
            viewpage: {
                name: PAGE_TYPE.TABLE,
                query: `SELECT * FROM ${tableName} LIMIT 100`,
                title: tableName
            }
        });
    }

    onQueryView() {
        this.setState( {
            ...this.state,
            viewpage: {
                name: PAGE_TYPE.QUERY
            }
        });
    }

    onMasterIdSelectView() {
        this.setState( {
            ...this.state,
            viewpage: {
                name: PAGE_TYPE.MASTERID_SELECT
            }
        });
    }

    onMasterIdClick(masterId) {
        this.setState( {
            ...this.state,
            viewpage: {
                name: PAGE_TYPE.REPORT,
                masterId: masterId
            }
        });
    }

    render() {
        let that = this;

        let statusMsg = function() {
            if ( !that.state.status.msg ) {
                return null;
            }
            return (
                <div className="statusMsgBoxView">
                    <span className="msg">{that.state.status.msg}</span>
                </div>
            );
        };

        let uploadView = function() {
            return (
                    <Panel header="Upload">
                        <FileUploaderView workerImp={workerImp} tableName={tableNames.G_DAYS} />
                        <FileUploaderView workerImp={workerImp} tableName={tableNames.G_KEYWORD} />
                        <FileUploaderView workerImp={workerImp} tableName={tableNames.A_DAYS} />
                        <FileUploaderView workerImp={workerImp} tableName={tableNames.A_KEYWORD} />
                    </Panel>
                );
        };

        console.log( 'this.state.sql.tablesNames : ', this.state.tablesNames );

        let pageControl = () => {
            let component = null;

            if ( that.state.viewpage.name === PAGE_TYPE.MASTERID_SELECT ) {
                console.log( 'pageControl :: REPORT' );
                component = (
                    <MasterIdSelectPage workerImp={workerImp} keywordTableName={tableNames.A_DAYS} onMasterIdClick={::this.onMasterIdClick} />
                );
            } else if ( that.state.viewpage.name === PAGE_TYPE.TABLE && that.state.viewpage.query ) {
                console.log( 'pageControl :: TABLEVIEW' );
                component = (
                    <TableViewPage ref="tableViewPage" workerImp={workerImp} query={that.state.viewpage.query} title={that.state.viewpage.title} />
                );
            } else if ( that.state.viewpage.name === PAGE_TYPE.REPORT ) {
                console.log('pageControl :: REPORT');
                component = (
                    <ReportPage workerImp={workerImp} masterId={that.state.viewpage.masterId} />
                );
            } else {
                console.log( 'pageControl :: QueryViewPage' );
                component = (
                    <QueryViewPage workerImp={workerImp} />
                );
            }
            return component;
        };

        let showTables = () => {
            if ( !this.state.tablesNames || this.state.tablesNames.length === 0 ) {
                return null;
            }

            return (
                <Panel header="Table" bsStyle="success" >
                    <Button bsSize="xsmall" className="reloadBotton" onClick={::this.showTables}>RELOAD</Button>
                    <TableView tableData={this.state.tablesNames} onCellClick={::this.onTableView} />
                </Panel>
            );
        };

        return (
            <Grid fluid={true}>
                <Row className="show-grid">
                  <PageHeader className="text-center">Test CSV</PageHeader>
                </Row>
                <Row>
                    <Col xs={3}>
                        {uploadView()}
                        <hr />
                        <ButtonToolbar>
                            <Button bsSize="sm" onClick={::this.onQueryView}>Query 실행</Button>
                            <Button bsSize="sm" onClick={::this.onMasterIdSelectView}>Report 처리</Button>
                        </ButtonToolbar>
                        <hr />
                        {showTables()}
                    </Col>
                    <Col xs={9}>
                        {pageControl()}
                    </Col>
                </Row>
                {statusMsg()}
            </Grid>
        );
    }
}

export default App;
