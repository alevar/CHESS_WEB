import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Interface from "./components/Interface/Interface";
import TissueType from "./components/Interface/InterfaceComponents/TissueType";
import ScaffoldType from "./components/Interface/InterfaceComponents/ScaffoldType";


import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import { useEffect } from "react";


function App() {

  // -----------------------------------------------------------------------------
  // For Testing Purposes! -- making API call in App() to retrieve all data at once
  // -----------------------------------------------------------------------------
  useEffect(() => {
    console.log("made it here")


    const fetchData = async () => {
      const result = await fetch("http://localhost:5000/api/main/sequences")
      console.log(result.json())
    }
    fetchData();
  }, [])


  // -----------------------------------------------------------------------------
  // -----------------------------------------------------------------------------


  return (
    <div>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/interface" element={<Interface/>} />
        <Route path="/interface/tissue" element={<TissueType/>} />
        <Route path="/interface/scaffold" element={<ScaffoldType/>} />
      </Routes>

    </div>
  );
}

export default App
