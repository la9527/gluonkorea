let mysql = require('promise-mysql');
let PassEncrypt = require('./PassEncrypt');

class ReportQuery11st {
    constructor() {
        this._connPool = null;
    }

    connect() {
        let mysqlConfig = {
            host: 'gluonkorea.cafe24.com',
            port: 3306,
            user: 'la9527',
            password: PassEncrypt.decrypt('b167ab38b13b3bbfef'),
            database: 'report',
            connectTimeout: 3000,
            timezone: 'local',
            ssl: false
        };
        try {
            this._connPool = mysql.createPool(mysqlConfig);
        } catch( e ) {
            console.error( e );
            return false;
        }

        this._connPool.on('acquire', function(connection) {
            console.log('Connection %d acquired', connection.threadId);
        });
        this._connPool.on('enqueue', function () {
            console.log('Waiting for available connection slot');
        });
        this._connPool.on('release', function (connection) {
            console.log('Connection %d released', connection.threadId);
        });
        return true;
    }

    async syncQuery( sql ) {
        let result = null;
        try {
            console.log( sql );
            const connection = await this._connPool.getConnection();
            try {
                result = await connection.query(sql);
            } finally {
                this._connPool.releaseConnection(connection);
            }
            console.log( 'ROW COUNT : ' + result.length );
        } catch( e ) {
            console.error( e );
            result = null;
            if ( e.code && e.errno ) {
                throw `${e.code} (${e.errno})`;
            } else {
                throw e;
            }
        }
        return result;
    }

    totalReport( month, sellerId ) {
        let sqlMasterId = sellerId ? `AND sellerId = '${sellerId}'` : '';
        let that = this;
        let sql = `SELECT
                        '${month}' as '월별',
                        COUNT(T.sellerId) as '건수',
                        COALESCE(SUM(displayCost), 0) + COALESCE(SUM(hotclickCost), 0) as '광고비',
                        COALESCE(SUM(totalCostWithAd), 0) as '광고상품 거래액',
                        COALESCE(SUM(totalCostWithDC), 0) as '전체상품 거래액'
                    FROM
                    (
                        SELECT
                            A.sellerId, A.productId, A.totalCostWithDC, 
                            B.adItem,
                            B.adCnt,
                            B.viewCount as displayViewCount, 
                            B.clickCount as displayClickCount, 
                            (CASE WHEN B.displayCost IS NOT NULL THEN B.displayCost ELSE 0 END) as displayCost,
                            C.viewCount as hotclickViewCount, 
                            C.clickCount as hotclickClickCount, 
                            (CASE WHEN C.hotclickCost IS NOT NULL THEN C.hotclickCost ELSE 0 END) as hotclickCost,
                            (CASE WHEN B.displayCost IS NOT NULL OR C.hotclickCost IS NOT NULL THEN A.totalCostWithDC ELSE 0 END) as 'totalCostWithAd'
                        FROM (
                            SELECT 
                                sellerId, productId, totalCostWithDC
                            FROM
                                report.TOTAL_COST
                            WHERE
                                reportMonth = '${month}' AND site = '11st' AND sellerId = '${sellerId}'
                        ) A
                        LEFT JOIN
                        (
                            SELECT productId, MAX(adItem) as adItem, COUNT(productId) as adCnt, SUM(viewCount) as viewCount, SUM(clickCount) as clickCount, SUM(displayCost) as displayCost
                            FROM report.DISPLAY_COST 
                            WHERE reportMonth = '${month}' AND site = '11st'
                            GROUP BY productId
                        ) B
                            ON B.productId = A.productId
                        LEFT JOIN
                            report.HOTCLICK_COST C
                            ON C.sellerId = A.sellerId AND C.productId = A.productId AND C.reportMonth = '${month}' AND C.site = '11st'
                    ) T;`;

        console.log( sql );
        return that.syncQuery( sql );
    }   

