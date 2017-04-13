import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

export default class TableView extends Component {
    static propTypes = {
        tableData: React.PropTypes.array,
        title: React.PropTypes.string,
        onCellClick: React.PropTypes.func,
        style: React.PropTypes.object
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

        let viewItems = this.props.tableData.slice(0, 100);

        let viewItemBody = viewItems.map( (el, row) => {
            let elementHtml = headers.map((key, col) => (<td className="txt-center" key={('body_cell_'+ row + '_' + col)} onClick={::this.onCellClick}>{el[key]}</td>));
            return <tr key={'body_row_' + row}>{elementHtml}</tr>
        });

        return (
            <div className="responsive" style={this.props.style}>
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