import React, { Component } from 'react';
import { ButtonToolbar, Button, PageHeader } from 'react-bootstrap';
import axios from 'axios';
import FileSaver from 'file-saver';
import $ from 'jquery';

let GC = window.GC;
let Highcharts = window.Highcharts;

class ReportData {
    constructor( sheet ) {
        this.sheet = sheet;
    }
    getData( props ) {
        if ( !this.sheet ) return null;

        let values = [];
        for ( var x = props.x; x < (props.x + props.cols); x++ ) {
            for ( var y = props.y; y < (props.y + props.rows); y++ ) {
                let value = this.sheet.getCell( y, x ).value() || 0;
                if ( props.percent ) {
                    value = parseInt(value * 100, 10);
                }
                values.push( value );
            }
        }
        return values;
    }
}

class ReportExcelPage extends Component {
    constructor(props) {
        super(props);

        this.state = {};
        this.props = {};
        this._excelIo = new window.GC.Spread.Excel.IO();
    }

    static propTypes = {
        reportData: React.PropTypes.object,
        sellerId: React.PropTypes.string
    }

    sheetReportUpdate( tableName, reportTableData, sheetReportUpdate ) {
        let that = this;
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

        if ( reportTableData.type === 'chart' && reportTableData.chartDataFunc ) {
            let position = reportTableData.excelTmplInfo.position;

            let divElement = document.createElement('div');
            this.refs.chart.appendChild( divElement );

            let width = position.width + 'px', height = position.height + 'px';
            divElement.style.width = width;
            divElement.style.minWidth = width;
            divElement.style.maxWidth = width;
            divElement.style.height = height;
            divElement.style.minHeight = height;
            divElement.style.maxHeight = height;

            reportTableData.chartEndRun = () => {
                let chartData = reportTableData.chartDataFunc( that._reportData, new ReportData( sheet ) );
                let chart = Highcharts.chart( divElement, chartData );

                var svgData = chart.getSVG({
                    exporting: {
                        sourceWidth: chart.chartWidth,
                        sourceHeight: chart.chartHeight
                    }
                });

                var canvas = document.createElement('canvas');
                canvas.width = chart.chartWidth;
                canvas.height = chart.chartHeight;
                var ctx = canvas.getContext('2d');

                var img = document.createElement('img');
                img.setAttribute('src', 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData))));
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    sheet.pictures.add( reportTableData.title, canvas.toDataURL('image/png'), position.x, position.y, position.width, position.height );

                    /*
                    var picture = sheet.pictures.get(reportTableData.title);
                    picture.pictureStretch(GC.Spread.Sheets.ImageLayout.center);
                    picture.borderColor("Gray");
                    picture.borderWidth(2);
                    */

