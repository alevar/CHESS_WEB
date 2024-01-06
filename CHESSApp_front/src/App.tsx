import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';

import Home from "./components/Home/Home";
import Custom from "./components/Custom/Custom";
import Header from "./components/Header/Header";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";

import { useGetGlobalDataQuery } from './features/database/databaseApi';
import { store } from './app/store';

import { DatabaseState } from './features/database/databaseSlice';
import { SettingsState, set_include_sources } from './features/settings/settingsSlice';

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

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

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
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/" element={<Home />} />
            <Route path="/custom" element={<Custom />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;