import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { pathManager, RoutePath } from '../utils/pathManager';
import { AppSettings } from '../types/appTypes';

export const usePathManager = () => {
  const navigate = useNavigate();
  
  const appSelections = useSelector((state: RootState) => state.appData.selections);
  const isInitialized = useSelector((state: RootState) => state.appData.initialized);

  /**
   * Navigate to a specific route with current app selections
   */
  const navigateTo = useCallback((
    route: string,
    replace: boolean = false
  ) => {
    const { path } = pathManager.buildPath(route);
    
    if (replace) {
      navigate(path, { replace: true });
    } else {
      navigate(path);
    }
  }, [navigate]);

  /**
   * Navigate to home page
   */
  const navigateToHome = useCallback((replace?: boolean) => {
    navigateTo('', replace);
  }, [navigateTo]);

  /**
   * Navigate to downloads page
   */
  const navigateToDownloads = useCallback((replace?: boolean) => {
    navigateTo('downloads', replace);
  }, [navigateTo]);

  /**
   * Navigate to genome browser
   */
  const navigateToBrowser = useCallback((replace?: boolean) => {
    navigateTo('browser', replace);
  }, [navigateTo]);

  /**
   * Navigate to explore page
   */
  const navigateToExplore = useCallback((replace?: boolean) => {
    navigateTo('explore', replace);
  }, [navigateTo]);

  /**
   * Navigate to gene page
   */
  const navigateToGene = useCallback((replace?: boolean) => {
    navigateTo('gene', replace);
  }, [navigateTo]);

  /**
   * Build a path without navigating
   */
  const buildPath = useCallback((
    route: string
  ): RoutePath => {
    return pathManager.buildPath(route);
  }, []);

  /**
   * Get base path for current selections
   */
  const getBasePath = useCallback(() => {
    return pathManager.getBasePath();
  }, []);

  /**
   * Extract route from current pathname
   */
  const extractRouteFromPath = useCallback((pathname: string) => {
    return pathManager.extractRouteFromPath(pathname);
  }, []);

  /**
   * Check if a route is active
   */
  const isRouteActive = useCallback((route: string, pathname: string) => {
    return pathManager.isRouteActive(route, pathname);
  }, []);

  /**
   * Parse a structured path and extract parameters
   */
  const parseStructuredPath = useCallback((pathname: string) => {
    return pathManager.parseStructuredPath(pathname);
  }, []);

  /**
   * Check if a path is a valid structured app path
   */
  const isStructuredAppPath = useCallback((pathname: string) => {
    return pathManager.isStructuredAppPath(pathname);
  }, []);

  return {
    // Navigation functions
    navigateTo,
    navigateToHome,
    navigateToDownloads,
    navigateToBrowser,
    navigateToExplore,
    navigateToGene,
    
    // Path building functions
    buildPath,
    getBasePath,
    
    // Route utilities
    extractRouteFromPath,
    isRouteActive,
    parseStructuredPath,
    isStructuredAppPath,
    
    // State
    isInitialized,
    currentSelections: isInitialized ? appSelections as AppSettings : null,
  };
}; 