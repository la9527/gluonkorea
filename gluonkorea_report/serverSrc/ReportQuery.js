let mysql = require('promise-mysql');
let PassEncrypt = require('./PassEncrypt');

class ReportQuery {
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

    getProduct( month, site, masterId ) {
        let sqlMasterId = masterId ? `AND masterId = '${masterId}'` : '';
        let sqlSite = site ? `AND site = '${site}'` : '';
        let that = this;
        let sql = `SELECT
                    site as '마켓구분',
                    productId as '상품번호',
                    SUM(viewCount) as '노출수',
                    SUM(clickCount) as '클릭수',
                    SUM(totalCost) as '총비용',
                    SUM(changeOverCount) as '전환수량',
                    SUM(changeOverCost) as '전환금액'
                FROM report.AD_KEYWORD_REPORT
                WHERE
                    reportMonth = '${month}' ${sqlSite} ${sqlMasterId}
                GROUP BY productId, site`;

        console.log( sql );
        return that.syncQuery( sql );
    }

    getKeyword( month, site, masterId ) {
        let sqlMasterId = masterId ? `AND masterId = '${masterId}'` : '';
        let sqlSite = site ? `AND site = '${site}'` : '';
        let that = this;
        let sql = `SELECT
                    groupName as '그룹명',
                    productId as '상품번호',
                    viewArea as '노출영역',
                    keyword as '키워드',
                    viewCount as '노출수',
                    clickCount as '클릭수',
                    totalCost as '총비용',
                    changeOverCount as '전환수량',
                    changeOverCost as '전환금액'
                FROM report.AD_KEYWORD_REPORT
                WHERE
                    reportMonth = '${month}' ${sqlSite} ${sqlMasterId}`;
        console.log( sql );
        return that.syncQuery( sql );
    }

    monthReport( month, site, masterId ) {
        let sqlMasterId = masterId ? `AND masterId = '${masterId}'` : '';
        let sqlSite = site ? `AND site = '${site}'` : '';

        let sql = `SELECT
                        B.dayofweek AS '주차',
                        DATE_FORMAT(B.reportDate, '%Y-%m-%d') AS '날짜',
                        B.week AS '요일',
                        (CASE WHEN A.viewCount IS NOT NULL THEN A.viewCount ELSE 0 END) as '노출수',
                        (CASE WHEN A.clickCount IS NOT NULL THEN A.clickCount ELSE 0 END) as '클릭수',
                        (CASE WHEN A.totalCost IS NOT NULL THEN A.totalCost ELSE 0 END) as '총비용',
                        (CASE WHEN A.changeOverCount IS NOT NULL THEN A.changeOverCount ELSE 0 END) as '전환수량',
                        (CASE WHEN A.changeOverCost IS NOT NULL THEN A.changeOverCost ELSE 0 END) as '전환금액'
                    FROM
                    (
                        SELECT
                            reportDate as reportDate,
                            SUM(viewCount) as viewCount,
                            SUM(clickCount) as clickCount,
                            SUM(totalCost) as totalCost,
                            SUM(changeOverCount) as changeOverCount,
                            SUM(changeOverCost) as changeOverCost
                        FROM report.AD_DAY_REPORT
                        WHERE
                            reportMonth = '${month}' ${sqlMasterId} ${sqlSite}
                        GROUP BY reportDate
                    ) A
                    RIGHT JOIN (
                            SELECT reportDate as reportDate, 
                                CASE DAYOFWEEK(reportDate)
                                    WHEN '1' THEN '일'
                                    WHEN '2' THEN '월'
                                    WHEN '3' THEN '화'
                                    WHEN '4' THEN '수'
                                    WHEN '5' THEN '목'
                                    WHEN '6' THEN '금'
                                    WHEN '7' THEN '토'
                                END AS week,
                                WEEK(reportDate,0) - WEEK(DATE_SUB(reportDate, INTERVAL DAYOFMONTH(reportDate)-1 DAY),0)+1 AS dayofweek
                            FROM report.AD_DAY_REPORT WHERE reportMonth = '${month}' GROUP BY reportDate
                        ) B
                    ON A.reportDate = B.reportDate
                    ORDER BY B.reportDate ASC`;
        return this.syncQuery(sql);
    }

