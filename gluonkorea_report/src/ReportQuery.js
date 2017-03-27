let QUERYS = {
    // 키워드 리스트
    "KEYWORD_LIST": "select [그룹명], [상품번호], [노출영역], [키워드], INTEGER([노출수]) AS [노출수], INTEGER([클릭수]) AS [클릭수], INTEGER([총비용]) AS [총비용], INTEGER([전환수량]) AS [전환수량], INTEGER([전환금액]) AS [전환금액] from [$table_keyword] WHERE [마스터ID] = '$masterId'",
    // 상품 리스트
    "PRODUCT_GROUP_LIST": "select '$marketName' as [마켓구분], [상품번호], GROUPSUM([노출수]) as [노출수], GROUPSUM([클릭수]) as [클릭수], GROUPSUM([총비용]) as [총비용], GROUPSUM([전환수량]) as [전환수량], GROUPSUM([전환금액]) as [전환금액] from [$table_keyword] WHERE [마스터ID] = '$masterId' GROUP BY [상품번호]",
    // 기간별 노출 수
    "PRE_DAYS_LIST": "DROP TABLE IF EXISTS DAYS; CREATE TABLES DAYS; SELECT DATEFIX([기간]) as DT INTO DAYS from [$table_day] group by [기간]",
    "DAYS_LIST":
        "IF EXISTS(SELECT * FROM [$table_day] WHERE [마스터ID] = '$masterId') \
             SELECT WEEK(B.DT) as [주차], B.DT as [날짜], DAY(B.DT) as [요일], \
                (CASE WHEN A.t1 IS NOT NULL THEN A.t1 ELSE 0 END) as [노출수], \
                (CASE WHEN A.t2 IS NOT NULL THEN A.t2 ELSE 0 END) as [클릭수], \
                (CASE WHEN A.t3 IS NOT NULL THEN A.t3 ELSE 0 END) as [총비용], \
                (CASE WHEN A.t4 IS NOT NULL THEN A.t4 ELSE 0 END) as [전환수량], \
                (CASE WHEN A.t5 IS NOT NULL THEN A.t5 ELSE 0 END) as [전환금액] \
             FROM ( \
                SELECT DATEFIX([기간]) as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 \
                FROM [$table_day] \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
             ) A \
             OUTER JOIN [DAYS] B \
                ON A.DT = B.DT \
             ORDER BY B.DT \
        ELSE \
            SELECT \
                WEEK(B.DT) as [주차], B.DT as [날짜], DAY(B.DT) as [요일], \
                    (0) as [노출수], \
                    (0) as [클릭수], \
                    (0) as [총비용], \
                    (0) as [전환수량], \
                    (0) as [전환금액] \
            FROM \
                DAYS B \
            ORDER BY B.DT",
    // 주간별 리스트
    "WEEK_LIST":
        "SELECT C.wk as [주차], (GROUPDATEMIN(C.dt) + ' ~ ') as [시작일자], GROUPDATEMAX(C.dt) as [마지막일자], GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환매출] \
         FROM \
         ( \
            SELECT WEEK([기간]) as wk, [기간] as dt, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_day] \
            WHERE [마스터ID] = '$masterId' \
            GROUP BY [기간] \
        ) C \
        GROUP BY C.wk",
    // 요일별 리스트
    "7DAYS_LIST":
        "SELECT C.dy as [주차], GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환금액] \
        FROM \
        ( \
            SELECT DAY([기간]) as dy, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_day] \
            WHERE [마스터ID] = '$masterId' \
            GROUP BY [기간] \
        ) C \
            GROUP BY C.dy",
    // 전체 날짜별 리스트
    "ALL_DAYS_LIST":
        "SELECT WEEK(A.DT) as [주차], A.DT as [날짜], DAY(A.DT) as [요일], (A.t1 + B.t1) as [노출수], (A.t2 + B.t2) as [클릭수], (A.t3 + B.t3) as [총비용], (A.t4 + B.t4) as [전환수량], (A.t5 + B.t5) as [전환금액] FROM \
            (\
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_a_day] \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) A, \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_b_day] \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) B \
        WHERE \
            A.DT = B.DT",
    // 전체 주간 리스트
    'ALL_WEEK_LIST':
        "SELECT C.wk as [주차], GROUPMIN(C.t1), GROUPMAX(C.t1), GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환금액] \
         FROM \
         ( \
            SELECT WEEK(A.DT) as wk, A.DT as dt, (A.t1 + B.t1) as t1, (A.t2 + B.t2) as t2, (A.t3 + B.t3) as t3, (A.t4 + B.t4) as t4, (A.t5 + B.t5) as t5 FROM \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_a_day] \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) A, \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_b_day] \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) B \
            WHERE \
            A.DT = B.DT \
        ) C \
        GROUP BY C.wk",
    // 전체 요일별 리스트
    "ALL_7DAYS_LIST":
        "SELECT C.dy as [요일], GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환금액] \
        FROM \
        ( \
            SELECT DAY(A.DT) as dy, A.DT as dt, (A.t1 + B.t1) as t1, (A.t2 + B.t2) as t2, (A.t3 + B.t3) as t3, (A.t4 + B.t4) as t4, (A.t5 + B.t5) as t5 FROM \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_a_day] \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) A, \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_b_day] \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) B \
            WHERE \
                A.DT = B.DT \
        ) C \
            GROUP BY C.dy",
    // 전체 요약
    "ALL_SUMMARY":
        "SELECT A.[노출수], A.[클릭수], A.[총비용], A.[전환수량], A.[전환금액], \
            customPercent(A.[클릭수], A.[노출수]) as [클릭율], \
            FIXED(A.[총비용] / A.[클릭수]) as [평균클릭단가], \
            customPercent(A.[전환수량], A.[클릭수]) as [전환율], \
            customPercent(A.[전환금액], A.[총비용]) as [ROAS] \
        FROM \
        ( \
            SELECT (A.t1 + B.t1) as [노출수], (A.t2 + B.t2) as [클릭수], (A.t3 + B.t3) as [총비용], (A.t4 + B.t4) as [전환수량], (A.t5 + B.t5) as [전환금액] \
            FROM \
            ( \
                SELECT GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_a_keyword] \
                WHERE [마스터ID] = '$masterId' \
            ) A, \
            ( \
                SELECT GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_b_keyword] \
                WHERE [마스터ID] = '$masterId' \
            ) B \
        ) A",
    "SUMMARY":
        "SELECT A.[노출수], A.[클릭수], A.[총비용], A.[전환수량], A.[전환금액], \
            customPercent(A.[클릭수], A.[노출수]) as [클릭율], \
            FIXED(A.[총비용] / A.[클릭수]) as [평균클릭단가], \
            customPercent(A.[전환수량], A.[클릭수]) as [전환율], \
            customPercent(A.[전환금액], A.[총비용]) as [ROAS] \
        FROM \
        ( \
            SELECT GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM [$table_keyword] \
            WHERE [마스터ID] = '$masterId' \
        ) A"
};

