import React, { Component } from 'react';
import axios from 'axios';
import { Form, FormGroup, FormControl, DropdownButton, MenuItem, Button, Panel } from 'react-bootstrap';
import TableView from './TableView';
import Config from './Config';

export default class SellerIDSelectPage extends Component {
    constructor(props) {
        super(props);

        this._orignalData = [];
        this._choiceMonth = '';
        this.state = { monthData: [] };
    }

    static propTypes = {
        keywordTableName: React.PropTypes.string,
        onSellerIdClick: React.PropTypes.func,
        onExit: React.PropTypes.func
    }

    async updatePosibleMonth() {
        let that = this;
        this._choiceMonth = '';
        let url = Config.Server + '/report11st/searchPossibleMonth';
        try {
            let response = await axios.post(url,{ month: that._month }, { responseType: 'json' }).catch( (el) => { throw (''+el); } );
            if ( response.data && response.data.success ) {
                let monthData = response.data.data.map( (el) => {
                    return Object.values(el)[0];
                });

                this.setState( { ...this.state, monthData: monthData, scrollTop: 0 } );
                if ( this.props.month ) {
                    this.onDropDownBtn( this.props.month );
                }
            } else {
                if ( response.data && response.data.loginfail ) {
                    alert( response.data.msg );
                    location.replace('/');
                }
                this.setState( { ...this.state, monthData: [], scrollTop: 0 } );
            }
        } catch( e ) {
            alert( e );
            that.setState({
                    ...that.state,
                    monthData: [],
                    table: null,
                    msg: e,
                    scrollTop: 0
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
                    return item.sellerId.indexOf(that.inputText.value) > -1;
                });
            }
            that.setState({
                ...that.state,
                table: viewData,
                msg: null,
                scrollTop: 0
            }, () => {
                that.refs.tableView.setState( { highlight: '' } );
            });
        } else {
            let url = Config.Server + '/report11st/searchSellerId';
            try {

                that._orignalData = [];                
                let response = await axios.post(url,{ month: that._choiceMonth }, { responseType: 'json' }).catch( (error) => { throw `${''+error}` } );
                if (response) {
                    if ( response.data && response.data.success ) {
                        that._orignalData = response.data.data;

                        if ( that._orignalData.length > 0 ) {
                            that.onSearchID();

                            let scrollTop = sessionStorage.getItem("tableViewScrollTop") || 0;
                            scrollTop = isNaN(scrollTop) ? 0 : parseInt(scrollTop, 10);
                            that.setState( { ...that.state, scrollTop }, () => {
                                if ( sessionStorage.getItem("sellerId") ) {
                                    that.refs.tableView.setState( { highlight: "sellerId=" + sessionStorage.getItem("sellerId") } );
                                } else {
                                    that.refs.tableView.setState( {} );
                                }
                                that.refs.tableView.setScroll( scrollTop );
                            });
                        }
                    } else {
                        throw `${response.data.msg}`;
                    }
                }
            } catch (e) {
                that.setState({
                    ...that.state,
                    table: null,
                    msg: e,
                    scrollTop: 0
                });
            }
        }
    }

    componentWillMount() {

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

    onSellerClick( element ) {
        console.log( element );
        if ( this.refs.tableView ) {
            sessionStorage.setItem( "tableViewScrollTop", this.refs.tableView.getScroll() );
        }
        if ( this.props.onSellerClick ) {
            this.props.onSellerClick(this._choiceMonth, element.sellerId );
        }
    }

    onRefresh() {
        sessionStorage.removeItem("month");
        sessionStorage.removeItem("sellerId");
        sessionStorage.removeItem("tableViewScrollTop");
        this.onSearchID(null, 'clear');
    }

    onDropDownBtn( eventKey, e ) {
        if ( e ) {
            e.preventDefault();
            sessionStorage.removeItem("tableViewScrollTop");
            sessionStorage.removeItem("sellerId");
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
            count = `Seller ID 리스트 (${this.state.table.length}건)`;
        }

        let tabHeight = window.outerHeight - 265;
        let tabbodyStyle = {
            'height': tabHeight + 'px',
            'overflowY': 'scroll'
        };

        let highlight = "sellerId=" + this.props.sellerId;

        let tableView = () => {
            if ( this.state.monthData && this.state.monthData.length > 0 ) {
                return <TableView ref="tableView" style={tabbodyStyle} tableData={this.state.table} onCellClick={::this.onSellerClick} scrollTop={this.state.scrollTop} 
                        highlight={highlight} />;
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
                    <Button bsStyle="primary" onClick={ev => { this.onRefresh(); }}>새로고침</Button>
                    {' '}
                    <FormGroup controlId="sellerIdInput" style={{margin:'0'}}>
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
