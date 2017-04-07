import React, { Component } from 'react';
import './App.css';
import ExcelViewPage from "./ExcelViewPage";

class App extends Component {
  render() {
    return (
      <ExcelViewPage ref="excel" />
    );
  }
}

export default App;
