import logo from "./logo.svg"
import { Counter } from "./components/Counter/Counter"
import Home from "./components/Home/Home";
import "./App.css"

import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Home />
      </header>
    </div>
  )
}

export default App
