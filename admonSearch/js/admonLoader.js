#!/usr/bin/env node
var request = require('request');
var fs = require('fs');
var csv = require('csvtojson');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('properties.prop');

var ID = properties.get('admon.id');
var PASS = properties.get('admon.pass');

if ( !ID || !PASS ) {
    console.log( 'Undefine admon.id or admon.pass in properties.prop file.' );
    process.exit(0);
    return;
}

var SPLIT_COUNT = parseInt(properties.get('send.splitcount') || '20', 10);
var SEND_INTERVAL = parseInt(properties.get('send.interval') || '1000', 10);

var j = request.jar();
var baseReq = request.defaults({
    jar: j,
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Cache-Control': 'no-cache'
    }
});

var admonSellerLogin = function(id, pass, resultFunc) {
    baseReq({
        url: 'http://nvista.admonseller.com/common/login/doLogin',
        method: 'POST',
        form: {
            memberId: id,
            password: pass
        }
    }, function (error, response, body) {
        var headers = response.headers;
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

var salesMngGetList = function(searchText, resultFunc ) {
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

function main() {
    var args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('ex)');
        console.error('  ' + process.argv.join(' ') + ' csvFile.csv');
        process.exit(0);
        return;
    }

    var dataList = [];
    var startPos = 0;
    var outputJsonData = [];
    var saveFileName = args.length >= 2 ? args[1] : 'researchData.json';

    var recursiveRecall = function() {
        var callItem = dataList.splice( startPos, SPLIT_COUNT );
        if ( callItem.length > 0 ) {
            var searchText = callItem.join(',');
            console.log( 'Search Data Start - ' + callItem.length + ' : remain count - ' + dataList.length );
            salesMngGetList(searchText, function( result, data ) {
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
