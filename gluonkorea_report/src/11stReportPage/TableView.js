import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

export default class TableView extends Component {
    static propTypes = {
        tableData: React.PropTypes.array,
        title: React.PropTypes.string,
        onCellClick: React.PropTypes.func,
        style: React.PropTypes.object,
        scrollTop: React.PropTypes.number
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        if ( this.refs.tableScroll && typeof(this.props.scrollTop) === 'number' ) {
            this.refs.tableScroll.scrollTop = this.props.scrollTop;
        }
    }
    componentWillUnmount() {

    }

    onCellClick( element ) {
        console.log( 'onCellClick 1 :: ' );
        if ( this.props.onCellClick ) {
            this.props.onCellClick( element );
        }
    }

    setScroll( number ) {
        if ( this.refs.tableScroll && number > 0 ) {
            this.refs.tableScroll.scrollTop = number;
        }
    }

    getScroll() {
        if ( !this.refs.tableScroll ) {
            return 0;
        }
        return this.refs.tableScroll.scrollTop;
    }

    componentDidUpdate() {
        if ( typeof(this.props.scrollTop) === 'number' ) {
            this.refs.tableScroll.scrollTop = this.props.scrollTop;
        }
    }

    render() {
        let that = this;
        if ( !this.props.tableData || this.props.tableData.length === 0 ) {
            return null;
        }

        let headers = Object.getOwnPropertyNames(this.props.tableData[0]);

        let headersHtml = headers.map((el, index) => (<th scope="col" title={el} key={('header'+index)}>{el}</th>));

        let viewItems = this.props.tableData.slice(0, 500);
        let highlight = this.state.highlight;
        if ( highlight ) {
            highlight = highlight.split('=');
        }

        let viewItemBody = viewItems.map( (el, row) => {
            let highlightStyle = {};
            if ( highlight && highlight.length === 2 && el[ highlight[0] ] === highlight[1] ) {
                highlightStyle = { color: "red" };
            }
            let elementHtml = headers.map((key, col) => {                
                return <td className="txt-center" style={highlightStyle} key={('body_cell_'+ row + '_' + col)} onClick={() => { this.onCellClick(el); }}>{el[key]}</td>
            });
            return <tr key={'body_row_' + row}>{elementHtml}</tr>
        });

        return (
            <div ref="tableScroll" className="responsive" style={this.props.style}>
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