import React from "react";
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { store } from './redux/store';

import App from './App';
import Dashboard from './pages/Dashboard';
import DatabaseManagement from './pages/DatabaseManagement';
import OrganismsManagement from './pages/OrganismsManagement';
import AssemblyManagement from './pages/AssemblyManagement';
import AssemblyDetail from './pages/AssemblyDetail';
import SourceManagement from './pages/SourceManagement';
import SourceDetail from './pages/SourceDetail';
import SourceVersionDetail from './pages/SourceVersionDetail';
import ConfigurationsManagement from './pages/ConfigurationsManagement';
import DatasetsManagement from './pages/DatasetsManagement';

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'database', element: <DatabaseManagement /> },
      { path: 'organisms', element: <OrganismsManagement /> },
      { path: 'assemblies', element: <AssemblyManagement /> },
      { path: 'assemblies/:assemblyId', element: <AssemblyDetail /> },
      { path: 'sources', element: <SourceManagement /> },
      { path: 'sources/:sourceId', element: <SourceDetail /> },
      { path: 'sources/:sourceId/sv/:svId', element: <SourceVersionDetail /> },
      { path: 'configurations', element: <ConfigurationsManagement /> },
      { path: 'datasets', element: <DatasetsManagement /> },
    ],
  }
];

const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
); 