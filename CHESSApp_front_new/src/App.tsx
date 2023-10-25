import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Interface from "./components/Interface/Interface";
import TissueType from "./components/Interface/InterfaceComponents/TissueType";

import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/interface" element={<Interface/>} />
        <Route path="/interface/tissue" element={<TissueType/>} />
      </Routes>

    </div>
  );
}

export default App
