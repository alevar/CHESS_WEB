import logo from "./logo.svg"
import { useSelector, useDispatch, Provider } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


import Home from "./components/Home/Home";
import Select from "./components/Select/Select";
import Header from "./components/Header/Header";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";

import { useGetGlobalDataQuery } from './features/database/databaseApi';
import { store } from './app/store';

import "./App.css"

function App() {
  
  const { data, error, isLoading } = useGetGlobalDataQuery();
  console.log(data);

  if (isLoading) {
    return  <div className="loading">
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
            </div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Provider store={store}>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<ContactUs/>} />
          <Route path="/select" element={<Select/>} />
        </Routes>
      </div>
    </Provider>
  )
}

export default App
