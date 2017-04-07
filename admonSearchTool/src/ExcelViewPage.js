import React, { Component } from 'react';
import { ButtonToolbar, Button, PageHeader } from 'react-bootstrap';
import axios from 'axios';
import FileSaver from 'file-saver';
import $ from 'jquery';

let GC = window.GC;

class MessageView extends Component {
    constructor() {
        super();

        this.state = {
            msg: ''
        };
    }
    updateMsg( msg ) {
        this.setState( { msg: msg } );
    }
    render() {
        if ( !this.state.msg ) {
            return null;
        }
        return (
            <div className="alert alert-warning">
                {this.state.msg}
            </div>
        );
    }
}

class ExcelViewPage extends Component {
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
                if ( sheet.getValue(i, col) ) {
                    resultData.push( { key: sheet.getValue(i, col), run: false, data: null } );
                }
            }
            this.refs.msgView.updateMsg( 'GET DATA : ' + resultData.length );
        }
        return resultData;
        // activeSheet.showRow(9, GC.Spread.Sheets.VerticalPosition.top);
    }

    callServer() {
        let that = this;
        let searchData = this.getAdSearchData();
        let url = 'http://' + location.hostname + ':3030/admonSearch';
        let data = null;

        if ( searchData.length > 0 ) {
            data = searchData.map( (item) => {
                return item.key;
            });
            data = data.filter( (el) => {
                return !isNaN(parseInt( el, 10 ));
            });
        } else {
            alert( '데이터를 찾을 수 없습니다.' );
            return;
        }
        axios.post( url, {
            id: 'hlmaster',
            pass: 'pih2001##',
            data: data
        }, {
            responseType: 'json'
        }).then(( res ) => {
            if ( res.status === 200 && res.data.success === true ) {
                let data = res.data.data;
                that.refs.msgView.updateMsg( '수신 완료 : ' + data.length );
                console.log( res.data );
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
    }

    sheetReportUpdate( tableName, reportTableData ) {
        let spread = this._spread;
        if ( !reportTableData.excelTmplInfo ) {
            console.error( 'NOT DEFINED - reportTableData.excelTmplInfo', reportTableData.title );
            return;
        }

        let sheet = spread.getSheetFromName(reportTableData.excelTmplInfo.sheetName);
        if ( !sheet ) {
            console.error( 'SheetName Not found !!!', reportTableData.excelTmplInfo.sheetName );
            return;
        }
        console.log( 'SheetName - FOUND : ', reportTableData.excelTmplInfo.sheetName );

        let dataset = reportTableData.res.result;
        if ( !dataset ) {
            console.error( 'SheetName - FOUND : ', reportTableData.title, 'RESULT IS NULL !!!' );
            return;
        }

        let headerNames = reportTableData.excelTmplInfo.header;
        let { startX, startY, baseWidth } = reportTableData.excelTmplInfo.position;

        if ( (startY + dataset.length + 5) > sheet.getRowCount()) {
            sheet.setRowCount(startY + dataset.length + 5);
        }

        for ( let y = 0; y < dataset.length - 1; y++ ) {
            sheet.copyTo( startY, startX, startY+y+1, startX, 1, baseWidth, GC.Spread.Sheets.CopyToOptions.all );
        }

        if ( dataset.length > 0 ) {
            let colNames = Object.getOwnPropertyNames(dataset[0]);
            if (colNames.length > 0 ) {
                dataset.map((elY, y) => {
                    colNames.map( (elX, x) => {
                        let cell = sheet.getCell(startY + y, startX + x );
                        cell.value( dataset[y][elX] );
                        cell.formula('');
                    });
                });
            }
        }

        if ( reportTableData.excelTmplInfo.fixHeight ) {
            let fillHeight = reportTableData.excelTmplInfo.fixHeight - dataset.length;
            if ( fillHeight > 0 ) {
                sheet.clear( startY + dataset.length, startX, fillHeight, baseWidth, GC.Spread.Sheets.SheetArea.viewport,GC.Spread.Sheets.StorageType.data + GC.Spread.Sheets.StorageType.style);
            }
        }
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

    onLoadedTemplateExcel(e) {
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

            setTimeout( function() {
                if ( that._reportData ) {
                    that.viewTemplateSetExcelData(that._reportData);
                }
                if ( window._loading ) {
                    window._loading.close();
                }
            }, 1);
        }, function( error ) {
            alert(error.errorMessage);
        });
    }

    onUpdateResize() {
        //this.setState( ...this.state );
        this.forceUpdate();
    }

    componentDidMount() {
        this._spread = new window.GC.Spread.Sheets.Workbook( this.refs.spread, { sheetCount: 1 } );
        window.addEventListener('resize', ::this.onUpdateResize);

        this._reportData = this.props.reportData;
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
        let tabHeight = window.outerHeight - 270;
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
                <ButtonToolbar>
                    <Button onClick={::this.onFileOpen}>Excel 파일 오픈</Button>
                    <Button onClick={::this.saveAsFile}>Excel 파일 저장</Button>
                    <Button onClick={::this.callServer}>데이터 가져오기</Button>
                    <input ref="fileOpen" style={styleHiddenFile} className="hiddenFile" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={::this.onLoadedTemplateExcel} />
                </ButtonToolbar>
                <hr />
                <MessageView ref="msgView" />
                <div style={spreadStyle} ref="spread" />
            </div>
        );
    }
}

export default ExcelViewPage;