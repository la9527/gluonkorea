import React, { Component } from 'react';
import SellerIdSearchPage from './SellerIdSearchPage';
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
    SELLERID_SELECT: 'SELLERID_SELECT'
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
                name: PAGE_TYPE.SELLERID_SELECT
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

    onSellerIdSelectView() {
        if ( !this.refs.sellerIdPage ) {
            this.setState({
                ...this.state,
                viewpage: {
                    name: PAGE_TYPE.SELLERID_SELECT
                }
            });
        } else {
            this.refs.sellerIdPage.onRunSql();
        }
    }

    onSellerIdClick(month, sellerId) {
        this.setState( {
            ...this.state,
            viewpage: {
                name: PAGE_TYPE.REPORT,
                month: month,
                sellerId: sellerId
            }
        });
    }

    render() {
        let that = this;

        console.log( 'this.state.sql.tablesNames : ', this.state.tablesNames );

        let pageControl = () => {
            let component = null;

            if ( that.state.viewpage.name === PAGE_TYPE.SELLERID_SELECT ) {
                console.log( 'pageControl :: REPORT' );
                component = (
                    <SellerIdSearchPage ref="sellerIdPage" onSellerClick={::this.onSellerIdClick} />
                );
            } else if ( that.state.viewpage.name === PAGE_TYPE.REPORT ) {
                console.log('pageControl :: REPORT');
                component = (
                    <ExecReport ref="reportPage" sellerId={that.state.viewpage.sellerId} month={that.state.viewpage.month} onExit={::this.onSellerIdSelectView} />
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
