import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

/*
 <div class="tbl-grid-box txt-right">
 <table id="commcTrfcTable">
     <colgroup>
        <col style="width:8">
        <col style="width:7%">
     </colgroup>
    <caption title="이통사별 트래픽 리스트">이통사별 트래픽 리스트</caption>
    <thead>
     <tr>
         <th scope="col" rowspan="2" field="commcClf" title="이통사">이통사</th>
         <th scope="col" colspan="3" field="lastMnTrfc" title="전월 트래픽">전월 트래픽</th>
     </tr>
    <tr>
         <th scope="col" class="tbl-bor" field="lastmnFailCnt" title="실패 건수">실패 건수</th>
         <th scope="col" field="lastmnSuccCnt" title="정상 건수">정상 건수</th>
         <th scope="col" field="lastmnPayAmt" title="정상 금액">정상 금액</th>
     </tr>
    </thead>
    <tfoot id="commcTrfc" style="">
     <tr>
         <td class="txt-center">합계</td>
         <td>2</td>
     </tr>
    </tfoot>
    <tbody id="commcTrfcResult">
     <tr>
         <td class="txt-center">LGu+</td>
         <td class="txt-right">2</td>
     </tr>
    <tr>
         <td class="txt-center">KT</td>
         <td class="txt-right">0</td>
    </tr>
    <tr>
     <td class="txt-center">SKT</td>
     <td class="txt-right">0</td>
    </tbody>
    </table>
 </div>
 */
export default class TableView extends Component {
    static propTypes = {
        tableData: React.PropTypes.array,
        title: React.PropTypes.string,
        onCellClick: React.PropTypes.func
    }

    componentDidMount() {

    }
    componentWillUnmount() {

    }

    onCellClick( elementStr ) {
        console.log( 'onCellClick 1 :: ', elementStr );
        if ( this.props.onCellClick ) {
            this.props.onCellClick( elementStr.target.innerText );
        }
    }

    render() {
        let that = this;
        if ( !this.props.tableData || this.props.tableData.length === 0 ) {
            return null;
        }

        let headers = Object.getOwnPropertyNames(this.props.tableData[0]);

        let headersHtml = headers.map((el, index) => (<th scope="col" title={el} key={('header'+index)}>{el}</th>));

        let viewItems = this.props.tableData.slice(0, 20);

        let viewItemBody = viewItems.map( (el, row) => {
            let elementHtml = headers.map((key, col) => (<td className="txt-center" key={('body_cell_'+ row + '_' + col)} onClick={::this.onCellClick}>{el[key]}</td>));
            return <tr key={'body_row_' + row}>{elementHtml}</tr>
        });

        return (
            <div className="responsive">
                <Table bordered condensed hover>
                    {this.props.title ? (<caption title={this.props.title}>{this.props.title}</caption>) : null}
                    <thead>
                    <tr>
                        {headersHtml}
                    </tr>
                    </thead>
                    <tbody>
                    {viewItemBody}
                    </tbody>
                </Table>
            </div>
        );
    }
}