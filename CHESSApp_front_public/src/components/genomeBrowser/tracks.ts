export const getTracks = (accession_id: string) => {
  return [
    {
      type: 'FeatureTrack',
      trackId: 'genes',
      name: 'Atlas',
      assemblyNames: ["hg38"],
      category: ['Genes'],
      adapter: {
        type: 'Gff3TabixAdapter',
        gffGzLocation: {
          uri: `https://raw.githubusercontent.com/chess-genome/chess/master/chess3.1.3.GRCh38.sorted.gff.gz`,
        },
        index: {
          location: {
            uri: `https://raw.githubusercontent.com/chess-genome/chess/master/chess3.1.3.GRCh38.sorted.gff.gz.tbi`,
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
