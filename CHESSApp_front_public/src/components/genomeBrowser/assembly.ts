export const getAssembly = (accession_id: string) => {
  return {
    name: "hg38",
    sequence: {
      type: 'ReferenceSequenceTrack',
      trackId: `ReferenceSequenceTrack`,
      adapter: {
        type: 'IndexedFastaAdapter',
        fastaLocation: {
          uri: `/CHESS/data/hg38_p12_ucsc.fa`,
          locationType: 'UriLocation',
        },
        faiLocation: {
          uri: `/CHESS/data/hg38_p12_ucsc.fa.fai`,
          locationType: 'UriLocation',
        },
      },
    },
  };
};