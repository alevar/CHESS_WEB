import { RootState } from '../redux/store';
import { AppSettings } from '../types/appTypes';

/**
 * Validates app selections against database data
 * @param selections - The app settings to validate
 * @param dbData - The database data to validate against
 * @returns boolean indicating if selections are valid
 */
export function validateSelections(
  selections: AppSettings, 
  dbData: RootState['dbData']
): boolean {
  try {
    const { organisms, assemblies, sources } = dbData;
    
    // Check if organism exists
    if (!organisms[selections.organism_id]) return false;
    
    // Check if assembly exists and belongs to organism
    const assembly = assemblies[selections.assembly_id];
    if (!assembly || assembly.taxonomy_id !== selections.organism_id) return false;
    
    // Check if source exists
    if (!sources[selections.source_id]) return false;
    
    // Check if version exists in source
    const source = sources[selections.source_id];
    if (!source.versions?.[selections.version_id]) return false;

    // Check if source version has assembly
    const version = source.versions[selections.version_id];
    const hasAssembly = Object.values(version.assemblies || {}).some(
      (sva: any) => sva.assembly_id === selections.assembly_id
    );
    if (!hasAssembly) return false;
    
    // Check if nomenclature is valid for assembly
    if (!assembly.nomenclatures.includes(selections.nomenclature)) return false;
    
    return true;
  } catch (error) {
    return false;
  }
} 