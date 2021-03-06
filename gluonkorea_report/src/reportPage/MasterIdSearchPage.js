import React, { Component } from 'react';
import axios from 'axios';
import { Form, FormGroup, FormControl, DropdownButton, MenuItem, Button, Panel } from 'react-bootstrap';
import TableView from './TableView';

export default class MasterIdSelectPage extends Component {
    constructor(props) {
        super(props);

        this._orignalData = [];
        this._choiceMonth = '';
        this.state = { monthData: [] };
    }

    static propTypes = {
        keywordTableName: React.PropTypes.string,
        onMasterIdClick: React.PropTypes.func,
        onExit: React.PropTypes.func
    }

    async updatePosibleMonth() {
        let that = this;
        this._choiceMonth = '';
        let url = 'http://' + location.hostname + ':3030/report/searchPossibleMonth';
        try {
            let response = await axios.post(url,{ month: that._month }, { responseType: 'json' }).catch( (el) => { throw (''+el); } );
            if ( response.data && response.data.success ) {
                let monthData = response.data.data.map( (el) => {
                    return Object.values(el)[0];
                });
                this.setState( { ...this.state, monthData: monthData } );
            } else {
                this.setState( { ...this.state, monthData: [] } );
            }
        } catch( e ) {
            that.setState({
                    ...that.state,
                    monthData: [],
                    table: null,
                    msg: e
                });
        }
    }

    async onSearchID( e, isClear ) {
        if ( e ) {
            e.preventDefault();
        }

        let that = this;

        console.log( 'onSearchID :: ', e, isClear );
        if ( isClear === 'clear' ) {
            that.inputText.value = '';
            that.onSearchID();
            return;
        }

        if ( that._orignalData.length > 0 ) {
            let viewData = that._orignalData;
            if ( that.inputText.value ) {
                viewData = that._orignalData.filter((item) => {
                    return item.masterId.indexOf(that.inputText.value) > -1;
                });
            }
            that.setState({
                ...that.state,
                table: viewData,
                msg: null
            });
        } else {
            let url = 'http://' + location.hostname + ':3030/report/searchMasterId';
            try {
                that._orignalData = [];                
                let response = await axios.post(url,{ month: that._choiceMonth }, { responseType: 'json' }).catch( (error) => { throw `${''+error}` } );
                if (response) {
                    if ( response.data && response.data.success ) {
                        that._orignalData = response.data.data;

                        if ( that._orignalData.length > 0 ) {
                            that.onSearchID();
                        }
                    } else {
                        throw `${response.data.msg}`;
                    }
                }
            } catch (e) {
                that.setState({
                    ...that.state,
                    table: null,
                    msg: e
                });
            }
        }
    }

    componentDidMount() {
        let that = this;
        window.addEventListener('resize', ::this.onUpdateResize);
        that.updatePosibleMonth();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
    }

    onUpdateResize() {
        this.forceUpdate();
    }

    onMasterIdClick(masterId) {
        console.log( masterId );
        if ( this.props.onMasterIdClick ) {
            this.props.onMasterIdClick(this._choiceMonth, masterId);
        }
    }

    onDropDownBtn( eventKey, e ) {
        if ( e ) {
            e.preventDefault();
        }

        this.refs.dropDownBtn.title = eventKey;
        this._choiceMonth = eventKey;
        this._orignalData = [];
        this.onSearchID(null, 'clear');
    }

    render() {
        let that = this;
        let msgBox = function() {
            if ( !that.state.msg ) {
                return null;
            }
            return (
                <div className="alert alert-warning">
                    {that.state.msg}
                </div>
            );
        };

        let count = '날짜 선택이 되지 않았습니다.';
        if ( this.state && this.state.table && this.state.table.length ) {
            count = `Master ID 리스트 (${this.state.table.length}건)`;
        }

        let tabHeight = window.outerHeight - 265;
        let tabbodyStyle = {
            'height': tabHeight + 'px',
            'overflowY': 'scroll'
        };

        let tableView = () => {
            if ( this.state.monthData && this.state.monthData.length > 0 ) {
                return <TableView style={tabbodyStyle} tableData={this.state.table} onCellClick={::this.onMasterIdClick}/>;
            }
            return null;
        };

        let monthItems = this.state.monthData.map( (el) => {
            return <MenuItem key={el} eventKey={el}>{el}</MenuItem>;
        });

        let monthTitle = this._choiceMonth || '날짜선택';

        return (
            <div>
                <br />
                <Form inline>
                    <DropdownButton ref="dropDownBtn" title={monthTitle} id="month" onSelect={::this.onDropDownBtn}>
                        {monthItems}
                    </DropdownButton>
                    {' '}
                    <Button bsStyle="primary" onClick={ev => { this.onSearchID(ev, 'clear'); }}>새로고침</Button>
                    {' '}
                    <FormGroup controlId="masterIdInput" style={{margin:'0'}}>
                        <FormControl inputRef={ref => { this.inputText = ref; }} type="text" placeholder="검색 필터" onKeyUp={::this.onSearchID} />
                    </FormGroup>
                </Form>
                <br />
                <Panel header={count}>
                    {msgBox()}
                    {tableView()}
                </Panel>
            </div>
        );
    }
}
