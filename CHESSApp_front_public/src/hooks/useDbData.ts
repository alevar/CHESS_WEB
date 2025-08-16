import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { 
  Organism, 
  Assembly, 
  Source, 
  SourceVersion, 
  SourceVersionAssembly,
  Configuration,
  Dataset,
  DataType,
  TranscriptData
} from '../types/dbTypes';

export const useDbData = () => {
    const dbData = useSelector((state: RootState) => state.dbData);

    const getOrganism = useCallback((taxonomy_id: number): Organism | undefined => {
        return dbData.organisms[taxonomy_id];
    }, [dbData.organisms]);

    const getAssembly = useCallback((assembly_id: number): Assembly | undefined => {
        return dbData.assemblies[assembly_id];
    }, [dbData.assemblies]);
    
    const getSource = useCallback((source_id: number): Source | undefined => {
        return dbData.sources[source_id];
    }, [dbData.sources]);

    const getSourceVersion = useCallback((source_id: number, version_id: number): SourceVersion | undefined => {
        const source = getSource(source_id);
        return source?.versions[version_id];
    }, [dbData.sources]);
    
    const getConfiguration = useCallback((configuration_id: number): Configuration | undefined => {
        return dbData.configurations[configuration_id];
    }, [dbData.configurations]);

    const getDataset = useCallback((dataset_id: number): Dataset | undefined => {
        return dbData.datasets.datasets[dataset_id];
    }, [dbData.datasets.datasets]);
    
    const getDataType = useCallback((data_type: string): DataType | undefined => {
        return dbData.datasets.data_types[data_type];
    }, [dbData.datasets.data_types]);

    // get a list of all organisms
    const getAllOrganisms = useCallback((): Organism[] => {
        return Object.values(dbData.organisms);
    }, [dbData.organisms]);

    const getAllAssemblies = useCallback((): Assembly[] => {
        return Object.values(dbData.assemblies);
    }, [dbData.assemblies]);

    // get a list of all assemblies (optional taxonomy_id)
    const getAllAssembliesForOrganism = useCallback((taxonomy_id?: number): Assembly[] => {
        const assemblies = Object.values(dbData.assemblies || {});
        return taxonomy_id 
            ? assemblies.filter(assembly => assembly.taxonomy_id === taxonomy_id)
            : assemblies;
    }, [dbData.assemblies]);

    // get all nomenclatures for an assembly
    const getAllNomenclaturesForAssembly = useCallback((assembly: Assembly): string[] => {
        return Object.values(assembly.nomenclatures || {});
    }, [dbData.assemblies]);

    // get all sources
    const getAllSources = useCallback((): Source[] => {
        return Object.values(dbData.sources);
    }, [dbData.sources]);

    // get all sources for an assembly
    const getAllSourcesForAssembly = useCallback((assembly: Assembly): Source[] => {
        return Object.values(dbData.sources || {}).filter(source => {
            if (!source.versions) return false;
            return Object.values(source.versions).some(version => {
                if (!version.assemblies) return false;
                return Object.values(version.assemblies).some(sva => 
                    sva.assembly_id === assembly.assembly_id
                );
            });
        });
    }, [dbData.sources]);

    // get all versions for a source
    const getAllVersionsForSource = useCallback((source: Source): SourceVersion[] => {
        return Object.values(source.versions);
    }, [dbData.sources]);

    // get all versions for a source/assembly combination
    const getAllVersionsForSourceAssembly = useCallback((source: Source, assembly: Assembly): SourceVersion[] => {
        return Object.values(source.versions).filter(version => {
            if (!version.assemblies) return false;
            return Object.values(version.assemblies).some(sva => 
                sva.assembly_id === assembly.assembly_id
            );
        });
    }, [dbData.sources]);

    const getSequenceNamesForAssemblyNomenclature = useCallback((assembly: Assembly, nomenclature: string): string[] => {
        if (!assembly.sequence_id_mappings) return [];
        const examples: string[] = [];
        for (const [, mapping] of Object.entries(assembly.sequence_id_mappings)) {
            if (mapping.nomenclatures[nomenclature] && examples.length < 3) {
                examples.push(mapping.nomenclatures[nomenclature]);
            }
        }
        return examples;
    }, [dbData.assemblies]);

    return {
        getOrganism,
        getAssembly,
        getSource,
        getSourceVersion,
        getConfiguration,
        getDataset,
        getDataType,

        getAllOrganisms,
        getAllAssemblies,
        getAllAssembliesForOrganism,
        getAllNomenclaturesForAssembly,
        getAllSources,
        getAllSourcesForAssembly,
        getAllVersionsForSource,
        getAllVersionsForSourceAssembly,
        getSequenceNamesForAssemblyNomenclature,
    };
}