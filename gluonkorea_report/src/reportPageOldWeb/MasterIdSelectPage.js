
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
        let sql = `SELECT [마스터ID] FROM (SELECT [마스터ID] FROM [${this.props.keywordTableName}] GROUP BY [마스터ID]) A`;
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
        window.addEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
    }

    onUpdateResize() {
        this.forceUpdate();
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

        let count = 'Master ID 리스트 - ';
        if ( this.state.sql && this.state.sql.table && this.state.sql.table.length ) {
            count += this.state.sql.table.length + '건';
        }

        let tabHeight = window.outerHeight - 350;
        let tabbodyStyle = {
            'height': tabHeight + 'px',
            'overflowY': 'scroll'
        };

        return (
            <Form>
                <FormGroup controlId="masterIdInput" style={{margin:'0'}}>
                    <FormControl inputRef={ref => { this.inputText = ref; }} type="text" placeholder="검색 필터" onKeyUp={::this.onRunSql} />
                </FormGroup>
                <br />
                <Panel header={count}>
                    {msgBox()}
                    <TableView style={tabbodyStyle} tableData={this.state.sql.table} onCellClick={::this.onMasterIdClick}/>
                </Panel>
            </Form>
        );
    }
}
