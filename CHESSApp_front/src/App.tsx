import logo from "./logo.svg"
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';


import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import SelectOrganism from './components/BaseSelections/SelectOrganism';
import SelectAssembly from './components/BaseSelections/SelectAssembly';
import Home from "./components/Home/Home";
import Select from "./components/Select/Select";
import Custom from "./components/Custom/Custom";
import Header from "./components/Header/Header";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";

import { useGetGlobalDataQuery } from './features/database/databaseApi';
import { store } from './app/store';

import "./App.css"

function App() {

  const [selectedOrganism, setSelectedOrganism] = useState<number | null>(null);
  const [selectedAssembly, setSelectedAssembly] = useState<number | null>(null);

  const { data, error, isLoading } = useGetGlobalDataQuery();

  if (isLoading) {
    return (
      <div className="loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleOrganismSelect = (selectedValue: number) => {
    setSelectedOrganism(selectedValue);
  };

  const handleAssemblySelect = (selectedValue: number) => {
    setSelectedAssembly(selectedValue);
  };

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Breadcrumbs organism={selectedOrganism} assembly={selectedAssembly} />
          <Routes>
            <Route path="/" element={<SelectOrganism />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/selectPrecompiled" element={<Select/>} />
            <Route path="/custom" element={<Custom/>} />
            <Route
              path="/select"
              element={
                <SelectOrganism
                  onSelect={handleOrganismSelect}
                />
              }
            />
            <Route
              path="/select/:organism"
              element={
                <SelectAssembly
                  onSelect={handleAssemblySelect}
                />
              }
            />
            <Route
              path="/select/:organism/:assembly"
              element={<Home />}
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;