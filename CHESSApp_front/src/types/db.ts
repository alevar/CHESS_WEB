export interface Organism {
    organism_id: number;
    scientific_name: string;
    common_name: string;
    information?: string;
    assemblies: Assembly[];
    assemblyIdMap: Record<number, number>;
}

export interface Assembly {
    assembly_id: number;
    assembly_name: string;
    information: string;
    link: string;
    organism_id: number;
    sequences: Sequence[];
    sources: Source[];

    sequenceIdMap: Record<number, number>;
    sourceIdMap: Record<number, number>;
}

export interface Sequence {
    assembly_id: number;
    sequence_id: number;
    length: number;
    names: Record<string, string>;
}

export interface Attribute {
    key: string;
    description: string;
    data: {
        kvid: number;
        value: string;
    }[];
}

export interface Source {
    source_id: number;
    name: string;
    information: string;
    link: string;
    original_format: "gtf" | "gff";
    last_updated?: string;
    assembly_id: number;
    citation: string;
    attributes: Record<string, Attribute>;
}

export interface DB {
    organisms: Organism[];
    organismIdMap: Record<number, number>; // maps organism_id to index in organisms

    assemblyId_to_organismId: Record<number, number>; // maps assembly_id to organism_id
    sourceId_to_assemblyId: Record<number, number>; // maps source_id to assembly_id
}

export function get_organism(db: DB, organism_id: number): Organism {
    return db.organisms[db.organismIdMap[organism_id]];
}

export function get_assembly(db: DB, assembly_id: number): Assembly {
    const organism_id = db.assemblyId_to_organismId[assembly_id];
    const organism = get_organism(db, organism_id);
    return organism.assemblies[organism.assemblyIdMap[assembly_id]];
}

export function get_source(db: DB, source_id: number): Source {
    const assembly_id = db.sourceId_to_assemblyId[source_id];
    const assembly = get_assembly(db, assembly_id);
    return assembly.sources[assembly.sourceIdMap[source_id]];
}

export function get_sequence(db: DB, sequence_id: number): Sequence {
    const assembly_id = db.sourceId_to_assemblyId[sequence_id];
    const assembly = get_assembly(db, assembly_id);
    return assembly.sequences[assembly.sequenceIdMap[sequence_id]];
}

export class DBBuilder {
    private db: DB;

    constructor() {
        this.db = {
            organisms: [],
            organismIdMap: {},
            assemblyId_to_organismId: {},
            sourceId_to_assemblyId: {},
        };
    }

    addOrganism(organism: Organism) {
        this.db.organisms.push(organism);
        this.db.organismIdMap[organism.organism_id] = this.db.organisms.length - 1;
    }

    addAssembly(assembly: Assembly) {
        const organism = this.db.organisms[this.db.organismIdMap[assembly.organism_id]];
        this.db.assemblyId_to_organismId[assembly.assembly_id] = assembly.organism_id;
        organism.assemblies.push(assembly);
        organism.assemblyIdMap[assembly.assembly_id] = organism.assemblies.length - 1;
    }
    
    addSource(source: Source) {
        const assembly = get_assembly(this.db, source.assembly_id);
        assembly.sources.push(source);
        assembly.sourceIdMap[source.source_id] = assembly.sources.length - 1;
        this.db.sourceId_to_assemblyId[source.source_id] = source.assembly_id;
    }

    addSequenceId(sequence: Sequence) {
        const assembly = get_assembly(this.db, sequence.assembly_id);
        // check if the current sequence ID is already in the assembly
        // if found - only update the nomenclatures
        // otherwise add new entry
        if (sequence.sequence_id in assembly.sequenceIdMap) {
            const index = assembly.sequenceIdMap[sequence.sequence_id];
            assembly.sequences[index].names = {...assembly.sequences[index].names, ...sequence.names};
            return;
        }
        else {
            assembly.sequences.push(sequence);
            assembly.sequenceIdMap[sequence.sequence_id] = assembly.sequences.length - 1;
        }
    }

    addAttribute(attribute: Attribute, source_id: number) {
        const source = get_source(this.db, source_id);
        
        // check if the current attribute key is already in the source
        // if found - add values to the data of the existing key
        // otherwise add new entry
        if (attribute.key in source.attributes) {
            source.attributes[attribute.key].data.push(...attribute.data);
            return;
        }
        else {
            source.attributes[attribute.key] = attribute;
        }
    }

    getDB(): DB {
        return this.db;
    }
}