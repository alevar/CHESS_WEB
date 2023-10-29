import React, { useState, useEffect } from 'react';

import Header from "./components/Header/Header";
import SPA from "./components/SPA/SPA";
import Interface from "./components/Interface/Interface";
import TissueType from "./components/Interface/InterfaceComponents/TissueType";
import ScaffoldType from "./components/Interface/InterfaceComponents/ScaffoldType";


import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

function App() {

  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:5000/api/main/globalData");
      const data = await response.json();
      console.log("this is data",data);
      setJsonData(data);
    }
    fetchData();
  }, [])


  // -----------------------------------------------------------------------------
  // -----------------------------------------------------------------------------


  return (
    <div>
      <Header/>
      <Routes>
        <Route path="/" element={<SPA/>} />
        <Route path="/interface" element={<Interface/>} />
        <Route path="/interface/tissue" element={<TissueType/>} />
        <Route path="/interface/scaffold" element={<ScaffoldType/>} />
      </Routes>

    </div>
  );
}

export default App
