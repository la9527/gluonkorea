import React, { Component } from 'react';
import axios from 'axios';
import ReportExcelPage from './ReportExcelPage';
import ReportDefine from './ReportDefine';

export default class ExecReport extends Component {
    constructor(props) {
        super( props );
        this.reportData = null;
        this.state = {};
    }

    static propTypes = {
        masterId: React.PropTypes.string,
        month: React.PropTypes.string,
        onExit: React.PropTypes.func
    }

    async reportRun() {
        let that = this;

        let getData = async ( item ) => {
            item.params.masterId = that.props.masterId || '';
            item.params.month = that.props.month || '';
            
            if ( item.funcCall ) {
                console.log( 'item.funcCall !!!' );
                item.funcCall(item);
            } else if ( item.url ) {
                let url = 'http://' + location.hostname + ':3030' + item.url;
                console.log( `URL : ${url}`, 'PARAM:', item.params);
                let result = await axios.post( url, item.params, { responseType: 'json' });
                if ( result.data.success && result.data.data ) {
                    item.data = result.data.data;
                }
            }
            return item;
        };

        for ( let key in this.reportQuery ) {
            if ( Array.isArray(this.reportQuery[key] ) ) {
                for ( let item of this.reportQuery[key] ) {
                    await getData(item).catch( (e) => { item.res = []; item.msg = e; console.log( 'getDATA - ERROR: ' + e); });
                }
            } else {
                await getData(this.reportQuery[key]).catch( (e) => { this.reportQuery[key].res = []; this.reportQuery[key].msg = e; console.log( 'getDATA - ERROR: ' + e); });
            }
        }

        console.log( 'A !!' );
        this.setState( { ...this.state, viewLoading: false } );
    }

    run( masterId ) {
        this.state.masterId = masterId;
        this.state.viewLoading = true;
        this.reportQuery = Object.assign( {}, ReportDefine() );
        this.reportRun();
    }

    componentDidMount() {
        if ( window._loading ) {
            window._loading.show();
        }

        this.run( this.props.masterId );
    }

    onExit() {
        if ( this.props.onExit ) {
            this.props.onExit();
        }
    }
    render() {
        if ( !this.reportQuery || this.state.viewLoading ) {
            console.log( 'VIEW EMPTY !!!');
            return null;
        }
        return (
            <ReportExcelPage reportData={this.reportQuery} masterId={this.state.masterId} onExit={::this.onExit} />
        );
    }
}