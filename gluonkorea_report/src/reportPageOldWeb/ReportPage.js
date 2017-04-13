import React, { Component } from 'react';
import { Tab, Tabs, Button, ButtonToolbar } from 'react-bootstrap';
import TableView from './TableView';
import FileSaver from 'file-saver';

export default class ReportPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static propTypes = {
        reportData: React.PropTypes.object,
        masterId: React.PropTypes.string
    }

    onUpdateResize() {
        this.setState( ...this.state );
    }

    componentDidMount() {
        window.addEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
    }

    tabSelect( tabId ) {
        console.log( 'tabSelect : ', tabId );
    }

    onExcelDownload() {
        let reportDataJson = JSON.stringify( this.props.reportData, null, '  ' );
        FileSaver.saveAs( new Blob([reportDataJson], { type: 'text/plain;charset=utf-8' }), "file.json" );
    }

    render() {
        let that = this;
        if ( !this.props.reportData ) {
            return null;
        }

        let tabNames = Object.getOwnPropertyNames( that.props.reportData );
        let tabInfo = tabNames.map( (name) => {
            let items = that.props.reportData[name];
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
                        return (<TableView key={title} tableData={el.res.result} title={title} msg={el.res.msg}/>);
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
            <div>
                <ButtonToolbar>
                    <Button onClick={::this.onExcelDownload}>Excel 다운로드</Button>
                </ButtonToolbar>
                <Tabs onSelect={::this.tabSelect} id="reportTab">
                    {tabInfo}
                </Tabs>
            </div>
        );
    }
}