    weekReport( month, site, masterId ) {
        let sqlMasterId = masterId ? `AND masterId = '${masterId}'` : '';
        let sqlSite = site ? `AND site = '${site}'` : '';

        let sql = `SELECT
                        B.week AS '요일',
                        (CASE WHEN A.viewCount IS NOT NULL THEN A.viewCount ELSE 0 END) as '노출수',
                        (CASE WHEN A.clickCount IS NOT NULL THEN A.clickCount ELSE 0 END) as '클릭수',
                        (CASE WHEN A.totalCost IS NOT NULL THEN A.totalCost ELSE 0 END) as '총비용',
                        (CASE WHEN A.changeOverCount IS NOT NULL THEN A.changeOverCount ELSE 0 END) as '전환수량',
                        (CASE WHEN A.changeOverCost IS NOT NULL THEN A.changeOverCost ELSE 0 END) as '전환금액'
                    FROM
                    (
                        SELECT
                            DAYOFWEEK(reportDate) as weeknum,
                            CASE DAYOFWEEK(reportDate)
                                WHEN '1' THEN '일'
                                WHEN '2' THEN '월'
                                WHEN '3' THEN '화'
                                WHEN '4' THEN '수'
                                WHEN '5' THEN '목'
                                WHEN '6' THEN '금'
                                WHEN '7' THEN '토'
                            END AS week,
                            SUM(viewCount) as viewCount,
                            SUM(clickCount) as clickCount,
                            SUM(totalCost) as totalCost,
                            SUM(changeOverCount) as changeOverCount,
                            SUM(changeOverCost) as changeOverCost
                        FROM report.AD_DAY_REPORT
                        WHERE
                            reportMonth = '${month}' ${sqlMasterId} ${sqlSite} 
                        GROUP BY weeknum, week
                    ) A
                    RIGHT JOIN (
                            SELECT 
                                DAYOFWEEK(reportDate) as weeknum,
                                CASE DAYOFWEEK(reportDate)
                                    WHEN '1' THEN '일'
                                    WHEN '2' THEN '월'
                                    WHEN '3' THEN '화'
                                    WHEN '4' THEN '수'
                                    WHEN '5' THEN '목'
                                    WHEN '6' THEN '금'
                                    WHEN '7' THEN '토'
                                END AS week
                            FROM report.AD_DAY_REPORT    
                            WHERE reportMonth = '${month}'
                            GROUP BY weeknum, week
                        ) B
                    ON A.weeknum = B.weeknum`;

        return this.syncQuery(sql);
    }

    dayOfWeekReport( month, site, masterId ) {
        let sqlMasterId = masterId ? `AND masterId = '${masterId}'` : '';
        let sqlSite = site ? `AND site = '${site}'` : '';

        let sql = `SELECT
                        CONCAT(B.dayofweek, '주') AS '주차',
                        CONCAT(DATE_FORMAT(B.minDate, '%Y-%m-%d'), ' ~ ') as '시작일자',
                        DATE_FORMAT(B.maxDate, '%Y-%m-%d') as '마지막일자',
                        (CASE WHEN A.viewCount IS NOT NULL THEN A.viewCount ELSE 0 END) as '노출수',
                        (CASE WHEN A.clickCount IS NOT NULL THEN A.clickCount ELSE 0 END) as '클릭수',
                        (CASE WHEN A.totalCost IS NOT NULL THEN A.totalCost ELSE 0 END) as '총비용',
                        (CASE WHEN A.changeOverCount IS NOT NULL THEN A.changeOverCount ELSE 0 END) as '전환수량',
                        (CASE WHEN A.changeOverCost IS NOT NULL THEN A.changeOverCost ELSE 0 END) as '전환금액'
                    FROM
                    (
                        SELECT
                            WEEK(reportDate,0) - WEEK(DATE_SUB(reportDate, INTERVAL DAYOFMONTH(reportDate)-1 DAY),0)+1 AS dayofweek,
                            SUM(viewCount) as viewCount,
                            SUM(clickCount) as clickCount,
                            SUM(totalCost) as totalCost,
                            SUM(changeOverCount) as changeOverCount,
                            SUM(changeOverCost) as changeOverCost
                        FROM report.AD_DAY_REPORT
                        WHERE
                            reportMonth = '${month}' ${sqlMasterId} ${sqlSite} 
                        GROUP BY dayofweek
                    ) A
                    RIGHT JOIN (
                            SELECT 
                                WEEK(reportDate,0) - WEEK(DATE_SUB(reportDate, INTERVAL DAYOFMONTH(reportDate)-1 DAY),0)+1 AS dayofweek,
                                MIN(reportDate) as minDate,
	                            MAX(reportDate) as maxDate
                            FROM report.AD_DAY_REPORT WHERE reportMonth = '${month}' GROUP BY dayofweek
                        ) B
                    ON A.dayofweek = B.dayofweek`;

        return this.syncQuery(sql);
    }

    searchPossibleMonth() {
        let sql = `select reportMonth from report.AD_DAY_REPORT GROUP BY reportMonth`;
        return this.syncQuery(sql);
    }

    searchMasterId( month ) {
        let sql = `select masterId from report.AD_DAY_REPORT WHERE reportMonth = '${month}' GROUP BY masterId`;
        return this.syncQuery(sql);
    }

    searchDateTerm( month ) {
        let sql = `SELECT 
                        CONCAT(DATE_FORMAT(MIN(reportDate), '%Y-%m-%d'), ' ~ ', DATE_FORMAT(MAX(reportDate), '%Y-%m-%d')) as '기간'
                    FROM report.AD_DAY_REPORT WHERE reportMonth = '${month}'`;
        return this.syncQuery(sql);
    }
}

module.exports = ReportQuery;