let QUERYS = {
    // 키워드 리스트
    "KEYWORD_LIST": "select [그룹명], [상품번호], [노출영역], [키워드], [노출수], [클릭수], [총비용], [전환수량], [전환금액] from $table_keyword WHERE [마스터ID] = '$masterId'",
    // 상품 리스트
    "PRODUCT_GROUP_LIST": "select [상품번호], GROUPSUM([노출수]), GROUPSUM([클릭수]), GROUPSUM([총비용]), GROUPSUM([전환수량]), GROUPSUM([전환금액]) from $table_keyword WHERE [마스터ID] = '$masterId' GROUP BY [상품번호]",
    // 기간별 노출 수
    "DAYS_LIST":
        "SELECT DAY([기간]), WEEK([기간]), GROUPSUM([노출수]) as [노출수], GROUPSUM([클릭수]) as [클릭수], GROUPSUM([총비용]) as [총비용], GROUPSUM([전환수량]) as [전환수량], GROUPSUM([전환금액]) as [전환금액] FROM $table_day \
         WHERE [마스터ID] = '$masterId' \
         GROUP BY [기간]",
    // 주간별 리스트
    "WEEK_LIST":
        "SELECT C.wk, GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환금액] \
         FROM \
         ( \
            SELECT WEEK([기간]) as wk, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_day \
            WHERE [마스터ID] = '$masterId' \
            GROUP BY [기간] \
        ) C \
        GROUP BY C.wk",
    // 요일별 리스트
    "7DAYS_LIST":
        "SELECT C.dy, GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환금액] \
        FROM \
        ( \
            SELECT DAY([기간]) as dy, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_day \
            WHERE [마스터ID] = '$masterId' \
            GROUP BY [기간] \
        ) C \
            GROUP BY C.dy",
    // 전체 날짜별 리스트
    "ALL_DAYS_LIST":
        "SELECT DAY(A.DT), WEEK(A.DT), A.DT, (A.t1 + B.t1) as [노출수], (A.t2 + B.t2) as [클릭수], (A.t3 + B.t3) as [총비용], (A.t4 + B.t4) as [전환수량], (A.t5 + B.t5) as [전환금액] FROM \
            (\
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_a_day \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) A, \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_b_day \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) B \
        WHERE \
            A.DT = B.DT",
    // 전체 주간 리스트
    'ALL_WEEK_LIST':
        "SELECT C.wk, GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환금액] \
         FROM \
         ( \
            SELECT WEEK(A.DT) as wk, A.DT as dt, (A.t1 + B.t1) as t1, (A.t2 + B.t2) as t2, (A.t3 + B.t3) as t3, (A.t4 + B.t4) as t4, (A.t5 + B.t5) as t5 FROM \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_a_day \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) A, \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_b_day \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) B \
            WHERE \
            A.DT = B.DT \
        ) C \
        GROUP BY C.wk",
    // 전체 요일별 리스트
    "ALL_7DAYS_LIST":
        "SELECT C.dy, GROUPSUM(C.t1) as [노출수], GROUPSUM(C.t2) as [클릭수], GROUPSUM(C.t3) as [총비용], GROUPSUM(C.t4) as [전환수량], GROUPSUM(C.t5) as [전환금액] \
        FROM \
        ( \
            SELECT DAY(A.DT) as dy, A.DT as dt, (A.t1 + B.t1) as t1, (A.t2 + B.t2) as t2, (A.t3 + B.t3) as t3, (A.t4 + B.t4) as t4, (A.t5 + B.t5) as t5 FROM \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_a_day \
                WHERE [마스터ID] = '$masterId' \
                GROUP BY [기간] \
            ) A, \
            ( \
                SELECT [기간] as DT, GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_b_day \
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
                SELECT GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_a_keyword \
                WHERE [마스터ID] = '$masterId' \
            ) A, \
            ( \
                SELECT GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_b_keyword \
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
            SELECT GROUPSUM([노출수]) as t1, GROUPSUM([클릭수]) as t2, GROUPSUM([총비용]) as t3, GROUPSUM([전환수량]) as t4, GROUPSUM([전환금액]) as t5 FROM $table_keyword \
            WHERE [마스터ID] = '$masterId' \
        ) A"
};

export let tableNames = {
    A_KEYWORD: 'T_A_KEYWORD',
    G_KEYWORD: 'T_G_KEYWORD',
    A_DAYS: 'T_A_DAYS',
    G_DAYS: 'T_G_DAYS'
};

let QueryList = (tableNameObj) => {
    let TABLENAME = Object.assign( tableNames, tableNameObj );
    return {
        'ALL': [
            {
                title: 'ALL_1',
                query: QUERYS.ALL_SUMMARY,
                params: {
                    table_a_keyword: TABLENAME.A_KEYWORD,
                    table_b_keyword: TABLENAME.G_KEYWORD,
                    masterId: ''
                }
            },
            {
                title: 'ALL_2',
                query: QUERYS.ALL_WEEK_LIST,
                params: {
                    table_a_day: TABLENAME.A_DAYS,
                    table_b_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            },
            {
                title: 'ALL_3',
                query: QUERYS.ALL_7DAYS_LIST,
                params: {
                    table_a_day: TABLENAME.A_DAYS,
                    table_b_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            },
            {
                title: 'ALL_4',
                query: QUERYS.ALL_DAYS_LIST,
                params: {
                    table_a_day: TABLENAME.A_DAYS,
                    table_b_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            }
        ],
        'G_DAYS': [
            {
                title: 'G_DAYS_1',
                query: QUERYS.WEEK_LIST,
                params: {
                    table_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            },
            {
                title: 'G_DAYS_2',
                query: QUERYS['7DAYS_LIST'],
                params: {
                    table_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            },
            {
                title: 'G_DAYS_3',
                query: QUERYS.DAYS_LIST,
                params: {
                    table_day: TABLENAME.G_DAYS,
                    masterId: ''
                }
            }
        ],
        'G_PRODUCTS': {
            title: 'G_PRODUCTS',
            query: QUERYS.PRODUCT_GROUP_LIST,
            params: {
                table_keyword: TABLENAME.G_KEYWORD,
                masterId: ''
            }
        },
        'G_KEYWORD': {
            title: 'G_KEYWORD',
            query: QUERYS.KEYWORD_LIST,
            params: {
                table_keyword: TABLENAME.G_KEYWORD,
                masterId: ''
            }
        },
        'A_DAYS': [
            {
                title: 'A_DAYS_1',
                query: QUERYS.WEEK_LIST,
                params: {
                    table_day: TABLENAME.A_DAYS,
                    masterId: ''
                }
            },
            {
                title: 'A_DAYS_2',
                query: QUERYS['7DAYS_LIST'],
                params: {
                    table_day: TABLENAME.A_DAYS,
                    masterId: ''
                }
            },
            {
                title: 'A_DAYS_3',
                query: QUERYS.DAYS_LIST,
                params: {
                    table_day: TABLENAME.A_DAYS,
                    masterId: ''
                }
            }
        ],
        'A_PRODUCTS': {
            title: 'A_PRODUCTS',
            query: QUERYS.PRODUCT_GROUP_LIST,
            params: {
                table_keyword: TABLENAME.A_KEYWORD,
                masterId: ''
            }
        },
        'A_KEYWORD': {
            title: 'A_KEYWORD',
            query: QUERYS.KEYWORD_LIST,
            params: {
                    table_keyword: TABLENAME.A_KEYWORD,
                    masterId: ''
            }
        }
    };
};

export default QueryList;