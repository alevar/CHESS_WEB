const API_BASE_URL = 'http://localhost:5000/api';
export interface BrowserTrackProps {
  name: string;
  assembly_name: string;
  sva_id: number;
  nomenclature: string;
}
export const getTracks = (track: BrowserTrackProps) => {
  return [
    {
      type: 'FeatureTrack',
      trackId: 'genes',
      name: track.name,
      assemblyNames: [track.assembly_name],
      category: ['Genes'],
      adapter: {
        type: 'Gff3TabixAdapter',
        gffGzLocation: {
          uri: `${API_BASE_URL}/public/gff3bgz/${track.sva_id}/${track.nomenclature}`,
        },
        index: {
          location: {
            uri: `${API_BASE_URL}/public/gff3bgztbi/${track.sva_id}/${track.nomenclature}`,
          },
          indexType: 'TBI',
        },
      },
      // Custom display configurations
      displays: [
        {
          type: 'LinearBasicDisplay',
          displayId: 'genes-LinearBasicDisplay',
          renderer: {
            type: 'SvgFeatureRenderer',
            color1: '#ff7f0e', // Orange for genes
            color2: '#2ca02c', // Green for transcripts
            color3: '#d62728', // Red for exons
          }
        }
      ]
    }
  ];
};
