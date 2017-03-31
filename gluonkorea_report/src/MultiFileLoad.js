import { tableNames } from './ReportQuery';
import axios from 'axios';

export default class MultiFileLoad {
    constructor( workerImp, option ) {
        this._option = Object.assign( {
            [tableNames.A_DAYS]: 'csvFiles/A_DAY_01.csv',
            [tableNames.A_KEYWORD]: 'csvFiles/A_KEYWORD_01.csv',
            [tableNames.G_DAYS]: 'csvFiles/G_DAY_01.csv',
            [tableNames.G_KEYWORD]: 'csvFiles/G_KEYWORD_01.csv'
        }, option );
        this._workerImp = workerImp;
    }

    downloadFiles( name, downloadUrl ) {
        let that = this;
        axios.get( downloadUrl )
            .then(function(response) {
                that._workerImp.postMessage( { type: 'loaddata', data: response.data, name: name} );
            })
            .catch(function(error) {
                console.error( 'LOAD FAILED : ', error, downloadUrl );
            });
    }

    run( onResult ) {
        let that = this;

        let tableNames = Object.getOwnPropertyNames(this._option);
        let tableCheck = tableNames.map( (el) => {
            return {
                tableName: el,
                complete: false
            };
        });

        this._workerImp.setLoadDoneMsg( function( msg ) {
            console.log('this._workerImp.setLoadDoneMsg', msg.tableName);

            tableCheck = tableCheck.map((el) => {
                if (el.tableName === msg.tableName) {
                    el.complete = true;
                }
                return el;
            });

            if ( tableCheck.filter(el => el.complete).length === tableCheck.length ) {
                onResult && onResult();
            }
        });

        tableNames.map( (el) => {
            that.downloadFiles( el, this._option[el] );
        });
    }
}
