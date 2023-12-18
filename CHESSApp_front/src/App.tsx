import logo from "./logo.svg"
import { useSelector, useDispatch, Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';


import Breadcrumbs from './components/Breadcrumbs/Breadcrumbs';
import Home from "./components/Home/Home";
import Select from "./components/Select/Select";
import Header from "./components/Header/Header";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";

import { useGetGlobalDataQuery } from './features/database/databaseApi';
import { selectSettings } from './features/settings/settingsSlice';
import { store } from './app/store';

import "./App.css"

function App() {

  const items = [
    { name: "Item 1", information: "Information about Item 1" },
    { name: "Item 2", information: "Information about Item 2" },
    // Add more items as needed
  ];
  
  const { data, error, isLoading } = useGetGlobalDataQuery();

  if (isLoading) {
    return  <div className="loading">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Header />
          <Breadcrumbs/>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/contact" element={<ContactUs/>} />
            <Route path="/select" element={<Select items={items}/>} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;