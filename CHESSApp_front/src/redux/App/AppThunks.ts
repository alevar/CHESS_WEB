import { createAsyncThunk } from '@reduxjs/toolkit';
import { setAppData, setLoading, setError } from './AppSlice';
import {
  DB,
  DBBuilder,
  Organism,
  Assembly,
  Source,
  Sequence,
  Attribute
} from '../../types/db';

export const fetchAppData = createAsyncThunk(
  'appData/fetchAppData',
  async (_, { dispatch }) => {
    dispatch(setLoading());
    try {
      const response = await fetch('http://localhost:5000/api/main/globalData');
      const data = await response.json();
      // Map response data to match the interfaces
      const dbBuilder = new DBBuilder();
      for (const org of Object.values(data.organisms) as any[]) {
        const organism: Organism = {
          organism_id: org.organism_id,
          scientific_name: org.scientific_name,
          common_name: org.common_name,
          information: org.information,
          assemblies: [],
          assemblyIdMap: {},
        }
        dbBuilder.addOrganism(organism);
      }

      for (const asm of Object.values(data.assemblies) as any[]) {
        const assembly: Assembly = {
          assembly_id: asm.assembly_id,
          assembly_name: asm.assembly_name,
          information: asm.information,
          link: asm.link,
          organism_id: asm.organism_id,
          sequences: [],
          sources: [],
          sequenceIdMap: {},
          sourceIdMap: {},
        }
        dbBuilder.addAssembly(assembly);
      }

      for (const src of Object.values(data.sources) as any[]) {
        const source: Source = {
          source_id: src.source_id,
          name: src.name,
          information: src.information,
          link: src.link,
          original_format: src.original_format,
          last_updated: src.last_updated,
          assembly_id: src.assembly_id,
          citation: src.citation,
          attributes: {},
        }
        dbBuilder.addSource(source);
      }

      for (const src of Object.values(data.sequence_ids) as any[]) {
        const seqid: Sequence = {
          assembly_id: src.assembly_id,
          sequence_id: src.sequence_id,
          length: src.length,
          names: { [src.nomenclature as string]: src.sequence_name },
        }
        dbBuilder.addSequenceId(seqid);
      }

      // assign the attributes to the sources
      for (const attr of Object.values(data.attributes) as any[]) {
        const attribute: Attribute = {
          key: attr.key_name,
          description: attr.description,
          data: [{
            kvid: attr.kvid,
            value: attr.value,
          }],
        }
        for (const source_id of attr.sources) {
          dbBuilder.addAttribute(attribute, source_id);
        }
      }

      const db: DB = dbBuilder.getDB();

      dispatch(setAppData(db));
    } catch (error) {
      dispatch(setError(`appData/fetchAppData: Failed to load Initial App data: ${error}`));
    }
  }
);