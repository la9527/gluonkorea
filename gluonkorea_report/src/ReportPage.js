import React, { Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import TableView from './TableView';
import ReportQuery from './ReportQuery';

let QUERY_STATUS = {
    READY: 0,
    START: 1,
    DONE: 2
};

export default class ReportPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static propTypes = {
        workerImp: React.PropTypes.object,
        masterId: React.PropTypes.string
    }

    queryRun() {
        let that = this;

        let isComplete = () => {
            let tabNames = Object.getOwnPropertyNames( that.reportQuery );
            for ( let i = 0; i < tabNames.length; i++ ) {
                let tabName = tabNames[i];
                if ( that.reportQuery[tabName].constructor === Array ) {
                    for ( let j in that.reportQuery[tabName] ) {
                        if ( that.reportQuery[tabName][j].status !== QUERY_STATUS.DONE ) {
                            return false;
                        }
                    }
                } else {
                    if ( that.reportQuery[tabName].status !== QUERY_STATUS.DONE ) {
                        return false;
                    }
                }
            }
            return true;
        };

        let queryReplace = (sql, param) => {
            let replaceSql = sql;
            Object.getOwnPropertyNames( param ).map( (el) => {
                replaceSql = replaceSql.replace( new RegExp("\\$" + el, 'mg'), param[el] );
            });
            return replaceSql;
        };

        let reportQueryRun = (element, i) => {
            if ( !element[i].status ) {
                element[i].status = QUERY_STATUS.START;
                if ( that.props.masterId ) {
                    element[i].params.masterId = that.props.masterId;
                }
                let query = queryReplace(element[i].query, element[i].params);
                that.props.workerImp.sendSql(query, function (res) {
                    element[i].res = res;
                    element[i].status = QUERY_STATUS.DONE;
                    if ( isComplete() ) {
                        that.onCompleteLoad();
                    }
                });
                return true;
            }
            return false;
        };

        let reportRun = function() {
            let tabNames = Object.getOwnPropertyNames( that.reportQuery );
            for ( let i = 0; i < tabNames.length; i++ ) {
                let tabName = tabNames[i];
                if ( that.reportQuery[tabName].constructor === Array ) {
                    for ( let j = 0; j < that.reportQuery[tabName].length; j++ ) {
                        if ( reportQueryRun( that.reportQuery[tabName], j ) ) {
                            // recursive
                            reportRun(true);
                            return;
                        }
                    }
                } else {
                    if ( reportQueryRun( that.reportQuery, tabName ) ) {
                        reportRun();
                        return;
                    }
                }
            }
        };
        reportRun();
    }

    runLoad( masterId ) {
        this.setState( {
            ...this.state,
            masterId: masterId,
            viewLoading: true
        });
        this.state.masterId = masterId;
        this.state.viewLoading = true;
        this.reportQuery = Object.assign( {}, ReportQuery() );
        this.queryRun();
    }

    onCompleteLoad() {
        this.setState( {
            ...this.state,
            viewLoading: false
        });
        console.log( 'COMPLETE LOAD !!!', this.reportQuery);
    }

    onUpdateResize() {
        this.setState( ...this.state );
    }

    componentDidMount() {
        this.runLoad( this.props.masterId );
        window.addEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUpdate(nextProps) {
        if ( nextProps.masterId !== this.state.masterId ) {
            this.runLoad( this.props.masterId );
        }
    }

    tabSelect( tabId ) {
        console.log( 'tabSelect : ', tabId );
    }

    render() {
        let that = this;
        if ( !this.reportQuery || this.state.viewLoading ) {
            return null;
        }

        let tabNames = Object.getOwnPropertyNames( that.reportQuery );
        let tabInfo = tabNames.map( (name) => {
            let items = that.reportQuery[name];
            let tableView = null;
            if ( items.constructor === Array ) { // isArray Check
                tableView = items.map( (el) => {
                        if ( !el.res ) {
                            return null;
                        }
                        if ( el.res.type === 'error' ) {
                            return (<div className="alert alert-info">{el.res.msg}</div>);
                        }
                        let title = el.title + ' (' + (el.res.result && el.res.result.length) + '건)';
                        return (<TableView tableData={el.res.result} title={title} msg={el.res.msg}/>);
                    });
            } else {
                if ( items.res ) {
                    if ( items.res.type === 'error' ) {
                        tableView = (<div className="alert alert-info">{items.res.msg}</div>);
                    } else {
                        let title = items.title + ' (' + (items.res.result && items.res.result.length) + '건)';
                        tableView = (<TableView tableData={items.res.result} title={title} msg={items.res.msg}/>);
                    }
                }
            }

            let tabHeight = window.outerHeight - 300;
            let tabbodyStyle = {
                'height': tabHeight + 'px',
                'overflow-y': 'scroll'
            };
            return (<Tab eventKey={name} title={name} style={tabbodyStyle}>
                    {tableView}
                    </Tab>);
        });
        return (
            <Tabs onSelect={::this.tabSelect} id="reportTab">
                {tabInfo}
            </Tabs>
        );
    }
}
