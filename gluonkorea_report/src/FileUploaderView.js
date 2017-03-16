import React, { Component } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';

let LOAD_TYPE = {
    READY: '대기',
    LOADING: '로딩중',
    FAIL: '실패',
    DONE: '완료'
};

export default class FileUploaderView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statusText: ''
        };
    }

    static propTypes = {
        workerImp: React.PropTypes.object,
        tableName: React.PropTypes.string
    }

    fileLoader(e) {
        e.stopPropagation();
        e.preventDefault();

        let files = e.dataTransfer && e.dataTransfer.files;
        if ( !files ) {
            files = e.target.files;
        }

        if ( !files || files.length === 0 ) {
            alert( '파일이 선택되지 않았습니다.' );
            return;
        }

        this.setState( {
            ...this.state,
            showFileUpload: false
        });

        this.loadedFiles = [];

        for ( let i = 0; i < files.length; i++ ) {
            this.loadedFiles.push({
                file: files[i],
                loadtype: LOAD_TYPE.READY
            });
        }

        this.fileLoaderRun();
    }

    fileLoaderRun() {
        let that = this;
        let callFileReader = (fileData) => {
            let fileReader = new FileReader();
            fileReader.onprogress = (e) => {
                console.log( 'File Loader : (' + e.loaded + ' / ' + e.total + ') - ', fileData.tableName );
                that.setState({
                    ...that.state,
                    statusText: LOAD_TYPE.LOADING,
                    progress: {
                        now: e.loaded,
                        max: e.total
                    }
                });
            };
            fileReader.onload = (e) => {
                let data = e.target && e.target.result;
                if ( !data ) {
                    alert( '파일 로딩에 실패하였습니다.' );
                    return;
                }
                that.setState({
                    ...that.state,
                    statusText: LOAD_TYPE.DONE
                });
                that.props.workerImp.postMessage( { type: 'loaddata', data: data, name: fileData.tableName } );
            };
            fileReader.onerror = (e) => {
                console.error('onError', e, fileData.tableName);
                that.setState({
                    ...that.state,
                    statusText: LOAD_TYPE.FAIL
                });
            };
            fileReader.readAsText(fileData.file, 'utf8');
        };

        for ( let i = 0; i < this.loadedFiles.length; i++ ) {
            let loadItem = this.loadedFiles[i];
            if ( loadItem.loadtype !== LOAD_TYPE.COMPLETE ) {
                loadItem.loadtype = LOAD_TYPE.LOADING;
                loadItem.tableName = this.props.tableName;
                callFileReader( loadItem );
                this.loadedFiles[i] = loadItem;
                break;
            }
        }
    }

    render() {
        let that = this;
        let inputBox = () => {
            if ( that.state.statusText === LOAD_TYPE.LOADING && that.state.progress ) {
                return (
                    <Row>
                        <Col md={5}>
                            <small>{this.props.tableName}</small>
                        </Col>
                        <Col md={7}>
                            <ProgressBar active now={that.state.progress.now} max={that.state.progress.max} />
                        </Col>
                    </Row>
                );
            }
            let uploadFileId = 'uploadFile_' + Date.now() + '_' + Math.floor((Math.random() * 100) + 1);
            return (
                <Row>
                    <Col md={5}>
                        <small>{this.props.tableName}</small>
                    </Col>
                    <Col md={5}>
                        <div className="filebox">
                            <label htmlFor={uploadFileId}>CSV 업로드</label>
                            <input ref="xlsInput" className="col-xs-12" id={uploadFileId} type="file" onChange={::this.fileLoader} />
                        </div>
                    </Col>
                    <Col md={2}>
                        <small>{this.state.statusText}</small>
                    </Col>
                </Row>
            );
        };
        return inputBox();
    }
}
