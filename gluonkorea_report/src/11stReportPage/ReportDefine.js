import moment from 'moment';

let ReportDefine = () => {
    return {
        '리포트샘플': [
            {
                title: '월별 집행 요약',
                url: '/report11st/totalReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트샘플',
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
                title: '월별 집행 요약',
                url: '/report11st/totalReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                updateFunc: (item) => {
                    item.params.month = moment(item.params.month, "YYYYMM").subtract(1, 'month').format('YYYYMM');
                },
                excelTmplInfo: {
                    sheetName: '리포트샘플',
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
                title: '상품번호별 광고 요약 합계',
                url: '/report11st/itemSummaryReport',
                params: {
                    month: '',
                    sellerId: ''
                },
                excelTmplInfo: {
                    sheetName: '리포트샘플',
                    viewSet: {
                        '광고상품총거래액': { x: 2, y: 59 },
                        '광고낙찰건수': { x: 4, y: 59 },
                        '광고비': { x: 5, y: 59 },
                        '노출수': { x: 6, y: 59 },
                        '클릭수': { x: 7, y: 59 }
                    }
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
                    sheetName: '리포트샘플',
                    position: {
                        startX: 1,
                        startY: 60,
                        baseWidth: 8
                    },
                    fixHeight: 7,
                    addAuto: true
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
                    sheetName: '리포트샘플',
                    viewSet: {
                        '전시 광고낙찰건수': { x: 4, y: 36 },
                        '전시 광고비': { x: 5, y: 36 },
                        '전시 노출수': { x: 6, y: 36 },
                        '전시 클릭수': { x: 7, y: 36 },
                        'HOT 광고비': { x: 5, y: 37 },
                        'HOT 노출수': { x: 6, y: 37 },
                        'HOT 클릭수': { x: 7, y: 37 },
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
                    sheetName: '리포트샘플',
                    viewSet: {
                        'sellerId': { x: 2, y: 3 },
                        'runTime': { x: 5, y: 3 }
                    }
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
                sheetName: '상품별_그래프',
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