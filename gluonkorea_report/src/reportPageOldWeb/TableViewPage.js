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
        tableName: React.PropTypes.string
    }

    showTable( tableName ) {
        let that = this;
        let SQL_COUNT = `SELECT COUNT(*) as [COUNT] FROM [${tableName}]`;

        that.props.workerImp.sendSql(SQL_COUNT, function (res) {
            if ( !res ) return;

            if ( res.type === 'error' ) {
                that.setState({
                    ...that.state,
                    sql: {table: null, msg: res.msg, title: tableName, tableName: tableName}
                });
            } else {
                let nCount = 0;
                if ( res.result && res.result[0] ) {
                    nCount = res.result[0].COUNT;
                }

                let SQL = `SELECT * FROM [${tableName}]`;
                if ( nCount > 10000) {
                    SQL += ' LIMIT 10000';
                }

                let title = `${tableName} (${nCount}건)`;
                that.props.workerImp.sendSql(SQL, function (res2) {
                    if (res2.type === 'error') {
                        that.setState({
                            ...that.state,
                            sql: {table: null, msg: res2.msg, title: title, tableName: tableName}
                        });
                    } else {
                        that.setState({
                            ...that.state,
                            sql: {table: res2.result, msg: null, title: title, tableName: tableName}
                        });
                    }
                });
            }
        });
    }

    componentDidMount() {
        this.showTable( this.props.tableName );
    }

    componentWillUpdate(nextProps) {
        if ( nextProps.tableName !== this.state.sql.tableName ) {
            this.showTable( this.props.tableName );
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
            <Panel header={this.state.sql.title} bsStyle="success" >
                {msgBox()}
                <TableView tableData={this.state.sql.table} />
            </Panel>
        );
    }
}
