let express = require( 'express');
let cors = require( 'cors');
let bodyParser = require( 'body-parser' );
let AdTmonSellerCrawler = require( './AdTmonSellerCrawler' );
let ReportQuery = require( './ReportQuery' );

let listenPort = 3030;

let whitelist = ['http://localhost', 'http://localhost:3000', 'http://localhost:5000', 'http://gluonkorea.cafe24.com', 'chrome-extension://' ]
let corsOptions = {
    origin: function (origin, callback) {
        console.log( origin );

        /*
        let item = whitelist.filter( item => origin.indexOf(item) > -1 );
        if (item.length > 0) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
        */
        callback(null, true);
    }
};

let app = express();
let router = express.Router();
let reportQuery = new ReportQuery();

router.use(( req, res, next) => {
    console.log( req.method, req.url );
    next();
});

router.post('/admonSearch', (req, res) => {
    let postParams = req.body;
    let responseData = { success: false, msg: '', data: [] };

    if ( !postParams ) {
        responseData = {
            ...responseData,
            success: false,
            msg: '입력 데이터가 빈 데이터입니다.'
        };
        res.status(500).json( responseData );
        return;
    }

    let id = postParams.id;
    let pass = postParams.pass;
    let reqListData = postParams.data;

    if ( !id || !pass || !reqListData ) {
        console.log( postParams );

        responseData = {
            ...responseData,
            success: false,
            msg: '입력 데이터가 빈 데이터입니다.'
        };
        res.status(500).json( responseData );
        return;
    }

    if ( reqListData && reqListData.length > 0 ) {
        if ( typeof(reqListData[0]) === 'object' ) {
            responseData = {
                ...responseData,
                success: false,
                msg: '데이터 형식이 맞지 않습니다.'
            };
            res.status(500).json( responseData );
            return;
        }
    }

    let crawler = new AdTmonSellerCrawler();
    crawler.login( id, pass, function(result) {
        if ( result ) {
            crawler.startMsgList( reqListData, ( result ) => {
                res.status(200).json( {success: true, data: result } );
            });
        } else {
            res.status(500).send( {
                ...responseData,
                success: false,
                msg: '로그인이 실패하였습니다.'
            });
        }
    });
});

let requestUrlsInfo = [
    {
        url: '/report/getKeyword',
        funcName: 'getKeyword',
        param: [ { name: 'month', must: true, desc: '월' }, 'site', 'masterId' ]
    },
    {
        url: '/report/monthReport',
        funcName: 'monthReport',
        param: [ { name: 'month', must: true, desc: '월' }, 'site', 'masterId' ]
    },
    {
        url: '/report/weekReport',
        funcName: 'weekReport',
        param: [ { name: 'month', must: true, desc: '월' }, 'site', 'masterId' ]
    },
    {
        url: '/report/dayOfWeekReport',
        funcName: 'dayOfWeekReport',
        param: [ { name: 'month', must: true, desc: '월' }, 'site', 'masterId' ]
    }
];

let setRouterPostUrl= ( urlInfo ) => {
    router.post(urlInfo.url, async (req, res) => {
        let postParams = req.body;
        let responseData = {success: false, msg: '', data: []};

        let resMsgCall = (msg) => {
            responseData = {
                ...responseData,
                success: false,
                msg: msg
            };
            res.status(500).json(responseData);
        };

        if (!postParams) {
            resMsgCall('입력 데이터가 빈 데이터입니다.');
            return;
        }

        let callArgs = [];
        for ( let param of urlInfo.param ) {
            if ( typeof( param ) === 'string' ) {
                callArgs.push( postParams[ param ] );
            } else if ( typeof( param ) === 'object' ) {
                if ( param.must && !postParams[ param.name ] ) {
                    console.log(param);
                    resMsgCall(`필수 파라미터(${param.name})가 없습니다.`);
                    return;
                }
                console.log( param );
                callArgs.push( postParams[ param.name ] || '' );
            }
        }

        console.log( 'ARGS', callArgs );

        try {
            let result = await reportQuery[ urlInfo.funcName ].apply(reportQuery, callArgs);
            if (result) {
                console.log('SUCCESS', result);
                res.status(200).json({success: true, data: result});
            } else {
                console.log('ERROR: ', result);
                res.status(500).json({success: false, msg: 'Empty data.', data: []});
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({success: false, msg: e, data: []});
        }
    });
};

for ( let urlInfo of requestUrlsInfo ) {
    console.log( `Ready URLs - ${urlInfo.url}` );
    setRouterPostUrl( urlInfo );
}

app.use(bodyParser.json());
app.use( '*', cors(corsOptions) );
app.use( '/', router );

if (reportQuery.connect()) {
    let server = app.listen(listenPort, () => {
        console.log('Listening on port %d', server.address().port);
    });
};
