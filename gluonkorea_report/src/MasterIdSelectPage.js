
import React, { Component } from 'react';
import { Form, FormGroup, FormControl, InputGroup, Button, Panel } from 'react-bootstrap';

import TableView from './TableView';

export default class MasterIdSelectPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sql: {}
        };
    }

    static propTypes = {
        workerImp: React.PropTypes.object,
        keywordTableName: React.PropTypes.string,
        onMasterIdClick: React.PropTypes.func
    }

    onRunSql( e ) {
        if ( e ) {
            e.preventDefault();
        }

        let that = this;
        let sql = `SELECT [마스터ID] FROM (SELECT [마스터ID] FROM ${this.props.keywordTableName} GROUP BY [마스터ID]) A`;
        if ( this.inputText && this.inputText.value ) {
            sql += ' WHERE [마스터ID] like "%' + this.inputText.value + '%"';
        }

        this.props.workerImp.sendSql(sql, function (res) {
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

    componentDidMount() {
        this.onRunSql();
    }

    componentWillUnmount() {

    }

    onMasterIdClick(masterId) {
        if ( this.props.onMasterIdClick ) {
            this.props.onMasterIdClick(masterId);
        }
    }

    render() {
        let that = this;
        let msgBox = function() {
            if ( !that.state.sql.msg ) {
                return null;
            }
            return (
                <div className="alert alert-warning">
                    {that.state.sql.msg}
                </div>
            );
        };

        let count = '';
        if ( this.state.sql && this.state.sql.table && this.state.sql.table.length ) {
            count = this.state.sql.table.length + '건';
        }

        return (
            <Form>
                <FormGroup controlId="masterIdInput" className="">
                    <FormControl inputRef={ref => { this.inputText = ref; }} type="text" placeholder="검색 필터" onKeyUp={::this.onRunSql} />
                </FormGroup>
                <br />
                <Panel header="Master ID 리스트">
                    {msgBox()}
                    {count && (<div className="text-right">{count}</div>)}
                    <TableView tableData={this.state.sql.table} onCellClick={::this.onMasterIdClick}/>
                </Panel>
            </Form>
        );
    }
}