    searchSellerId( month ) {
        let sql = `select
                        A.sellerId as sellerId,
                        A.cnt as '상품건수',
                        A.totalCostWithDC as '거래총액'
                    from
                    (
                        SELECT
                            sellerId,
                            COUNT(sellerId) as cnt, 
                            SUM(totalCostWithDC) as totalCostWithDC
                        FROM report.TOTAL_COST 
                        WHERE reportMonth = '${month}' 
                        GROUP BY sellerId 
                    ) A
                    order by A.totalCostWithDC desc;`;
        return this.syncQuery(sql);
    }

    searchPossibleMonth() {
        let sql = `select reportMonth from report.TOTAL_COST GROUP BY reportMonth`;
        return this.syncQuery(sql);
    }

    itemSummaryReport( month, sellerId ) {
        let sql = `SELECT
                        COALESCE(SUM(A.totalCostWithDC), 0) as '광고상품총거래액',
                        COALESCE(SUM(A.adCnt), 0) as '광고낙찰건수',
                        COALESCE(SUM(A.cost), 0) as '광고비',
                        COALESCE(SUM(A.viewCount), 0) as '노출수',
                        COALESCE(SUM(A.clickCount), 0) as '클릭수'
                    FROM
                    (
                        SELECT
                            A.productId,
                            CASE WHEN
                                A.type = 'H' AND (
                                    SELECT
                                        A.productId
                                    FROM
                                        report.TOTAL_COST C, report.DISPLAY_COST D
                                    WHERE
                                        C.reportMonth = '${month}' AND C.site = '11st' AND 
                                        D.reportMonth = '${month}' AND D.site = '11st' AND 
                                        C.productId = A.productId AND D.productId = A.productId AND 
                                        C.totalCostWithDC > 0
                                    LIMIT 1
                                ) IS NOT NULL
                                THEN
                                    0
                                ELSE
                                    A.totalCostWithDC
                            END as 'totalCostWithDC', 
                            A.adItem,
                            A.adCnt,
                            A.cost,
                            A.viewCount,
                            A.clickCount
                        FROM
                        (
                            SELECT
                                'P' as type,
                                A.sellerId, 
                                A.productId, 
                                A.totalCostWithDC,
                                B.adItem, 
                                B.adCnt,
                                B.viewCount as viewCount, 
                                B.clickCount as clickCount, 
                                B.displayCost as cost
                            FROM (
                                SELECT 
                                    sellerId, productId, totalCostWithDC
                                FROM
                                    report.TOTAL_COST
                                WHERE
                                    reportMonth = '${month}' AND site = '11st' AND sellerId = '${sellerId}'
                            ) A
                            LEFT JOIN
                            (
                                SELECT productId, MAX(adItem) as adItem, COUNT(productId) as adCnt, SUM(viewCount) as viewCount, SUM(clickCount) as clickCount, SUM(displayCost) as displayCost
                                FROM report.DISPLAY_COST 
                                WHERE reportMonth = '201705' AND site = '11st'
                                GROUP BY productId
                            ) B
                                ON B.productId = A.productId
                            UNION ALL
                                SELECT
                                    'H' as type,
                                    C.sellerId,
                                    C.productId,
                                    (
                                        SELECT totalCostWithDC FROM report.TOTAL_COST WHERE productId = C.productId AND reportMonth = C.reportMonth AND site = C.site LIMIT 1
                                    ) as totalCostWithDC,
                                    'HOT 클릭' as adItem,
                                    0 as adCnt,
                                    C.viewCount as viewCount,
                                    C.clickCount as clickCount,
                                    (CASE WHEN C.hotClickCost IS NOT NULL THEN C.hotClickCost ELSE 0 END) as 'cost'
                                FROM
                                    report.HOTCLICK_COST C
                                WHERE
                                    C.sellerId = '${sellerId}' AND C.reportMonth = '${month}' AND C.site = '11st'
                            
                        ) A
                    ) A;`;
        return this.syncQuery(sql);
    }

