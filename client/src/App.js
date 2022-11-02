import React from 'react';
import './App.css';

import { Home } from "./pages/Home";

//comment test

function App() {
  return (
    <div className="App" style={{ backgroundColor: "rgb(31, 34, 51)", minHeight: "100vh" }}>
      <header className="App-header">
        <h3 className="headingText">MazeRunner</h3>
      </header>
      <Home />
    </div>
  );
}

export default App;
