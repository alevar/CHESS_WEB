import { AppSettings, UrlParams } from '../types/appTypes';
import { store } from '../redux/store';

export interface RoutePath {
  path: string;
  params: UrlParams;
}

export class PathManager {
  private static instance: PathManager;

  private constructor() {}

  static getInstance(): PathManager {
    if (!PathManager.instance) {
      PathManager.instance = new PathManager();
    }
    return PathManager.instance;
  }

  /**
   * Get current app selections from Redux store
   */
  private getCurrentAppSelections(): AppSettings | null {
    const state = store.getState();
    const { appData } = state;
    
    if (appData.initialized && appData.selections) {
      return appData.selections as AppSettings;
    }
    
    return null;
  }

  buildPath(route: string): RoutePath {
    let params: UrlParams = {};

    // Get current app selections from Redux store
    const currentSelections = this.getCurrentAppSelections();
    
    if (currentSelections) {
      params = {
        organism: currentSelections.organism_id?.toString(),
        assembly: currentSelections.assembly_id?.toString(),
        source: currentSelections.source_id?.toString(),
        version: currentSelections.version_id?.toString(),
        nomenclature: currentSelections.nomenclature
      };
    }

    // Build the path with structured format
    let path = '/';
    
    // Add base parameters if they exist with prefixes
    if (params.organism && params.assembly && params.source && params.version && params.nomenclature) {
      path += `o:${params.organism}/a:${params.assembly}/s:${params.source}/v:${params.version}/n:${params.nomenclature}/`;
    }

    // Add route
    if (route) {
      path += `${route}`;
    }

    return { path, params };
  }

  /**
   * Get the base path (without route) for current app selections
   */
  getBasePath(): string {
    const currentSelections = this.getCurrentAppSelections();
    
    if (!currentSelections) {
      return '/';
    }

    const organism = currentSelections.organism_id?.toString();
    const assembly = currentSelections.assembly_id?.toString();
    const source = currentSelections.source_id?.toString();
    const version = currentSelections.version_id?.toString();
    const nomenclature = currentSelections.nomenclature;

    if (organism && assembly && source && version && nomenclature) {
      return `/o:${organism}/a:${assembly}/s:${source}/v:${version}/n:${nomenclature}`;
    }

    return '/';
  }

  /**
   * Extract the route from a given URL pathname
   * Uses structured format: o:<organism>/a:<assembly>/s:<source>/v:<version>/n:<nomenclature>/<route>
   */
  extractRouteFromPath(pathname: string): string {
    const segments = pathname.split('/').filter(Boolean);
    
    // Check if this looks like a structured app path
    if (segments.length >= 5 && 
        segments[0].startsWith('o:') && 
        segments[1].startsWith('a:') && 
        segments[2].startsWith('s:') && 
        segments[3].startsWith('v:') && 
        segments[4].startsWith('n:')) {
      
      // If we have exactly 5 segments, we're at home (no route)
      if (segments.length === 5) {
        return '';
      }
      
      // If we have 6+ segments, the 6th segment is the route
      return segments[5] || '';
    }
    
    // Not a structured app path
    return '';
  }

  /**
   * Check if a given route matches the current URL
   */
  isRouteActive(route: string, currentPathname: string): boolean {
    const currentRoute = this.extractRouteFromPath(currentPathname);
    return currentRoute === route;
  }

  /**
   * Parse a structured path and extract parameters
   * Returns null if the path is not a valid structured app path
   */
  parseStructuredPath(pathname: string): { params: UrlParams; route: string } | null {
    const segments = pathname.split('/').filter(Boolean);
    
    // Check if this looks like a structured app path
    if (segments.length >= 5 && 
        segments[0].startsWith('o:') && 
        segments[1].startsWith('a:') && 
        segments[2].startsWith('s:') && 
        segments[3].startsWith('v:') && 
        segments[4].startsWith('n:')) {
      
      const params: UrlParams = {
        organism: segments[0].substring(2), // Remove 'o:' prefix
        assembly: segments[1].substring(2), // Remove 'a:' prefix
        source: segments[2].substring(2),   // Remove 's:' prefix
        version: segments[3].substring(2),  // Remove 'v:' prefix
        nomenclature: segments[4].substring(2) // Remove 'n:' prefix
      };
      
      const route = segments.length > 5 ? segments[5] : '';
      
      return { params, route };
    }
    
    return null;
  }

  /**
   * Check if a path is a valid structured app path
   */
  isStructuredAppPath(pathname: string): boolean {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length >= 5 && 
           segments[0].startsWith('o:') && 
           segments[1].startsWith('a:') && 
           segments[2].startsWith('s:') && 
           segments[3].startsWith('v:') && 
           segments[4].startsWith('n:');
  }
}

export const pathManager = PathManager.getInstance(); 