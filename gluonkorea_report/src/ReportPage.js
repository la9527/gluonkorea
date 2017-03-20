import React, { Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import TableView from './TableView';
import ReportSqlExec from './ReportSqlExec';

export default class ReportPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this._reportSqlExec = new ReportSqlExec();
    }

    static propTypes = {
        workerImp: React.PropTypes.object,
        masterId: React.PropTypes.string
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
        let that = this;
        this._reportSqlExec.setOption({
            progress: function( prop ) {
                console.log( prop );
            },
            done: function( masterId, data ) {
                that.reportQuery = data;
                that.setState( {
                    ...this.state,
                    masterId: masterId,
                    viewLoading: false
                });
            },
            workerImp: this.props.workerImp
        });

        this._reportSqlExec.run(this.props.masterId);
        window.addEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUpdate(nextProps) {
        if ( nextProps.masterId !== this.state.masterId ) {
            this._reportSqlExec.run( this.props.masterId );
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
                        return (<TableView key={name} tableData={el.res.result} title={title} msg={el.res.msg}/>);
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
