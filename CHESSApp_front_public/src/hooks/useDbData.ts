import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { 
  DbDataState,
  Organism, 
  Assembly, 
  Source, 
  SourceVersion, 
  SourceVersionAssembly,
  Configuration,
  Dataset,
  DataType
} from '../types/dbTypes';

export const useDbData = () => {
    const dbData = useSelector((state: RootState) => state.dbData);
    
    const getDbData = useCallback((): DbDataState => {
        return dbData;
    }, [dbData]);

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

    const getSourceVersionAssembly_byID = useCallback((source_id: number, version_id: number, assembly_id: number): SourceVersionAssembly | undefined => {
        const version = getSourceVersion(source_id, version_id);
        const sva = Object.values(version?.assemblies || {}).find((sva: SourceVersionAssembly) => sva.assembly_id === assembly_id);
        return sva;
    }, [dbData.sources]);

    // get a list of all organisms
    const getAllOrganisms = useCallback((): Organism[] => {
        return Object.values(dbData.organisms);
    }, [dbData.organisms]);

    const getAllAssemblies = useCallback((): Assembly[] => {
        return Object.values(dbData.assemblies);
    }, [dbData.assemblies]);

    // get a list of all assemblies (optional taxonomy_id)
    const getAllAssembliesForOrganism = useCallback((organism: Organism): Assembly[] => {
        return Object.values(dbData.assemblies || {}).filter(assembly => assembly.taxonomy_id === organism.taxonomy_id);
    }, [dbData.assemblies]);

    const getAllAssembliesForOrganism_byID = useCallback((taxonomy_id: number): Assembly[] => {
        const organism = getOrganism(taxonomy_id);
        return organism ? getAllAssembliesForOrganism(organism) : [];
    }, [dbData.assemblies]);

    // get all nomenclatures for an assembly
    const getAllNomenclaturesForAssembly = useCallback((assembly: Assembly): string[] => {
        return Object.values(assembly.nomenclatures || {});
    }, [dbData.assemblies]);

    const getAllNomenclaturesForAssembly_byID = useCallback((assembly_id: number): string[] => {
        const assembly = getAssembly(assembly_id);
        return assembly ? getAllNomenclaturesForAssembly(assembly) : [];
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

    const getAllSourcesForAssembly_byID = useCallback((assembly_id: number): Source[] => {
        const assembly = getAssembly(assembly_id);
        return assembly ? getAllSourcesForAssembly(assembly) : [];
    }, [dbData.assemblies]);

    // get all versions for a source
    const getAllVersionsForSource = useCallback((source: Source): SourceVersion[] => {
        return Object.values(source.versions);
    }, [dbData.sources]);

    const getAllVersionsForSource_byID = useCallback((source_id: number): SourceVersion[] => {
        const source = getSource(source_id);
        return source ? getAllVersionsForSource(source) : [];
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

    const getAllVersionsForSourceAssembly_byID = useCallback((source_id: number, assembly_id: number): SourceVersion[] => {
        const source = getSource(source_id);
        const assembly = getAssembly(assembly_id);
        return source && assembly ? getAllVersionsForSourceAssembly(source, assembly) : [];
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

    const getSequenceNamesForAssemblyNomenclature_byID = useCallback((assembly_id: number, nomenclature: string): string[] => {
        const assembly = getAssembly(assembly_id);
        return assembly ? getSequenceNamesForAssemblyNomenclature(assembly, nomenclature) : [];
    }, [dbData.assemblies]);

    const getGeneTypesForSourceVersionAssembly = useCallback((source_id: number, version_id: number, assembly_id: number): string[] => {
        const sva = getSourceVersionAssembly_byID(source_id, version_id, assembly_id);
        return sva ? sva.gene_types : [];
    }, [dbData.sources]);

    const getSequenceNameForAssemblyNomenclature_byID = useCallback((sequence_id: string, assembly_id: number, nomenclature: string): string => {
        const assembly = getAssembly(assembly_id);
        const sequenceIdToName_map = assembly?.sequence_id_mappings;
        if (!sequenceIdToName_map) return "";
        const sequenceName = sequenceIdToName_map[sequence_id]?.nomenclatures[nomenclature];
        return sequenceName || "";
    }, [dbData.assemblies]);

    return {
        getDbData,

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

        getAllAssembliesForOrganism_byID,
        getAllNomenclaturesForAssembly_byID,
        getAllSourcesForAssembly_byID,
        getAllVersionsForSource_byID,
        getAllVersionsForSourceAssembly_byID,
        getSequenceNamesForAssemblyNomenclature_byID,
        getSourceVersionAssembly_byID,

        getGeneTypesForSourceVersionAssembly,
        getSequenceNameForAssemblyNomenclature_byID,
    };
}