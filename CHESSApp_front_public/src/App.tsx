import React, { useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppData } from './redux/App/AppThunks';
import { setOrganism, setAssembly } from './redux/App/AppSlice';
import { RootState, AppDispatch } from './redux/store';

import { PathParts, parsePathname, buildPathname } from './utils/utils';

import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import LoadingSpinner from './components/common/LoadingAnimation/LoadingAnimation';

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.global);
  const location = useLocation();
  const pathParts: PathParts = parsePathname(location.pathname);

  const { organism, assembly } = useParams<{
    organism: string;
    assembly: string;
  }>();

  // Define default values
  const defaultOrganismId = 1;
  const defaultAssemblyId = 1;

  // Parse params or use default values
  const organism_id = organism ? Number(organism.split(':')[1]) : defaultOrganismId;
  const assembly_id = assembly ? Number(assembly.split(':')[1]) : defaultAssemblyId;

  useEffect(() => {
    if (!organism || !assembly) {
      // if either setting is not set - construct new path and redirect
      const new_path = buildPathname({ params: { oid: defaultOrganismId.toString(), aid: defaultAssemblyId.toString() }, remainder: pathParts.remainder });
      navigate(new_path, { replace: true });
      return;
    }

    if (organism_id) dispatch(setOrganism(organism_id));
    if (assembly_id) dispatch(setAssembly(assembly_id));

    dispatch(fetchAppData());
  }, [dispatch, organism, assembly, organism_id, assembly_id, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Header />
      <Outlet /> {/* Render matched child route */}
      <Footer />
    </>
  );
};

export default App;