export let tableNames = {
    A_KEYWORD: 'Auction_키워드별',
    G_KEYWORD: 'Gmarket_키워드별',
    A_DAYS: 'Auction_날짜별',
    G_DAYS: 'Gmarket_날짜별'
};

let QueryList = (tableNameObj) => {
    let TABLENAME = Object.assign( tableNames, tableNameObj );
    return {
        '종합요약': [
            {
                title: '종합요약',
                query: QUERYS.ALL_SUMMARY,
                preQuery: QUERYS.PRE_DAYS_LIST,
                params: {
                    table_a_keyword: TABLENAME.A_KEYWORD,
                    table_b_keyword: TABLENAME.G_KEYWORD,
                    masterId: '',
                    table_day: TABLENAME.A_DAYS
                }
            },
            {
                title: '주차별 통합 광고 추이',
                query: QUERYS.ALL_WEEK_LIST,
                params: {
                    table_a_day: TABLENAME.A_DAYS,
                    table_b_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            },
            {
                title: '요일별 광고 효과_매체통합',
                query: QUERYS.ALL_7DAYS_LIST,
                params: {
                    table_a_day: TABLENAME.A_DAYS,
                    table_b_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            },
            {
                title: '일자별 광고 효과_매체통합',
                query: QUERYS.ALL_DAYS_LIST,
                params: {
                    table_a_day: TABLENAME.A_DAYS,
                    table_b_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            }
        ],
        'Gmarket': [
            {
                title: '주별 광고 추이',
                query: QUERYS.WEEK_LIST,
                params: {
                    table_day: TABLENAME.G_DAYS,
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
                query: QUERYS['7DAYS_LIST'],
                params: {
                    table_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            },
            {
                title: '일별 광고 추이',
                excelTmplInfo: {
                    sheetName: 'Gmarket',
                    position: {
                        startX: 1,
                        startY: 27,
                        baseWidth: 14
                    },
                    fixHeight: 31,
                    header: ['주차','일자','노출','클릭','총비용','전환수','전환매출']
                },
                query: QUERYS.DAYS_LIST,
                params: {
                    table_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            }
        ],
        'Gmarket 상품별': {
            title: 'Gmarket 상품별',
            query: QUERYS.PRODUCT_GROUP_LIST,
            excelTmplInfo: {
                sheetName: 'Gmarket_상품별',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 11
                },
                header: ['마켓구분','상품ID','노출','클릭','총비용','전환매출']
            },
            params: {
                table_keyword: TABLENAME.G_KEYWORD,
                marketName: 'Gmarket',
                masterId: ''
            }
        },
        'Gmarket 키워드': {
            title: 'Gmarket 키워드',
            query: QUERYS.KEYWORD_LIST,
            excelTmplInfo: {
                sheetName: 'Gmarket_키워드',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 13
                },
                header: ['그룹명','상품번호','노출영역','키워드','노출수','클릭수', '총비용', '전환수량', '전환매출']
            },
            params: {
                table_keyword: TABLENAME.G_KEYWORD,
                masterId: ''
            }
        },
        'Auction': [
            {
                title: 'Auction 주차별',
                query: QUERYS.WEEK_LIST,
                params: {
                    table_day: TABLENAME.A_DAYS,
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
                query: QUERYS['7DAYS_LIST'],
                params: {
                    table_day: TABLENAME.A_DAYS,
                    masterId: ''
                }
            },
            {
                title: 'Auction 일별',
                excelTmplInfo: {
                    sheetName: 'Auction',
                    position: {
                        startX: 1,
                        startY: 27,
                        baseWidth: 14
                    },
                    header: ['주차','일자','노출','클릭','총비용','전환수','전환매출'],
                    fixHeight: 31
                },
                query: QUERYS.DAYS_LIST,
                params: {
                    table_day: TABLENAME.A_DAYS,
                    masterId: ''
                }
            }
        ],
        'Auction 상품별': {
            title: 'Auction 상품별',
            query: QUERYS.PRODUCT_GROUP_LIST,
            excelTmplInfo: {
                sheetName: 'Auction_상품별',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 11
                },
                header: ['마켓구분','상품ID','노출','클릭','총비용','전환매출']
            },
            params: {
                table_keyword: TABLENAME.A_KEYWORD,
                marketName: 'Auction',
                masterId: ''
            }
        },
        'Auction 키워드': {
            title: 'Auction 키워드',
            query: QUERYS.KEYWORD_LIST,
            excelTmplInfo: {
                sheetName: 'Auction_키워드',
                position: {
                    startX: 1,
                    startY: 6,
                    baseWidth: 13
                },
                header: ['그룹명','상품번호','노출영역','키워드','노출수','클릭수', '총비용', '전환수량', '전환매출']
            },
            params: {
                    table_keyword: TABLENAME.A_KEYWORD,
                    masterId: ''
            }
        }
    };
};

export default QueryList;