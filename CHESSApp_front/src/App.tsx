import logo from "./logo.svg"
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


import Home from "./components/Home/Home";
import Select from "./components/Select/Select";
import Header from "./components/Header/Header";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";


import { loadDBData } from "./features/database/databaseAPI";

import "./App.css"

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDBData().then(response => {
      setData(response.data);
    });
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="App">
    <Header />
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/about" element={<About/>} />
      <Route path="/contact" element={<ContactUs/>} />
      <Route path="/select" element={<Select/>} />
    </Routes>
    </div>
  )
}

export default App
