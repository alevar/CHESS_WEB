import {
  Organism,
  Assembly,
  Source,
  Configuration,
  Dataset,
  DbDataState
} from '../types/dbTypes';

export class DbDataBuilder {
  private organisms: { [taxonomy_id: number]: Organism } = {};
  private assemblies: { [assembly_id: number]: Assembly } = {};
  private sources: { [source_id: number]: Source } = {};
  private configurations: { [configuration_id: number]: Configuration } = {};
  private datasets: { [dataset_id: number]: Dataset } = {};

  constructor(data?: Partial<DbDataState>) {
    if (data) {
      this.organisms = data.organisms || {};
      this.assemblies = data.assemblies || {};
      this.sources = data.sources || {};
      this.configurations = data.configurations || {};
      this.datasets = data.datasets || {};
    }
  }

  // Helper methods to get data arrays
  getOrganismsArray(): Organism[] {
    return Object.values(this.organisms);
  }

  getAssembliesArray(): Assembly[] {
    return Object.values(this.assemblies);
  }

  getSourcesArray(): Source[] {
    return Object.values(this.sources);
  }

  getConfigurationsArray(): Configuration[] {
    return Object.values(this.configurations);
  }

  getDatasetsArray(): Dataset[] {
    return Object.values(this.datasets);
  }

  // Helper methods to get filtered data
  getAssembliesForOrganism(taxonomyId: number): Assembly[] {
    return this.getAssembliesArray().filter(assembly => assembly.taxonomy_id === taxonomyId);
  }

  getActiveConfigurations(): Configuration[] {
    return this.getConfigurationsArray().filter(config => config.active);
  }

  getConfigurationsForOrganism(organismId: number): Configuration[] {
    return this.getConfigurationsArray().filter(config => config.organism_id === organismId);
  }

  getConfigurationsForAssembly(assemblyId: number): Configuration[] {
    return this.getConfigurationsArray().filter(config => config.assembly_id === assemblyId);
  }

  // Helper to build dropdown options
  getOrganismOptions(): { value: number; label: string }[] {
    return this.getOrganismsArray().map(organism => ({
      value: organism.taxonomy_id,
      label: `${organism.scientific_name} (${organism.common_name})`
    }));
  }

  getAssemblyOptionsForOrganism(taxonomyId: number): { value: number; label: string }[] {
    return this.getAssembliesForOrganism(taxonomyId).map(assembly => ({
      value: assembly.assembly_id,
      label: assembly.assembly_name
    }));
  }

  // Validation helpers
  isValidOrganism(taxonomyId: number): boolean {
    return taxonomyId in this.organisms;
  }

  isValidAssembly(assemblyId: number): boolean {
    return assemblyId in this.assemblies;
  }

  isValidAssemblyForOrganism(assemblyId: number, taxonomyId: number): boolean {
    const assembly = this.assemblies[assemblyId];
    return assembly && assembly.taxonomy_id === taxonomyId;
  }

  // Get current state
  getDbData(): Partial<DbDataState> {
    return {
      organisms: this.organisms,
      assemblies: this.assemblies,
      sources: this.sources,
      configurations: this.configurations,
      datasets: this.datasets
    };
  }
}

// Utility function to create a builder from Redux state
export const createDbDataBuilder = (dbDataState: DbDataState): DbDataBuilder => {
  return new DbDataBuilder(dbDataState);
};