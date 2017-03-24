import React, { Component } from 'react';
import { Grid, Row, Col, Panel, Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import TableView from './TableView';

export default class QueryViewPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sql: {}
        };
    }

    static propTypes = {
        workerImp: React.PropTypes.object
    }

    onRunSql( e ) {
        e.preventDefault();

        let that = this;
        let sql = window.sqlTextArea.value;
        if ( !sql ) {
            return;
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

    onUpdateResize() {
        this.setState( ...this.state );
    }

    componentDidMount() {
        window.addEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
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

        let tabHeight = window.outerHeight - 400;
        let tabbodyStyle = {
            'height': tabHeight + 'px',
            'overflowY': 'scroll'
        };
        return (
            <Grid fluid={true}>
                <Row>
                    <Col xs={6}>
                        <FormGroup controlId="sqlTextArea" >
                            <FormControl componentClass="textarea" placeholder="SQL 명령어를 입력하세요." />
                        </FormGroup>
                    </Col>
                    <Col xs={2}>
                        <Button onClick={::this.onRunSql}>SQL EXEC</Button>
                    </Col>
                </Row>
                <Row>
                    <Panel header="SQL 결과" >
                        {msgBox()}
                        <TableView style={tabbodyStyle} tableData={this.state.sql.table} />
                    </Panel>
                </Row>
            </Grid>
        );
    }
}
