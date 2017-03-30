import React, { Component } from 'react';
import { ButtonToolbar, Button, PageHeader } from 'react-bootstrap';
import axios from 'axios';
import FileSaver from 'file-saver';

let GC = window.GC;

class ReportExcelPage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        this.props = {};
        this._excelIo = new window.GC.Spread.Excel.IO();
    }

    static propTypes = {
        reportData: React.PropTypes.object,
        masterId: React.PropTypes.string
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

    viewTemplateSetExcelData( reportData ) {
        let that = this;
        let tabNames = Object.getOwnPropertyNames( reportData );
        that._spread.suspendPaint();
        that._spread.suspendCalcService(false);
        tabNames.map( (tabName, tabIndex) => {
            let reportSheetData = reportData[tabName];
            if ( reportSheetData.constructor === Array ) { // isArray Check
                reportSheetData.map( (reportTableData, index) => {
                    that.sheetReportUpdate('Sheet' + tabIndex + 'Table' + index, reportTableData);
                });
            } else {
                that.sheetReportUpdate('Sheet' + tabIndex + 'Table1', reportSheetData);
            }
        });
        that._spread.resumeCalcService(true);
        that._spread.resumePaint();
    }

    viewExcelData(reportData) {
        let that = this;

        let spread = this._spread;
        //spread.options.tabStripRatio = 0.6;
        spread.options.autoFitType = GC.Spread.Sheets.AutoFitType.cellWithHeader;

        let tabNames = Object.getOwnPropertyNames( reportData );

        let setTableData = (sheet, dataset, title, posY, posX) => {
            let data = null;
            let headerNames = [];
            if ( dataset.res.result && dataset.res.result.length > 0 ) {
                data = dataset.res.result;
                headerNames = Object.getOwnPropertyNames( data[0] );
                if ( (posY + dataset.res.result.length + 5) > sheet.getRowCount()) {
                    sheet.setRowCount(posY + dataset.res.result.length + 5);
                }
                sheet.tables.addFromDataSource(title, posY, posX, dataset.res.result);
            }
            return {
                posX: posX,
                posY: posY,
                width: posY + headerNames.length,
                height: posX + (data && data.length || 0)
            }
        };

        spread.clearSheets();
        tabNames.map( (tabName, tabIndex) => {
            let reportSheetData = reportData[tabName];

            let sheet = new GC.Spread.Sheets.Worksheet(tabName);
            let posX = 1, posY = 1, maxWidth = 0;
            if ( reportSheetData.constructor === Array ) { // isArray Check
                reportSheetData.map( (reportTableData, index) => {
                    let tablePosition = setTableData(sheet, reportTableData, 'Sheet' + tabIndex + 'Table' + index, posY, posX);
                    posY += (tablePosition.height + 2);
                    maxWidth = Math.max( maxWidth, tablePosition.width );
                });
            } else {
                let tablePosition = setTableData(sheet, reportSheetData, 'Sheet' + tabIndex + 'Table1', posY, posX);
                maxWidth = Math.max( maxWidth, tablePosition.width );
            }
            //for ( var n = 0; n < maxWidth; n++ ) {
                //sheet.autoFitColumn(1);
            //}
            spread.addSheet(spread.getSheetCount(), sheet);
        });
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

    onTemplateLoadClick() {
        let that = this;
        axios.get('xlsxTemplate/template_report.xlsx', {
            responseType: 'arraybuffer'
        })
            .then(function(response) {
                console.log( 'TEMPLATE LOADED', response );
                that._excelIo.open(response.data, function(json) {
                    console.log( 'LOAD COMPLETE !!!' );
                    that._spread.suspendPaint();
                    that._spread.fromJSON( json );
                    that._spread.resumePaint();

                    setTimeout( function() {
                        if ( that._reportData ) {
                            that.viewTemplateSetExcelData(that._reportData);
                        }
                    }, 1);
                }, function( error ) {
                    alert(error.errorMessage);
                });
            })
            .catch(function(error) {
                console.error( 'TEMPLATE LOAD FAIL.', error );
            });
    }

    onJsonLoadClick() {
        let that = this;
        axios.get('xlsxTemplate/09gage.json')
            .then(function(response) {
                console.log( 'JSON LOADED', response );
                //that.viewExcelData(response.data);
                that._reportData = response.data;
                that.onTemplateLoadClick();
            })
            .catch(function(error) {
                console.error( 'TEMPLATE LOAD FAIL.', error );
            });
    }

    onJsonSaveClick() {
        if ( this.props.reportData ) {
            let fileName = this.props.masterId + '.json';
            let reportDataJson = JSON.stringify(this.props.reportData, null, '  ');
            FileSaver.saveAs(new Blob([reportDataJson], {type: 'text/plain;charset=utf-8'}), fileName);
        }
    }

    onViewChange() {
        if ( this.props.reportData ) {
            this.viewExcelData(this.props.reportData);
        }
    }

    onUpdateResize() {
        this.setState( ...this.state );
    }

    componentDidMount() {
        let that = this;
        this._spread = new window.GC.Spread.Sheets.Workbook( this.refs.spread, { sheetCount: 1 } );
        window.addEventListener('resize', ::this.onUpdateResize);

        this._reportData = this.props.reportData;
        that.onTemplateLoadClick();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', ::this.onUpdateResize);
    }

    render() {
        let tabHeight = window.outerHeight - 340;
        let spreadStyle = {
            'width': '100%',
            'height': tabHeight + 'px',
            'border': '1px solid gray'
        };

        return (
            <div>
                <ButtonToolbar>
                    <Button onClick={::this.onJsonLoadClick}>JSON Load</Button>
                    <Button onClick={::this.onJsonSaveClick}>JSON Save</Button>
                    <Button onClick={::this.saveAsFile}>Excel 파일 저장</Button>
                    <Button onClick={::this.onViewChange}>조회한 데이터만 처리</Button>
                    <Button onClick={::this.onTemplateLoadClick}>템플릿 형식</Button>
                </ButtonToolbar>
                <hr />
                <div style={spreadStyle} ref="spread" />
            </div>
        );
    }
}

export default ReportExcelPage;