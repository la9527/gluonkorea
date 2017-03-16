import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import TableView from './TableView';

export default class TableViewPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sql: {}
        };
    }

    static propTypes = {
        workerImp: React.PropTypes.object,
        title: React.PropTypes.string,
        query: React.PropTypes.string,
        queryValue: React.PropTypes.object
    }

    runSql( query, value ) {
        let that = this;
        that.setState({
            ...that.state,
            sql: {
                table: null,
                msg: null,
                query: query
            }
        });
        this.props.workerImp.sendSql(query, value, function (res) {
            if ( res ) {
                if (res.type === 'error') {
                    that.setState({
                        ...that.state,
                        sql: {table: null, msg: res.msg, query: query}
                    });
                } else {
                    that.setState({ ...that.state,
                        sql: {table: res.result, msg: null, query: query}
                    });
                }
            }
        });
    }

    componentDidMount() {
        this.runSql( this.props.query, this.props.queryValue );
    }

    componentWillUpdate(nextProps) {
        if ( nextProps.query !== this.state.sql.query ) {
            this.runSql(nextProps.query);
        }
    }

    render() {
        let that = this;
        let msgBox = function() {
            if ( !that.state.sql.msg ) {
                return null;
            }
            return (
                <div className="errorMsgBox">
                    {that.state.sql.msg}
                </div>
            );
        };

        return (
            <Panel header={this.props.title} bsStyle="success" >
                {msgBox()}
                <TableView tableData={this.state.sql.table} />
            </Panel>
        );
    }
}
