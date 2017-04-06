#!/usr/bin/env node
var request = require('request');
var fs = require('fs');
var csv = require('csvtojson');

let ID = 'hlmaster';
let PASS = 'pih2001##';

let j = request.jar();
let baseReq = request.defaults({
    jar: j,
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Cache-Control': 'no-cache'
    }
});

let admonSellerLogin = function(id, pass, resultFunc) {
    baseReq({
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
        resultFunc(true);
    });
};

let salesMngGetList = function(searchText, resultFunc ) {
    baseReq({
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
};

let SPLITNUM = 20;
let SEND_INTERVAL = 1000;

function main() {
    var args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('ex)');
        console.error('  ' + process.argv.join(' ') + ' csvFile.csv');
        process.exit(0);
        return;
    }

    let dataList = [];
    let startPos = 0;
    let outputJsonData = [];
    let saveFileName = args.length >= 2 ? args[1] : 'researchData.json';

    let recursiveRecall = function() {
        let callItem = dataList.splice( startPos, SPLITNUM );
        if ( callItem.length > 0 ) {
            let searchText = callItem.join(',');
            console.log( 'Search Data Start - ' + callItem.length + ' : remain count - ' + dataList.length );
            salesMngGetList(searchText, function( result, data ) {
                if ( result ) {
                    console.log( 'Search Data End - ' + callItem.length + ' : remain count - ' + dataList.length );
                    outputJsonData = outputJsonData.concat( data );
                }
                if ( dataList.length > 0 ) {
                    setTimeout( function() {
                        recursiveRecall();
                    }, Math.floor(Math.random() * 1000) + 1 );
                } else {
                    console.log( 'Search Complete. - Save to ' + saveFileName + '.');
                    fs.writeFile(saveFileName, JSON.stringify(outputJsonData, '  ', 2), 'utf8', function() {
                        process.exit(0);
                    });
                }
            });
        }
    };

    try {
        admonSellerLogin(ID,PASS, function (result) {
            if ( result ) {
                console.log('salesMngGetList !!!');
                csv({noheader: true})
                    .fromFile(args[0])
                    .on('json', function (jsonObj) {
                        if ( jsonObj.field1 ) {
                            dataList.push(jsonObj.field1);
                        }
                    }).on('done', function () {
                        recursiveRecall();
                    });
            }
        });
    } catch( e ) {
        console.log( 'Error !!!', e );
    }
}

main();
