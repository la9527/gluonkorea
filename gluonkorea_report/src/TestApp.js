import React, { Component } from 'react';
import { ButtonToolbar, Button, PageHeader } from 'react-bootstrap';
import LoadingBox from './LoadingBox';

class TestApp extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        let that = this;
        that.loader = new LoadingBox();
        that.loader.show();
        /*setTimeout( () => {
            that.loader.close();
        }, 3000);*/
    }

    componentWillUnmount() {}

    render() {
        return (
            <div ></div>
        );
    }
}

export default TestApp;