    itemReport( month, sellerId ) {
        let sql = `SELECT
                        A.productId as '상품번호', 
                        CASE WHEN
                            A.type = 'H' AND (
                                SELECT
                                    A.productId
                                FROM
                                    report.TOTAL_COST C, report.DISPLAY_COST D
                                WHERE
                                    C.reportMonth = '${month}' AND C.site = '11st' AND 
                                    D.reportMonth = '${month}' AND D.site = '11st' AND 
                                    C.productId = A.productId AND D.productId = A.productId AND 
                                    C.totalCostWithDC > 0
                                LIMIT 1
                            ) IS NOT NULL
                            THEN
                                0
                            ELSE
                                A.totalCostWithDC
                        END as '광고상품 거래액', 
                        A.adItem as '광고명', 
                        A.adCnt as '광고낙찰건수',
                        A.cost as '광고비',
                        A.viewCount as '노출수',
                        A.clickCount as '클릭수'
                    FROM
                    (
                        SELECT
                            'P' as type,
                            A.sellerId, 
                            A.productId, 
                            A.totalCostWithDC,
                            B.adItem, 
                            B.adCnt,
                            B.viewCount as viewCount, 
                            B.clickCount as clickCount, 
                            B.displayCost as cost
                        FROM (
                            SELECT 
                                sellerId, productId, totalCostWithDC
                            FROM
                                report.TOTAL_COST
                            WHERE
                                reportMonth = '${month}' AND site = '11st' AND sellerId = '${sellerId}'
                        ) A
                        LEFT JOIN
                        (
                            SELECT productId, MAX(adItem) as adItem, COUNT(productId) as adCnt, SUM(viewCount) as viewCount, SUM(clickCount) as clickCount, SUM(displayCost) as displayCost
                            FROM report.DISPLAY_COST 
                            WHERE reportMonth = '${month}' AND site = '11st'
                            GROUP BY productId
                        ) B
                            ON B.productId = A.productId
                        UNION ALL
                            SELECT
                                'H' as type,
                                C.sellerId,
                                C.productId,
                                (
                                    SELECT totalCostWithDC FROM report.TOTAL_COST WHERE productId = C.productId AND reportMonth = C.reportMonth AND site = C.site LIMIT 1
                                ) as totalCostWithDC,
                                'HOT 클릭' as adItem,
                                0 as adCnt,
                                C.viewCount as viewCount,
                                C.clickCount as clickCount,
                                (CASE WHEN C.hotClickCost IS NOT NULL THEN C.hotClickCost ELSE 0 END) as 'cost'
                            FROM
                                report.HOTCLICK_COST C
                            WHERE
                                C.sellerId = '${sellerId}' AND C.reportMonth = '${month}' AND C.site = '11st'
                        
                    ) A
                    WHERE cost > 0
                    ORDER BY A.totalCostWithDC DESC, adItem DESC`;
        console.log( sql );
        return this.syncQuery( sql );
    }

