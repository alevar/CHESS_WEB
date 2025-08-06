import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import { fetchGlobalData } from './redux/globalData/globalDataThunks';
import Header from './components/Header';
import './App.css';

const App: React.FC = () => {
  const { sources, assemblies, organisms, lastUpdated } = useSelector((state: RootState) => state.globalData);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    if (!lastUpdated) {
      dispatch(fetchGlobalData());
    }
  }, [lastUpdated]);

  return (
    <div className="admin-app">
      <Header />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default App; 