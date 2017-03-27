import alasql from 'alasql';

let DB_NAME = 'MEM_DB';
let logOnOff = false;

let log = logOnOff ? console.log.bind(console) : function() {};

function csvParser( text, opts ) {
    let opt = {
        separator: ',',
        quote: '"',
        headers:true
    };
    opt = Object.assign( true, opt, opts );

    let hs = [];

    let delimiterCode = opt.separator.charCodeAt(0);
    let quoteCode = opt.quote.charCodeAt(0);

    let EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;

    function token() {
        if (I >= N){
            return EOF;
        }
        if (eol){
            return (eol = false, EOL);
        }
        let j = I;
        if (text.charCodeAt(j) === quoteCode) {
            let i = j;
            while (i++ < N) {
                if (text.charCodeAt(i) === quoteCode) {
                    if (text.charCodeAt(i + 1) !== quoteCode){
                        break;
                    }
                    ++i;
                }
            }
            I = i + 2;
            let c = text.charCodeAt(i + 1);
            if (c === 13) {
                eol = true;
                if (text.charCodeAt(i + 2) === 10){
                    ++I;
                }
            } else if (c === 10) {
                eol = true;
            }
            return text.substring(j + 1, i).replace(/""/g, '"');
        }
        while (I < N) {
            let c = text.charCodeAt(I++), k = 1;
            if(c === 10){
                eol = true;
            } else if (c === 13) {
                eol = true;
                if (text.charCodeAt(I) === 10){
                    ++I;
                    ++k;
                }
            } else if(c !== delimiterCode){
                continue;
            }
            return text.substring(j, I - k);
        }
        return text.substring(j);
    }

    log( 'parse Text - ' + text.length );

    while ((t = token()) !== EOF) {
        let a = [];
        while (t !== EOL && t !== EOF) {
            a.push(t.trim());
            t = token();
        }

        if(opt.headers) {
            if(n === 0) {
                if(typeof opt.headers === 'boolean') {
                    hs = a;
                } else if(Array.isArray(opt.headers)) {
                    hs = opt.headers;
                    let r = {};
                    hs.forEach(function(h,idx){
                        r[h] = a[idx];
                        // Please avoid === here
                        if((typeof r[h] !== 'undefined') && r[h].length !== 0 && (r[h]).trim() === +r[h]){ // jshint ignore:line
                            r[h] = +r[h];
                        }
                    });
                    rows.push(r);
                }

            } else {
                let r = {};
                hs.forEach(function(h,idx){
                    r[h] = a[idx];
                    if((typeof r[h] !== 'undefined') && r[h].length !== 0 && r[h].trim() === +r[h]){ // jshint ignore:line
                        r[h] = +r[h];
                    }
                });
                rows.push(r);
            }
            n++;
        } else {
            rows.push(a);
        }

        if ( opt.onProgress && rows.length % 2000 === 0 ) {
            opt.onProgress( 'CSV Parsing ' + rows.length );
        }
    }
    if ( opt.onProgress ) {
        opt.onProgress( 'CSV Parsing ' + rows.length );
    }
    log( 'Loading Count : ' + rows.length );
    return rows;
}

let parseInteger = (v) => {
    let number = 0;
    try {
        number = parseInt(v, 10);
    } catch( e ) {
        number = 0;
    }
    return number;
};

alasql.aggr.GROUPSUM = (v,s,stage) => {
    if ( stage === 1 ) {
        if ( v === null ) return null;
        return parseInteger( v );
    }
    if( stage === 2 ) {
        if ( v === null || s === null ) return null;
        return parseInteger( s ) + parseInteger( v );
    }
    return parseInteger(s);
};

alasql.fn.DAY = (dateStr) => {
    let rt = null;
    if( dateStr === null ) return null;
    try {
        rt = "일월화수목금토".charAt((new Date(dateStr)).getDay());
    } catch( e ) {}
    return rt;
};

alasql.fn.customPercent = (type1, type2) => {
    try {
        if (type1 && type2) {
            if ( type1 === null || type2 === null ) return null;
            return ((parseInt(type1, 10) / parseInt(type2, 10)) * 100).toFixed(1);
        }
        if (type1) {
            if ( type1 == null ) return null;
            return (parseFloat(type1, 10) * 100).toFixed(1);
        }
    } catch( e ) {}
    return 0;
};

alasql.fn.FIXED = (type1, number = 0) => {
    try {
        if ( type1 === null ) return null;
        if (type1) {
            return (parseFloat(type1, 10)).toFixed(number);
        }
    } catch( e ) {}
    return 0;
};

