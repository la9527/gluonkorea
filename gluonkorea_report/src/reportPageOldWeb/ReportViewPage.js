import React, { Component } from 'react';
import ReportSqlExec from './ReportSqlExec';
import ReportPage from './ReportPage';
import ReportExcelPage from './ReportExcelPage';

export default class ReportViewPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this._reportSqlExec = new ReportSqlExec();
    }

    static propTypes = {
        workerImp: React.PropTypes.object,
        masterId: React.PropTypes.string
    }

    componentDidMount() {
        let that = this;
        this._reportSqlExec.setOption({
            progress: function( prop ) {
                console.log( prop );
            },
            done: function( masterId, data ) {
                that.reportQuery = data;
                if ( window._loading ) {
                    window._loading.close();
                }
                that.setState( {
                    ...this.state,
                    masterId: masterId,
                    viewLoading: false
                });
            },
            workerImp: this.props.workerImp
        });

        if ( window._loading ) {
            window._loading.show();
        }
        this._reportSqlExec.run(this.props.masterId);
    }

    componentWillUpdate(nextProps) {
        if ( nextProps.masterId !== this.state.masterId ) {
            if ( window._loading ) {
                window._loading.show();
            }
            this._reportSqlExec.run( this.props.masterId );
        }
    }

    render() {
        if ( !this.reportQuery || this.state.viewLoading ) {
            return null;
        }
        /*
        return (
            <ReportPage reportData={this.reportQuery} masterId={this.state.masterId} />
        );
        */
        return (
            <ReportExcelPage reportData={this.reportQuery} masterId={this.state.masterId} />
        );
    }
}
