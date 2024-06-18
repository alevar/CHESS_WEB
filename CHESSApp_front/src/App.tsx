import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useGetGlobalDataQuery } from './features/database/databaseApi';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

// Lazy load components
const Main = lazy(() => import('./components/Main/Main'));
const Custom = lazy(() => import('./components/Main/Custom/Custom'));
const Explore = lazy(() => import('./components/Main/Explore/Explore'));
const Home = lazy(() => import('./components/Main/Home/Home'));
const About = lazy(() => import('./components/About/About'));
const ContactUs = lazy(() => import('./components/ContactUs/ContactUs'));

const LoadingSpinner: React.FC = () => (
  <div className="loading">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

const App: React.FC = () => {
  const { data, error, isLoading } = useGetGlobalDataQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error.toString()}</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/main/:organismID/:assemblyID/:sourceIDs" element={<Main />}>
                  <Route path="home" element={<Home />} />
                  <Route path="custom" element={<Custom />} />
                  <Route path="explore">
                    <Route index element={<Explore />} />
                    <Route path=":locus_id" element={<Explore />} />
                  </Route>
                </Route>
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/*" element={<Navigate to="/main/1/1/4/home" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
