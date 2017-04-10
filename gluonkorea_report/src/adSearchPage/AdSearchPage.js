import React, { Component } from 'react';
import { Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import axios from 'axios';
import FileSaver from 'file-saver';
import $ from 'jquery';

let GC = window.GC;

let SEND_INTERVAL = 2000;

class MessageView extends Component {
    constructor() {
        super();

        this.state = {
            msg: ' '
        };
    }
    updateMsg( msg ) {
        this.setState( { msg: msg } );
    }
    render() {
        return (
            <div className="alert alert-warning" style={{ 'marginBottom': '0', height: '52px' }}>
                {this.state.msg}
            </div>
        );
    }
}

class AdSearchPage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        this.props = {};
        this._excelIo = new window.GC.Spread.Excel.IO();
    }

    getAdSearchData() {
        let spread = this._spread;
        let sheet = spread.getActiveSheet();

        let resultData = [];
        let selectedRanges = spread.getActiveSheet().getSelections();
        if ( selectedRanges.length > 0 ) {
            let col = selectedRanges[0].col;
            for (let i = 0; i < sheet.getRowCount(); i++) {
                let item = sheet.getValue(i, col);
                if ( item && item.length >= 10 ) {
                    resultData.push( { key: item, col: col, row : i, run: false, data: null } );
                } else {
                    alert('사업자 번호가 있는 컬럼을 선택해 주세요.');
                    return [];
                }
            }
            this.refs.msgView.updateMsg( 'GET DATA : ' + resultData.length );
        } else {
            alert('사업자 번호가 있는 컬럼을 선택해 주세요.');
            return [];
        }
        return resultData;
    }

    updateSheetData( original_data, recvData ) {
        let spread = this._spread;
        let sheet = spread.getActiveSheet();

        let baseCol = original_data[0].col + 4;
        if ( sheet.getColumnCount() < baseCol ) {
            sheet.setColumnCount(baseCol);
        }

        let findItem = ( key ) => {
            for ( let i = 0; i < recvData.length; i++ ) {
                if ( recvData[i] && recvData[i].advCom &&
                     recvData[i].advCom.comno === ('' + key.replace( /-/g, '' )) ) {
                    return recvData[i];
                }
            }
            return null;
        };

        spread.suspendPaint();
        let maxRow = -1;
        for ( let i = 0; i < original_data.length; i++ ) {
            let item = findItem( original_data[i].key );
            if ( item !== null ) {
                let { row, col } = original_data[i];
                if ( !item.advId ) {
                    sheet.setValue(row, col + 1, 'N');
                } else {
                    sheet.setValue(row, col + 1, 'Y');
                    sheet.setValue(row, col + 2, item.advId);
                    sheet.setValue(row, col + 3, item.advCom.repName);
                    sheet.setValue(row, col + 4, item.advCom.comName);
                }
                maxRow = row;
            }
        }
        if ( maxRow > -1 ) {
            sheet.showRow(maxRow, GC.Spread.Sheets.VerticalPosition.bottom);
        }
        spread.resumePaint();
    }

    callServer() {
        let that = this;
        let searchData = this.getAdSearchData();
        let dataList = null;

        if ( searchData.length == 0 ) {
            return;
        }

        dataList = searchData.map( (item) => {
            return item.key.replace( /-/g, '' );
        });
        dataList = dataList.filter( (el) => {
            return !isNaN(parseInt( el, 10 ));
        });

        let ID = window.adSearchId.value; // 'hlmaster',
        let PASS = window.adSearchPass.value; // 'pih2001##'

        if ( !ID || !PASS ) {
            alert( '아이디 혹은 패스워드가 입력되지 않았습니다.' );
            return;
        }

        let recursiveCall = () => {
            let callItem = dataList.splice( 0, 20 );

            let url = 'http://' + location.hostname + ':3030/admonSearch';
            axios.post( url, {
                id: ID,
                pass: PASS,
                data: callItem
            }, {
                responseType: 'json'
            }).then(( res ) => {
                if ( res.status === 200 && res.data.success === true ) {
                    let resData = res.data.data;
                    that.refs.msgView.updateMsg( '수신 완료 : ' + resData.length );
                    that.updateSheetData( searchData, resData );

                    if ( dataList.length > 0 ) {
                        setTimeout(function () {
                            recursiveCall();
                        }, Math.floor(Math.random() * SEND_INTERVAL) + 1);
                    } else {
                        that.refs.msgView.updateMsg( '조회가 완료되었습니다.' );
                    }
                } else {
                    if ( res.data.msg ) {
                        that.refs.msgView.updateMsg( res.data.msg );
                    } else {
                        that.refs.msgView.updateMsg( '연결 데이터 오류' + JSON.stringify(res.data) );
                    }
                }
            }).catch(( error ) => {
                if ( error.response && error.response.data ) {
                    if ( error.response.data.msg ) {
                        that.refs.msgView.updateMsg (error.response.data.msg );
                    } else {
                        that.refs.msgView.updateMsg( '서버결과: ' + error.response.data.status + ':' + error.response.data );
                    }
                } else {
                    that.refs.msgView.updateMsg('연결오류 : ' + error.message );
                }
            });
        };

        recursiveCall();
    }

    saveAsFile() {
        let json = this._spread.toJSON( {includeBindingSource: true} );
        let fileName = this.props.masterId + '.xlsx';

        // here is excel IO API
        this._excelIo.save(json, function (blob) {
            FileSaver.saveAs(blob, fileName);
        }, function (e) {
            // process error
            console.log(e);
        });
    }

    onLoadedExcel(e) {
        e.stopPropagation();
        e.preventDefault();

        let files = e.dataTransfer && e.dataTransfer.files;
        if ( !files ) {
            files = e.target.files;
        }

        if ( !files || files.length !== 1 ) {
            alert( '파일이 선택되지 않았거나 여러개 선택 되었습니다.' );
            return;
        }

        let that = this;
        that._excelIo.open(files[0], function(json) {
            console.log( 'LOAD COMPLETE !!!' );
            that._spread.suspendPaint();
            that._spread.fromJSON( json );
            that._spread.resumePaint();
        }, function( error ) {
            alert(error.errorMessage);
        });
    }

    onUpdateResize() {
        this.forceUpdate();
    }

    componentDidMount() {
        this._spread = new window.GC.Spread.Sheets.Workbook( this.refs.spread, { sheetCount: 1 } );
        window.addEventListener('resize', ::this.onUpdateResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
    }

    onFileOpen() {
        if ( this.refs.fileOpen ) {
            $(this.refs.fileOpen).trigger('click');
        }
    }

    render() {
        let tabHeight = window.outerHeight - 225;
        let spreadStyle = {
            'width': '100%',
            'height': tabHeight + 'px',
            'border': '1px solid gray'
        };

        let styleHiddenFile = {
            visibility: 'hidden',
            display: 'inline',
            width: '5px'
        };

        return (
            <div>
                <Form inline style={{ margin: '10px' }}>
                    <FormGroup>
                        <Button onClick={::this.onFileOpen}>Excel 파일 오픈</Button>
                        <Button onClick={::this.saveAsFile}>Excel 파일 저장</Button>
                        <input ref="fileOpen" style={styleHiddenFile} className="hiddenFile" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={::this.onLoadedExcel} />
                        {' '}
                    </FormGroup>
                    <div style={{ width:'20px', height: '10px', display:'inline-block' }}></div>
                    <FormGroup controlId="adSearchId">
                        <ControlLabel>아이디</ControlLabel>
                        {'  '}
                        <FormControl type="text" placeholder="아이디" />
                    </FormGroup>
                    {' '}
                    <FormGroup controlId="adSearchPass">
                        <ControlLabel>패스워드</ControlLabel>
                        {' '}
                        <FormControl type="password" placeholder="패스워드" />
                    </FormGroup>
                    {' '}
                    <Button onClick={::this.callServer}>데이터 가져오기</Button>
                </Form>
                <hr style={{ marginTop: '0' }}/>
                <div style={spreadStyle} ref="spread" />
                <MessageView ref="msgView" />
            </div>
        );
    }
}

export default AdSearchPage;