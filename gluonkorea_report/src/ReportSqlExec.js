import ReportQuery from './ReportQuery';

let QUERY_STATUS = {
    READY: 0,
    START: 1,
    DONE: 2
};

export default class ReportSqlExec {
    constructor( option ) {
        this.state = {};
        this.setOption(option);
    }

    setOption( option ) {
        this.option = option;
    }

    _queryRun() {
        let that = this;

        let checkComplete = () => {
            let statusArray = [];
            let isCompleteChk = true;
            let tabNames = Object.getOwnPropertyNames( that.reportQuery );
            for ( let i = 0; i < tabNames.length; i++ ) {
                let tabName = tabNames[i];
                if ( that.reportQuery[tabName].constructor === Array ) {
                    for ( let j in that.reportQuery[tabName] ) {
                        statusArray.push( that.reportQuery[tabName][j].status );
                        if ( that.reportQuery[tabName][j].status !== QUERY_STATUS.DONE ) {
                            isCompleteChk = false;
                        }
                    }
                } else {
                    statusArray.push( that.reportQuery[tabName].status );
                    if ( that.reportQuery[tabName].status !== QUERY_STATUS.DONE ) {
                        isCompleteChk = false;
                    }
                }
            }
            return {
                isCompleteChk: isCompleteChk,
                progress: {
                    status: statusArray.filter(el => el === QUERY_STATUS.DONE).length,
                    max: statusArray.length
                }
            };
        };

        let queryReplace = (sql, param) => {
            let replaceSql = sql;
            Object.getOwnPropertyNames( param ).map( (el) => {
                replaceSql = replaceSql.replace( new RegExp("\\$" + el, 'mg'), param[el] );
            });
            return replaceSql;
        };

        let reportQueryRun = (element, i) => {
            if ( !element[i].status ) {
                element[i].status = QUERY_STATUS.START;
                if ( that.state.masterId ) {
                    element[i].params.masterId = that.state.masterId;
                }
                let query = queryReplace(element[i].query, element[i].params);

                let runMainQuery = () => {
                    that.option.workerImp.sendSql(query, function (res) {
                        element[i].res = res;
                        element[i].status = QUERY_STATUS.DONE;

                        let completeStatusCheck = checkComplete();
                        if (that.option.progress) {
                            that.option.progress(completeStatusCheck.progress);
                        }

                        if (completeStatusCheck.isCompleteChk) {
                            if (that.option.done) {
                                that.option.done(that.state.masterId, that.reportQuery);
                            }
                        }
                    });
                };

                if ( element[i].preQuery ) {
                    let preQuery = queryReplace(element[i].preQuery, element[i].params);
                    that.option.workerImp.sendSql(preQuery, function () {
                        runMainQuery();
                    });
                } else {
                    runMainQuery();
                }
                return true;
            }
            return false;
        };

        let reportRun = function() {
            let tabNames = Object.getOwnPropertyNames( that.reportQuery );
            for ( let i = 0; i < tabNames.length; i++ ) {
                let tabName = tabNames[i];
                if ( that.reportQuery[tabName].constructor === Array ) {
                    for ( let j = 0; j < that.reportQuery[tabName].length; j++ ) {
                        if ( reportQueryRun( that.reportQuery[tabName], j ) ) {
                            // recursive
                            reportRun(true);
                            return;
                        }
                    }
                } else {
                    if ( reportQueryRun( that.reportQuery, tabName ) ) {
                        reportRun();
                        return;
                    }
                }
            }
        };
        reportRun();
    }

    run( masterId ) {
        this.state.masterId = masterId;
        this.state.viewLoading = true;
        this.reportQuery = Object.assign( {}, ReportQuery() );
        this._queryRun();
    }
}