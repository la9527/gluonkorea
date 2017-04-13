let ReportDefine = () => {
    return {
        '종합요약': [
            /*
            {
                title: '종합요약',
                params: {
                    table_a_keyword: TABLENAME.A_KEYWORD,
                    table_b_keyword: TABLENAME.G_KEYWORD,
                    masterId: '',
                    table_day: TABLENAME.A_DAYS
                }
            },
            */
            {
                title: '주차별 통합 광고 추이',
                url: '/report/dayOfWeekReport',
                params: {
                    month: '',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: '주간요약',
                    position: {
                        startX: 1,
                        startY: 5,
                        baseWidth: 7
                    },
                    fixHeight: 6
                }
            },
            {
                title: '요일별 광고 효과_매체통합',
                url: '/report/weekReport',
                params: {
                    month: '',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: '주간요약',
                    position: {
                        startX: 1,
                        startY: 14,
                        baseWidth: 5
                    },
                    fixHeight: 7
                }
            },
            {
                title: '일자별 광고 효과_매체통합',
                url: '/report/monthReport',
                params: {
                    month: '',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: '주간요약',
                    position: {
                        startX: 1,
                        startY: 27,
                        baseWidth: 15
                    },
                    fixHeight: 31
                }
            },
            {
                title: 'Running Time',
                params : {
                    month: ''
                },
                url: '/report/searchDateTerm',
                excelTmplInfo: {
                    sheetName: '종합요약',
                    position: {
                        startX: 9,
                        startY: 5,
                        baseWidth: 1
                    },
                    fixHeight: 1
                }
            },
            {
                title: 'ID',
                funcCall: (thisItem) => {
                    thisItem.data = [
                        { masterId: thisItem.params.masterId }
                    ];
                },
                params : {
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: '종합요약',
                    position: {
                        startX: 3,
                        startY: 5,
                        baseWidth: 1
                    },
                    fixHeight: 1
                }
            },
            {
                title: '리포트 기간',
                funcCall: (thisItem) => {
                    thisItem.data = [
                        { month: thisItem.params.month }
                    ];
                },
                params: {
                    month: ''
                },
                excelTmplInfo: {
                    sheetName: '종합요약',
                    position: {
                        startX: 3,
                        startY: 21,
                        baseWidth: 1
                    },
                    fixHeight: 1
                }
            }
        ],
        'Gmarket': [
            {
                title: '주별 광고 추이',
                url: '/report/dayOfWeekReport',
                params: {
                    month: '',
                    site: 'G마켓',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: 'Gmarket',
                    position: {
                        startX: 1,
                        startY: 5,
                        baseWidth: 7
                    },
                    fixHeight: 6
                },
            },
            {
                title: '요일별 광고 추이',
                url: '/report/weekReport',
                params: {
                    month: '',
                    site: 'G마켓',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: 'Gmarket',
                    position: {
                        startX: 1,
                        startY: 14,
                        baseWidth: 5
                    },
                    fixHeight: 7
                }
            },
            {
                title: '일별 광고 추이',
                url: '/report/monthReport',
                params: {
                    month: '',
                    site: 'G마켓',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: 'Gmarket',
                    position: {
                        startX: 1,
                        startY: 27,
                        baseWidth: 15
                    },
                    fixHeight: 31
                }
            }
        ],
        'Gmarket 상품별': {
            title: 'Gmarket 상품별',
            url: '/report/getProduct',
            params: {
                month: '',
                site: 'G마켓',
                masterId: ''
            },
            excelTmplInfo: {
                sheetName: 'Gmarket_상품별',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 11
                }
            }
        },
        'Gmarket 키워드': {
            title: 'Gmarket 키워드',
            url: '/report/getKeyword',
            params: {
                month: '',
                site: 'G마켓',
                masterId: ''
            },
            excelTmplInfo: {
                sheetName: 'Gmarket_키워드',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 13
                },
                header: ['그룹명','상품번호','노출영역','키워드','노출수','클릭수', '총비용', '전환수량', '전환매출']
            }
        },
        'Auction': [
            {
                title: 'Auction 주차별',
                url: '/report/dayOfWeekReport',
                params: {
                    month: '',
                    site: '옥션',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: 'Auction',
                    position: {
                        startX: 1,
                        startY: 5,
                        baseWidth: 8
                    },
                    fixHeight: 6
                }
            },
            {
                title: 'Auction 요일별',
                url: '/report/weekReport',
                params: {
                    month: '',
                    site: '옥션',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: 'Auction',
                    position: {
                        startX: 1,
                        startY: 14,
                        baseWidth: 5
                    },
                    fixHeight: 7
                }
            },
            {
                title: 'Auction 일별',
                url: '/report/monthReport',
                params: {
                    month: '',
                    site: '옥션',
                    masterId: ''
                },
                excelTmplInfo: {
                    sheetName: 'Auction',
                    position: {
                        startX: 1,
                        startY: 27,
                        baseWidth: 15
                    },
                    header: ['주차','일자','노출','클릭','총비용','전환수','전환매출'],
                    fixHeight: 31
                }
            }
        ],
        'Auction 상품별': {
            title: 'Auction 상품별',
            url: '/report/getProduct',
            params: {
                month: '',
                site: '옥션',
                masterId: ''
            },
            excelTmplInfo: {
                sheetName: 'Auction_상품별',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 11
                },
                header: ['마켓구분','상품ID','노출','클릭','총비용','전환매출']
            }
        },
        'Auction 키워드': {
            title: 'Auction 키워드',
            url: '/report/getKeyword',
            params: {
                month: '',
                site: '옥션',
                masterId: ''
            },
            excelTmplInfo: {
                sheetName: 'Auction_키워드',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 13
                },
                header: ['그룹명','상품번호','노출영역','키워드','노출수','클릭수', '총비용', '전환수량', '전환매출']
            }
        }
    };
};

export default ReportDefine;