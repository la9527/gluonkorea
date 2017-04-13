import WorkerControl from './WorkerControl';
import React, { Component } from 'react';
import TableView from './TableView';
import { tableNames } from './ReportQuery';
import QueryViewPage from './QueryViewPage';
import TableViewPage from './TableViewPage';
import FileUploaderView from './FileUploaderView';
import MasterIdSelectPage from './MasterIdSelectPage';
import ReportViewPage from './ReportViewPage';
import MultiFileLoad from './MultiFileLoad';
import LoadingBox from './LoadingBox';
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
            showFileUpload: true,
            sql: {},
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

        window._loading = new LoadingBox();

        workerImp.setStatusMsg( function( msg ) {
            that.refs.statusBar.setState( { msg: msg } );
        });
        workerImp.setLoadDoneMsg( function( msg ) {
            console.log( 'setLoadDoneMsg', msg.tableName );

            that.setState( {
                ...that.state,
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
                tableName: tableName
            }
        });
    }

    onQueryView() {
        if ( !this.refs.queryPage ) {
            this.setState({
                ...this.state,
                viewpage: {
                    name: PAGE_TYPE.QUERY
                }
            });
        } else {
            this.refs.queryPage.forceUpdate();
        }
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

    onMasterIdClick(masterId) {
        this.setState( {
            ...this.state,
            viewpage: {
                name: PAGE_TYPE.REPORT,
                masterId: masterId
            }
        });
    }

    onMultiFileLoad1M() {
        let multiFileLoad = new MultiFileLoad( workerImp );
        let that = this;
        window._loading.show();
        multiFileLoad.run(function() {
            window._loading.close();
        });
    }

    onMultiFileLoad2M() {
        let multiFileLoad = new MultiFileLoad( workerImp, {
            [tableNames.A_DAYS]: 'csvFiles/2_A_DAYS.csv',
            [tableNames.A_KEYWORD]: 'csvFiles/2_A_KEYWORD.csv',
            [tableNames.G_DAYS]: 'csvFiles/2_G_DAYS.csv',
            [tableNames.G_KEYWORD]: 'csvFiles/2_G_KEYWORD.csv'
        });

        let that = this;
        window._loading.show();
        multiFileLoad.run(function() {
            window._loading.close();
        });
    }

    onLoadedCSV( opt ) {
        workerImp.postMessage( { type: 'loaddata', data: opt.data, name: opt.name } );
    }

    render() {
        let that = this;

        let uploadView = function() {
            return (
                    <Panel header="Upload">
                        <FileUploaderView name={tableNames.G_DAYS} buttonTitle="CSV 업로드" accept=".csv" onLoaded={::that.onLoadedCSV}/>
                        <FileUploaderView name={tableNames.G_KEYWORD} buttonTitle="CSV 업로드" accept=".csv" onLoaded={::that.onLoadedCSV} />
                        <FileUploaderView name={tableNames.A_DAYS} buttonTitle="CSV 업로드" accept=".csv" onLoaded={::that.onLoadedCSV} />
                        <FileUploaderView name={tableNames.A_KEYWORD} buttonTitle="CSV 업로드" accept=".csv" onLoaded={::that.onLoadedCSV} />
                    </Panel>
                );
        };

        console.log( 'this.state.sql.tablesNames : ', this.state.tablesNames );

        let pageControl = () => {
            let component = null;

            if ( that.state.viewpage.name === PAGE_TYPE.MASTERID_SELECT ) {
                console.log( 'pageControl :: REPORT' );
                component = (
                    <MasterIdSelectPage ref="masterIdPage" workerImp={workerImp} keywordTableName={tableNames.A_DAYS} onMasterIdClick={::this.onMasterIdClick} />
                );
            } else if ( that.state.viewpage.name === PAGE_TYPE.TABLE && that.state.viewpage.tableName ) {
                console.log( 'pageControl :: TABLEVIEW' );
                component = (
                    <TableViewPage ref="tableViewPage" workerImp={workerImp} tableName={this.state.viewpage.tableName}/>
                );
            } else if ( that.state.viewpage.name === PAGE_TYPE.REPORT ) {
                console.log('pageControl :: REPORT');
                component = (
                    <ReportViewPage ref="reportPage" workerImp={workerImp} masterId={that.state.viewpage.masterId} />
                );
            } else {
                console.log( 'pageControl :: QueryViewPage' );
                component = (
                    <QueryViewPage ref="queryPage" workerImp={workerImp} />
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
                <Row>
                    <Col xs={3}>
                        <PageHeader className="text-center">REPORT</PageHeader>
                        <ButtonToolbar className="text-center">
                            <Button bsSize="sm" onClick={::this.onMultiFileLoad1M}>ROAS DATA - (1월)</Button>
                            <Button bsSize="sm" onClick={::this.onMultiFileLoad2M}>ROAS DATA - (2월)</Button>
                        </ButtonToolbar>
                        <hr />
                        {uploadView()}
                        <hr />
                        <ButtonToolbar className="text-center">
                            <Button bsSize="sm" onClick={::this.onQueryView}>Query 실행</Button>
                            <Button bsSize="sm" onClick={::this.onMasterIdSelectView}>Report 처리</Button>
                        </ButtonToolbar>
                        <hr />
                        {showTables()}
                    </Col>
                    <Col xs={9}>
                        <hr />
                        {pageControl()}
                    </Col>
                </Row>
                <StatusBar ref="statusBar" />
            </Grid>
        );
    }
}

export default App;
