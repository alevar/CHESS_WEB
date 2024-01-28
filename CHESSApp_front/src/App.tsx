import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Spinner from 'react-bootstrap/Spinner';

import Main from "./components/Main/Main";
import Custom from "./components/Main/components/Custom/Custom";
import Explore from "./components/Main/components/Explore/Explore";
import Home from "./components/Main/components/Home/Home";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";

import { useGetGlobalDataQuery } from './features/database/databaseApi';
import { store } from './app/store';

import "./App.css"

const App: React.FC = () => {
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

  return (
    <Provider store={store}>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <Header />
          <main>
            <Routes>
              <Route path="/main/:organismID/:assemblyID/:sourceIDs" element={<Main />}>
                <Route path="home" element={<Home />} />
                <Route path="custom" element={<Custom />} />
                <Route path="explore" element={<Explore />} />
                <Route path="explore/:gene_id" element={<Explore />} />
              </Route>
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/*" element={<Navigate to="/main/1/1/4/home" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;
