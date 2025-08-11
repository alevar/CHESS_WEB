import React from "react";
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { store } from './redux/store';

import App from './App';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Downloads from './pages/Downloads';
import GenomeBrowser from './pages/GenomeBrowser';
import Explore from './pages/Explore/Explore';

const routes = [
  {
    path: "/:organism?/:assembly?/:source?/:version?/:nomenclature?",
    element: <App />,
    children: [
      { path: '', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'download', element: <Downloads /> },
      { path: 'browser', element: <GenomeBrowser /> },
      { path: 'explore', element: <Explore /> },
    ],
  }
];

const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
