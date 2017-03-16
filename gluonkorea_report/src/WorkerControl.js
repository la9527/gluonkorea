
export default class WorkerControl
{
    constructor() {
        this.queryItem = [];
        this.init();
    }
    init() {
        let that = this;
        this.worker = new Worker( 'static/js/worker.bundle.js?time=' + Date.now() );
        this.worker.onmessage = function(e) {
            let result = e.data || e;

            if ( result.index ) {
                that.queryResponse( result );
            } else {
                switch (result.type) {
                    case 'error':
                        console.error(result.msg);
                        break;
                    case 'status':
                        that.statusFunc && that.statusFunc( result.msg );
                        console.log(result.msg);
                        break;
                    case 'load_done':
                        console.log(result);
                        that.loadDoneFunc && that.loadDoneFunc(result);
                        break;
                    case 'sql':
                        console.log(result);
                        break;
                    default:
                        console.log('TYPE NOT FOUND !!!', result);
                        break;
                }
            }
        };
    }
    setStatusMsg( statusFunc ) {
        this.statusFunc = statusFunc;
    }
    setLoadDoneMsg( loadDoneFunc ) {
        this.loadDoneFunc = loadDoneFunc;
    }
    queryResponse( resMsg ) {
        let removeIdx = -1;
        let item = this.queryItem.filter((el, index)=>{
            if (el.index === resMsg.index) {
                removeIdx = index;
                return true;
            }
            return false;
        });
        if ( item && item.length === 1 && typeof(item[0].resultFunc) === 'function' ) {
            item[0].resultFunc( { type: resMsg.type, result: resMsg.res, msg: (resMsg.res ? 'success' : resMsg.msg) } );
        }
        if ( removeIdx > -1 ) {
            this.queryItem.splice(removeIdx, 1);
        }
    }

    postMessage( msg ) {
        this.worker.postMessage( msg );
    }

    sendSql( sql, value, resultFunc, noMsg ) {
        if (typeof(value) === 'function' && !resultFunc) {
            resultFunc = value;
            value = null;
        }

        let index = (this.queryItem.length + 1);
        let callItem = { type: 'sql', sql: sql, index: index, noMsg: noMsg, resultFunc: resultFunc, value: value };
        this.queryItem.push( callItem );

        let copyItem = Object.assign({}, callItem);
        delete copyItem.resultFunc;

        console.log( JSON.stringify(copyItem, null, '  ') );

        this.postMessage( copyItem );
    }
}

