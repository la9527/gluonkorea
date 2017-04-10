import React, { Component } from 'react';
import './App.css';
import AdSearchPage from "./AdSearchPage";

class App extends Component {
  render() {
    return (
      <AdSearchPage ref="excel" />
    );
  }
}

export default App;