alasql.fn.DATEFIX = (type1) => {
    // 2017.1.1 -> 2017.01.01
    if ( !type1 ) return type1;

    let item = type1.split('.');
    if ( item.length === 3 ) {
        if ( item[1].length == 1 ) {
            item[1] = '0' + item[1];
        }
        if ( item[2].length == 1 ) {
            item[2] = '0' + item[2];
        }
        return item.join('.');
    }
    return type1;
};

alasql.fn.INTEGER = (type1) => {
    return parseInteger(type1);
};

alasql.fn.WEEK = function(dateStr) {
    let date = new Date(dateStr);
    let onejan = new Date(date.getFullYear(),0,1);
    return (Math.ceil((((date - onejan) / 86400000) + onejan.getDay()+1)/7)) + '주';
};

class WorkerRunning {
    init() {
        this.connectDB();
    }

    sendPostMsg( data ) {
        self.postMessage( data );
    }

    errorMsg( msg ) {
        log( 'ERROR: ', msg );
        self.postMessage( { type: 'error', msg: (msg + '') })
    }

    statusMsg( msg ) {
        log( 'STATUS: ', msg );
        self.postMessage( { type: 'status', msg: msg })
    }

    connectDB() {
        let that = this;
        let sql = `CREATE DATABASE IF NOT EXISTS ${DB_NAME};\n`;
        sql += `USE ${DB_NAME};\n`;

        alasql.promise( sql ).then((res)=> {
            that.statusMsg( 'Complete ready' );
        }).catch( (error) => {
            that.errorMsg(error);
        });
    }

    querySQL( sql, value, index, noMsg ) {
        let that = this;

        !noMsg && that.statusMsg( 'Query Running...' );
        let promise = alasql.promise( sql, value ? [ value ] : undefined );

        let errorFunc = (error) => {
            !noMsg && that.statusMsg( 'Query Error...' );
            that.sendPostMsg({type:'error', msg: (error + ''), index: index });
        }

        let endTimeout = false;
        let timeout = setTimeout( () => {
            endTimeout = true;
            console.log( 'TIMEOUT DATA ', sql );
            errorFunc('Query timoeut....');
        }, 5000);

        promise.then((res)=> {
            clearTimeout( timeout );
            if ( !endTimeout ) {
                !noMsg && that.statusMsg('Query Complete...[' + sql + ']');
                that.sendPostMsg({type: 'sql', res: res, index: index});
            } else {
                console.log( 'TIMEOUT DATA RESULT : ', sql, res );
            }
        }).catch((error) => {
            clearTimeout( timeout );
            console.log(error);
            if ( !endTimeout ) {
                errorFunc(error);
            }
        });


    }

    saveToDBFromCSV( allData, tableName ) {
        let that = this;
        let csvData = csvParser( allData, {
            onProgress: ( msg ) => {
                that.statusMsg( msg );
            }
        });

        let sql = '';
        sql += `DROP TABLE IF EXISTS [${tableName}];\n`;
        sql += `CREATE TABLE IF NOT EXISTS [${tableName}];\n`;

        let csvDataLength = csvData.length;

        log( sql );

        alasql.promise( sql, [csvData] ).then((res)=> {
            let insertSql = alasql.compile(`INSERT INTO [${tableName}] VALUES ?`);
            csvData.map( (el, index) => {
                insertSql( [ el ] );
                if ( index % 1000 === 0 ) {
                    that.statusMsg( 'LOADING : ' + ((index / csvDataLength) * 100).toFixed(1) + '%' );
                }
                return el;
            });

            that.statusMsg( 'Complete. - ' + tableName );
            that.sendPostMsg({type:'load_done', result: true, tableName: tableName });
        }).catch( (error) => {
            console.log( error );
            that.sendPostMsg({type:'load_done', result: false, name: tableName });
            that.statusMsg( 'Create Table Error !!! - ' + tableName );
        });
    }
}

let workingRun = new WorkerRunning();
workingRun.init();

self.onmessage = (oEvent) => {
    let res = oEvent.data;

    switch( res.type ) {
        case 'sql':
            log( res );
            workingRun.querySQL( res.sql, res.value, res.index, res.noMsg );
            break;
        case 'loaddata':
            workingRun.saveToDBFromCSV( res.data, res.name );
            break;
        default:
            log( res );
            workingRun.errorMsg('type is not Found !!!');
    }
};
