import moment from 'moment';
//import Highcharts from 'highcharts';
let Highcharts = window.Highcharts;

var commaPrice = (number) => {
    var ret = number + '';
    var reg = /(^[+-]?\d+)(\d{3})/;
    while (reg.test(ret)) {
        ret = ret.replace(reg, '$1,$2');
    }
    return ret;
};

let ReportDefine = () => {
    return {
        '리포트': [
            {
                title: '담당자 설정',
                url: '/report11st/userInfo',
                params: {
                    month: '',
                    sellerId: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트',
                    viewSet: {
                        'adver_nm': {x: 2, y: 4 },
                        'biz_person': {x: 2, y: 5 },
                        'name': { x: 5, y: 4 },
                        'contact1': { x: 5, y: 5 },
                        'contact2': { x: 5, y: 6 }
                    }
                }
            },
            {
                title: '월별 집행 요약_전월',
                url: '/report11st/totalReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                updateFunc: (item) => {
                    item.params.month = moment(item.params.month, "YYYYMM").subtract(1, 'month').format('YYYYMM');
                },
                excelTmplInfo: {
                    sheetName: '리포트',
                    position: {
                        startX: 1,
                        startY: 11,
                        baseWidth: 3
                    },
                    fixHeight: 1,
                    viewSet: ['월별','광고비','광고상품 거래액','전체상품 거래액']
                }
            },
            {
                title: '월별 집행 요약_금월',
                url: '/report11st/totalReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트',
                    position: {
                        startX: 1,
                        startY: 12,
                        baseWidth: 3
                    },
                    fixHeight: 1,
                    viewSet: ['월별','광고비','광고상품 거래액','전체상품 거래액']
                }
            },
            {
                title: '상품번호별 광고 요약',
                url: '/report11st/itemReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트',
                    position: {
                        startX: 1,
                        startY: 60,
                        baseWidth: 8
                    },
                    fixHeight: 1,
                    addAuto: true,
                    sameMergeRowsPos: [ 0, 1 ]
                }
            },
            {
                title: '상품번호별 광고 요약 합계',
                url: '/report11st/itemSummaryReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트',
                    viewSet: {
                        '광고상품총거래액': { x: 2, y: 60 },
                        '광고비': { x: 4, y: 60 },
                        '노출수': { x: 5, y: 60 },
                        '클릭수': { x: 6, y: 60 }
                    },
                    viewSetFunc: (fullItem, thisItem) => {
                        if ( !thisItem.reCall ) {
                            let items = fullItem.filter(el => el.url==='/report11st/itemReport');
                            let beforeItemDepth = items[0].data.length;
                            let viewSet = thisItem.excelTmplInfo.viewSet;
                            Object.keys(viewSet).forEach((key) => {
                                viewSet[key].y += beforeItemDepth;
                            });
                        }
                        thisItem.reCall = true;
                    }
                }
            },
            {
                title: '광고영역별 광고요약',
                url: '/report11st/adAreaReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트',
                    viewSet: {
                        '전시 광고비': { x: 4, y: 36 },
                        '전시 노출수': { x: 5, y: 36 },
                        '전시 클릭수': { x: 6, y: 36 },
                        'HOT 광고비': { x: 4, y: 37 },
                        'HOT 노출수': { x: 5, y: 37 },
                        'HOT 클릭수': { x: 6, y: 37 },
                        'TOTAL': { x: 3, y: 38 }
                    }
                }
            },
            {
                title: 'ID',
                funcCall: (thisItem) => {
                    let runTime = moment(thisItem.params.month, "YYYYMM").format('YYYY년 MM월 DD일') + '~' + 
                                moment(thisItem.params.month, "YYYYMM").endOf('month').format('YYYY년 MM월 DD일');

                    thisItem.data = [{ 
                            sellerId: thisItem.params.sellerId,
                            runTime: runTime
                        }];
                },
                params : {
                    sellerId: '',
                    month: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트',
                    viewSet: {
                        'sellerId': { x: 2, y: 3 },
                        'runTime': { x: 5, y: 3 }
                    }
                }
            },
            {
                title: 'ChartOne',
                type: 'chart',
                excelTmplInfo: {
                    sheetName: '리포트',
                    position: {
                        x: 10,
                        y: 450,
                        width: 800,
                        height: 290
                    }
                },
                chartDataFunc: ( thisRef, excelInfo ) => {
                    let categories = excelInfo.getData( { y: 11, x: 1, rows: 2, cols: 1 } );
                    let adCost = excelInfo.getData( { y: 11, x: 2, rows: 2, cols: 1 } );
                    let adItemCost = excelInfo.getData( { y: 11, x: 3, rows: 2, cols: 1 } );
                    let adROASItemCost = excelInfo.getData( { y: 11, x: 5, rows: 2, cols: 1, percent: true } );

                    let chartInfo = {
                         credits: { enabled: false },
                         chart: {
                             zoomType: 'xy'
                             //type: 'bar'
                         },
                         title: {
                             text: null
                         },
                         xAxis: [{
                            categories: categories
                         }],
                         yAxis: [{ // Primary yAxis
                            labels: {
                                format: '{value}%',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            title: {
                                text: 'ROAS',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            }
                        }, { // Secondary yAxis
                            title: {
                                text: null,
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                formatter: function() {
                                    return commaPrice(this.value / 1000) + '천'
                                }, 
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            opposite: true
                        }],
                        tooltip: {
                            shared: true
                        },
                        series: [{
                            name: '광고비',
                            type: 'column',
                            yAxis: 1,
                            data: adCost,
                            dataLabels: {
                            enabled: true,
                                formatter: function () {
                                    return commaPrice(this.y);
                                }
                            }
                        }, {
                            name: '광고상품거래액',
                            type: 'column',
                            yAxis: 1,
                            data: adItemCost,
                            dataLabels: {
                            enabled: true,
                                formatter: function () {
                                    return commaPrice(this.y);
                                }
                            }
                        }, {
                            name: 'ROAS',
                            type: 'spline',
                            data: adROASItemCost,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return commaPrice(this.y) + '%';
                                }
                            }
                        }]
                    };
                    return chartInfo;
                }
            },
            {
                title: 'ChartTwo',
                type: 'chart',
                excelTmplInfo: {
                    sheetName: '리포트',
                    position: {
                        x: 10,
                        y: 930,
                        width: 950,
                        height: 290
                    }
                },
                chartDataFunc: ( thisRef, excelInfo ) => {
                    let viewItems = thisRef.List.data.slice(0, 10);

                    let categories = [], adCost = [], adItemCost = [], adROASItemCost = [];

                    for ( var item of viewItems ) {
                        categories.push( item['상품번호'] );
                        adCost.push( item['광고비'] );
                        adItemCost.push( item['광고상품 거래액'] );
                        try {
                            if ( item['광고상품 거래액'] > 0 && item['광고비'] > 0 ) {
                                adROASItemCost.push( parseInt(( item['광고상품 거래액'] / item['광고비']) * 100, 10));
                            } else {
                                adROASItemCost.push( 0 );
                            }
                        } catch( e ) {
                            adROASItemCost.push( 0 );
                        }
                    }

                    let chartInfo = {
                         credits: { enabled: false },
                         chart: {
                            zoomType: 'xy'
                         },
                         title: {
                             text: null
                         },
                         xAxis: [{
                            categories: categories
                         }],
                         yAxis: [{ // Primary yAxis
                            labels: {
                                format: '{value}%',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            title: {
                                text: 'ROAS',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            }
                        }, { // Secondary yAxis
                            title: {
                                text: '거래액',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                formatter: function() {
                                    return commaPrice(this.value / 1000) + '천'
                                }, 
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            opposite: true
                        }],
                        tooltip: {
                            shared: true
                        },
                        series: [{
                            name: '광고비',
                            type: 'column',
                            yAxis: 1,
                            data: adCost,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return commaPrice(this.y);
                                }
                            }
                        }, {
                            name: '광고상품거래액',
                            type: 'column',
                            yAxis: 1,
                            data: adItemCost,
                            dataLabels: {
                            enabled: true,
                                formatter: function () {
                                    return commaPrice(this.y);
                                }
                            }
                        }, {
                            name: 'ROAS',
                            type: 'spline',
                            data: adROASItemCost,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return commaPrice(this.y) + '%';
                                }
                            }
                        }]
                    };

                    console.log( 'CHART TWO : ', chartInfo );
                    return chartInfo;
                }
            }
        ],
        'List': {
            title: '상품별 리포트',
            url: '/report11st/adList',
            params: {
                month: '',
                sellerId: ''
            },
            excelTmplInfo: {
                sheetName: '상품별_raw',
                position: {
                    startX: 0,
                    startY: 1,
                    baseWidth: 4
                },
                viewSet: ['상품번호','광고상품 거래액','광고비']
            }
        }
    };
};

export default ReportDefine;