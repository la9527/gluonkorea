let request = require( 'request' );

let SPLIT_COUNT = 50;
let SEND_INTERVAL = 1000;

class AdTmonSellerCrawler {
    constructor() {
        this._baseReq = request.defaults({
            jar: request.jar(),
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Cache-Control': 'no-cache'
            }
        });
    }
    login( id, pass, resultFunc ) {
        let that = this;
        that._login = false;
        that._baseReq({
            url: 'http://nvista.admonseller.com/common/login/doLogin',
            method: 'POST',
            form: {
                memberId: id,
                password: pass
            }
        }, function (error, response, body) {
            let headers = response.headers;
            console.log('HEADER', JSON.stringify(response.headers, null, '  '));
            console.log(body);

            if ( headers && (!headers.location || !headers.location.match(/home/)) ) {
                console.error( 'LOGIN FAIL. !!!' );
                resultFunc(false);
                return;
            }
            that._login = true;
            resultFunc(true);
        });
    }
    isLogin() {
        return this._login;
    }
    salesMngGetList(searchText, resultFunc ) {
        if ( !this.isLogin() ) {
            if ( resultFunc ) {
                resultFunc( false, '로그인이 되지 않았습니다.' );
            }
            return false;
        }

        this._baseReq({
            url: 'http://nvista.admonseller.com/salesMng/salesMng06/list',
            method: 'POST',
            form: {
                srchTxt: 'comno',
                srchList: searchText
            },
            json: true
        }, function (error, response, body) {
            //console.log('HEADER', JSON.stringify(response.headers, null, '  '));
            //console.log(JSON.stringify(body, null, '  '));
            if ( body && body.success && body.message.length > 0 ) {
                resultFunc( true, body.message );
            } else {
                resultFunc( false );
            }
        });
    }

    startMsgList( listCoRegNums, resultFunc ) {
        let that = this;
        let dataList = Object.assign( [], listCoRegNums );
        let startPos = 0;
        let outputJsonData = [];

        if ( dataList.length === 0 ) {
            resultFunc( outputJsonData );
            return;
        }

        let recursiveRecall = function() {
            let callItem = dataList.splice( startPos, SPLIT_COUNT );
            if ( callItem.length > 0 ) {
                let searchText = callItem.join(',');
                console.log( 'Search Data Start - ' + callItem.length + ' : remain count - ' + dataList.length );
                that.salesMngGetList(searchText, function( result, data ) {
                    if ( result ) {
                        console.log( 'Search Data End - ' + callItem.length + ' : remain count - ' + dataList.length );
                        outputJsonData = outputJsonData.concat( data );
                    }
                    if ( dataList.length > 0 ) {
                        if ( SEND_INTERVAL > 0 ) {
                            setTimeout(function () {
                                recursiveRecall();
                            }, Math.floor(Math.random() * SEND_INTERVAL) + 1);
                        } else {
                            recursiveRecall();
                        }
                    } else {
                        resultFunc( outputJsonData );
                    }
                });
            }
        };
        recursiveRecall();
    }
}

module.exports = AdTmonSellerCrawler;