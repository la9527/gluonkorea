/**
 * Created by la9527 on 2017. 4. 7..
 */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import AdTmonSellerCrawler from './AdTmonSellerCrawler';

let listenPort = 3030;

let whitelist = ['http://localhost', 'http://localhost:3000', 'http://localhost:5000', 'http://gluonkorea.cafe24.com']
let corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

let app = express();
let router = express.Router();

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

app.use(bodyParser.json());
app.use( '*', cors(corsOptions) );
app.use( '/', router );

let server = app.listen(listenPort, () => {
    console.log('Listening on port %d', server.address().port);
});
