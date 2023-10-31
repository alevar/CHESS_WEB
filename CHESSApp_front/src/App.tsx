import React, { useState, useEffect } from 'react';

import Header from "./components/Header/Header";
import Annotations from "./components/Annotations/Annotations";
import Genes from "./components/Genes/Genes";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";

import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import GlobalContext from './components/GlobalContext';

function App() {

  const [globalData, setGlobalData] = useState<{ [key: string]: { [key: string]: any } }>({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("http://localhost:5000/api/main/globalData");
      const data = await response.json();
      setGlobalData(data);

    }
    fetchData();
  }, [])


  // -----------------------------------------------------------------------------
  // -----------------------------------------------------------------------------


  return (
    <GlobalContext.Provider value={globalData}>
      <div>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/annotations" element={<Annotations/>} />
          <Route path="/genes" element={<Genes/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<ContactUs/>} />
        </Routes>
      </div>
    </GlobalContext.Provider>
  );
}

export default App