    adAreaReport( month, sellerId ) {
        let sql = `SELECT
                        COALESCE(SUM(adCnt), 0) as '전시 광고낙찰건수',
                        COALESCE(SUM(displayCost), 0) as '전시 광고비',
                        COALESCE(SUM(displayViewCount), 0) as '전시 노출수',
                        COALESCE(SUM(displayClickCount), 0) as '전시 클릭수',
                        COALESCE(SUM(hotclickCost), 0) as 'HOT 광고비', 
                        COALESCE(SUM(hotclickViewCount), 0) as 'HOT 노출수', 
                        COALESCE(SUM(hotclickClickCount), 0) as 'HOT 클릭수',
                        COALESCE(SUM(totalCostWithDC), 0) as 'TOTAL'
                    FROM
                    (
                        SELECT
                            A.sellerId, A.productId, A.totalCostWithDC, 
                            B.adItem, 
                            B.adCnt,
                            B.viewCount as displayViewCount, 
                            B.clickCount as displayClickCount,
                            (CASE WHEN B.displayCost IS NOT NULL THEN B.displayCost ELSE 0 END) as 'displayCost',
                            C.viewCount as hotclickViewCount, 
                            C.clickCount as hotclickClickCount, 
                            (CASE WHEN C.hotclickCost IS NOT NULL THEN C.hotclickCost ELSE 0 END) as 'hotclickCost',
                            (CASE WHEN B.displayCost IS NOT NULL OR C.hotclickCost IS NOT NULL THEN A.totalCostWithDC ELSE 0 END) as 'totalCostWithAd'
                        FROM (
                            SELECT 
                                sellerId, productId, totalCostWithDC
                            FROM
                                report.TOTAL_COST
                            WHERE
                                reportMonth = '${month}' AND site = '11st' AND sellerId = '${sellerId}'
                        ) A
                        LEFT JOIN
                        (
                            SELECT productId, MAX(adItem) as adItem, COUNT(productId) as adCnt, SUM(viewCount) as viewCount, SUM(clickCount) as clickCount, SUM(displayCost) as displayCost
                            FROM report.DISPLAY_COST 
                            WHERE reportMonth = '${month}' AND site = '11st'
                            GROUP BY productId
                        ) B
                            ON B.productId = A.productId
                        LEFT JOIN
                            report.HOTCLICK_COST C
                            ON C.sellerId = A.sellerId AND C.productId = A.productId AND C.reportMonth = '${month}' AND C.site = '11st'
                    ) A
                    WHERE
                        displayCost > 0 OR hotclickCost > 0;`;
        console.log( sql );
        return this.syncQuery( sql );
    }

    adList( month, sellerId ) {
        let sql = `SELECT
                        productId as '상품번호',
                        totalCostWithDC as '광고상품 거래액',
                        (displayCost + hotclickCost) as '광고비'
                    FROM
                    (
                        SELECT
                            A.sellerId, A.productId, A.totalCostWithDC, 
                            B.adItem, 
                            B.adCnt,
                            B.viewCount as displayViewCount, 
                            B.clickCount as displayClickCount, 
                            (CASE WHEN B.displayCost IS NOT NULL THEN B.displayCost ELSE 0 END) as 'displayCost',
                            C.viewCount as hotclickViewCount, 
                            C.clickCount as hotclickClickCount, 
                            (CASE WHEN C.hotclickCost IS NOT NULL THEN C.hotclickCost ELSE 0 END) as 'hotclickCost',
                            (CASE WHEN B.displayCost IS NOT NULL OR C.hotclickCost IS NOT NULL THEN A.totalCostWithDC ELSE 0 END) as 'totalCostWithAd'
                        FROM (
                            SELECT 
                                sellerId, productId, totalCostWithDC
                            FROM
                                report.TOTAL_COST
                            WHERE
                                reportMonth = '${month}' AND site = '11st' AND sellerId = '${sellerId}'
                        ) A
                        LEFT JOIN
                        (
                            SELECT productId, MAX(adItem) as adItem, COUNT(productId) as adCnt, SUM(viewCount) as viewCount, SUM(clickCount) as clickCount, SUM(displayCost) as displayCost
                            FROM report.DISPLAY_COST 
                            WHERE reportMonth = '${month}' AND site = '11st'
                            GROUP BY productId
                        ) B
                            ON B.productId = A.productId
                        LEFT JOIN
                            report.HOTCLICK_COST C
                            ON C.sellerId = A.sellerId AND C.productId = A.productId AND C.reportMonth = '${month}' AND C.site = '11st'
                        ORDER BY totalCostWithDC DESC
                    ) A`;
        console.log( sql );
        return this.syncQuery( sql );
    }
}

module.exports = ReportQuery11st;