                    divElement.remove();
                };
            };
            return;
        }

        let dataset = reportTableData.data;
        if ( !dataset ) {
            console.error( 'SheetName - FOUND : ', reportTableData.title, 'RESULT IS NULL !!!' );
            return;
        }

        console.log( reportTableData.excelTmplInfo );

        let { viewSet, viewSetFunc } = reportTableData.excelTmplInfo;
        if ( viewSetFunc ) {
            viewSetFunc( sheetReportUpdate, reportTableData );
        }
        if ( viewSet && Array.isArray(viewSet) === false ) {
            for ( var key in viewSet ) {
                let cell = sheet.getCell( viewSet[key].y, viewSet[key].x );
                if ( dataset.length > 0 && typeof(dataset[0][key]) !== 'undefined' ) {
                    cell.value( dataset[0][key] );
                    cell.formula('');
                } else {
                    cell.clear(GC.Spread.Sheets.StorageType.data);
                }
            }
            return;
        }

        let headerNames = reportTableData.excelTmplInfo.header;
        let { startX, startY, baseWidth } = reportTableData.excelTmplInfo.position;

        if ( (startY + dataset.length + 1) > sheet.getRowCount()) {
            sheet.setRowCount(startY + dataset.length + 1);
        }

        let fixHeight = reportTableData.excelTmplInfo.fixHeight || 0;

        if ( reportTableData.excelTmplInfo.addAuto && dataset.length - fixHeight > 0 ) {
            sheet.addRows( startY + fixHeight, dataset.length - fixHeight );
        }

        for ( let y = 0; y < dataset.length - 1; y++ ) {
            sheet.copyTo( startY, startX, startY+y+1, startX, 1, baseWidth, GC.Spread.Sheets.CopyToOptions.all );
        }

        if ( dataset.length > 0 ) {
            if ( viewSet ) {
                dataset.map((elY, y) => {
                    viewSet.map( (elX, x) => {
                        let cell = sheet.getCell(startY + y, startX + x );
                        if ( typeof(dataset[y][elX]) !== 'undefined' ) {
                            cell.value( dataset[y][elX] );
                            cell.formula('');
                        } else {
                            cell.clear(GC.Spread.Sheets.StorageType.data);
                        }
                    });
                });
            } else {
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
        }

        if ( reportTableData.excelTmplInfo.fixHeight ) {
            let fillHeight = reportTableData.excelTmplInfo.fixHeight - dataset.length;
            if ( fillHeight > 0 ) {
                sheet.clear( startY + dataset.length, startX, fillHeight, baseWidth, GC.Spread.Sheets.SheetArea.viewport,GC.Spread.Sheets.StorageType.data + GC.Spread.Sheets.StorageType.style);
            }
        }

        if ( reportTableData.excelTmplInfo.sameMergeRowsPos ) {
            let sameMergeRowsPos = reportTableData.excelTmplInfo.sameMergeRowsPos;
            let mergeFind = (elName) => {
                let item = [];
                let pos = {};
                dataset.map( (el, y) => {
                    if ( pos.data === el[ elName ] ) {
                        pos.depth++;
                    } else {
                        if ( pos.depth > 1 ) {
                            item.push( Object.assign( {}, pos ) );
                        }
                        pos.startPos = y;
                        pos.depth = 1;
                        pos.data = el[ elName ];
                    }
                });
                if ( pos.depth > 1 ) {
                    item.push( Object.assign( {}, pos ) );
                }
                return item;
            };

            let colNames = Object.getOwnPropertyNames(dataset[0]);
            let refItems = mergeFind( colNames[sameMergeRowsPos[0]] );
            for ( let posX of sameMergeRowsPos ) {
                refItems.map((el) => {
                    sheet.addSpan( startY + el.startPos, startX + posX, el.depth, 1, GC.Spread.Sheets.SheetArea.viewport );
                    for ( let y = 1; y < el.depth; y++ ) {
                        let item = sheet.getCell( startY + el.startPos + y, startX + posX );
                        item.value( 0 );
                    }
                });
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
                    that.sheetReportUpdate('Sheet' + tabIndex + 'Table' + index, reportTableData, reportSheetData );
                });
            } else {
                that.sheetReportUpdate('Sheet' + tabIndex + 'Table1', reportSheetData);
            }
        });
        that._spread.resumeCalcService(true);
        that._spread.resumePaint();

        tabNames.map( (tabName, tabIndex) => {
            let reportSheetData = reportData[tabName];
            if ( reportSheetData.constructor === Array ) { // isArray Check
                reportSheetData.map( (reportTableData, index) => {
                    if ( typeof(reportTableData.chartEndRun) === 'function' ) {
                        setTimeout( reportTableData.chartEndRun, 1 );
                    }
                });
            } else {
                if ( typeof(reportSheetData.chartEndRun) === 'function' ) {
                    setTimeout( reportSheetData.chartEndRun, 1 );
                }
            }
        });
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
            if ( dataset.data && dataset.data.length > 0 ) {
                data = dataset.data;
                headerNames = Object.getOwnPropertyNames( data[0] );
                if ( (posY + dataset.data.length + 5) > sheet.getRowCount()) {
                    sheet.setRowCount(posY + dataset.data.length + 5);
                }
                sheet.tables.addFromDataSource(title, posY, posX, dataset.data);
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
        let fileName = this.props.sellerId + '.xlsx';

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

        if ( window._loading ) {
            window._loading.show();
        }
        axios.get('xlsxTemplate/11stSellerTemplate.xlsx', {
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
                        if ( window._loading ) {
                            window._loading.close();
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
            let fileName = this.props.sellerId + '.json';
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

    onTemplateFileClick() {
        if ( this.refs.templateFile ) {
            $(this.refs.templateFile).trigger('click');
        }
    }

    onExit() {
        if ( this.props.onExit ) {
            this.props.onExit();
        }
    }

    render() {
        let tabHeight = window.outerHeight - 250;
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
                <hr />
                <ButtonToolbar>
                    <Button bsStyle="primary" onClick={::this.saveAsFile}>Excel 파일 저장</Button>
                    <div className="text-right" style={{display:'inline', right: '0', position: 'absolute'}}>
                        <Button bsStyle="success" onClick={::this.onExit}>처음 화면으로</Button>
                        {' '}
                        <Button onClick={::this.onTemplateLoadClick}>템플릿 형식</Button>
                        <Button onClick={::this.onViewChange}>테이블 형식</Button>
                        <Button onClick={::this.onTemplateFileClick}>Excel 템플릿 파일 설정</Button>
                        <input ref="templateFile" style={styleHiddenFile} className="hiddenFile" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={::this.onLoadedTemplateExcel} />
                    </div>
                </ButtonToolbar>
                <hr />
                <div style={spreadStyle} ref="spread" />
                <div ref="chart" />
            </div>
        );
    }
}

export default ReportExcelPage;