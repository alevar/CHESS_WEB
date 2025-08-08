// Organism
export interface Organism {
  taxonomy_id: number;
  scientific_name: string;
  common_name: string;
  information: string;
  assemblies?: Assembly[];
}

export interface GenomeFile {
  genome_file_id: number;
  assembly_id: number;
  nomenclature: string;
  file_path: string;
}

export interface Assembly {
  assembly_id: number;
  assembly_name: string;
  information: string;
  taxonomy_id: number;
  nomenclatures?: string[];
  genome_files?: GenomeFile[];
  sequence_name_mappings?: {
    [nomenclature: string]: {
      sequence_names_to_ids: {
        [sequence_name: string]: {
          sequence_id: number;
          length: number;
        };
      };
    };
  };
  sequence_id_mappings?: {
    [sequence_id: string]: {
      length: number;
      nomenclatures: {
        [nomenclature: string]: string;
      };
    };
  };
}

export interface Source {
  source_id: number;
  name: string;
  information: string;
  link: string;
  citation: string;
  last_updated?: string;
  versions?: { [sv_id: number]: SourceVersion };
}

export interface SourceVersion {
  sv_id: number;
  version_name: string;
  version_rank: number;
  last_updated?: string;
  assemblies?: { [sva_id: number]: SourceVersionAssembly };
}

export interface SourceVersionAssembly {
  sva_id: number;
  assembly_id: number;
  files?: { [file_key: string]: SourceFile };
}

export interface SourceFile {
  file_id: number;
  file_path: string;
  filetype: string;
  description: string;
}

export interface Configuration {
  configuration_id: number;
  active: boolean;
  description: string;
  organism_id: number;
  assembly_id: number;
  nomenclature: string;
  source_id: number;
  sv_id: number;
}

// Dataset management types
export interface Dataset {
  dataset_id: number;
  name: string;
  description: string;
  data_type: string;
}

export interface TranscriptData {
  td_id: number;
  tid: number;
  sva_id: number;
  transcript_id: string;
  dataset_id: number;
  data: string;
}

