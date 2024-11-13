import React from "react";
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { store } from './redux/store';

import App from './App';
import Home from './pages/Home/Home';
import About from './pages/About/About';

import 'bootstrap/dist/css/bootstrap.min.css';

const routes = [
  {
    path: "/:organism?/:assembly?",
    element: <App />,
    children: [
      { path: '', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <div>Contact</div> },
      { path: 'explore', element: <div>Explore</div> },
      { path: 'search', element: <div>Search</div> },
      { path: 'custom-download', element: <div>Custom Download</div> },
      { path: 'download', element: <div>Download</div> },
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
