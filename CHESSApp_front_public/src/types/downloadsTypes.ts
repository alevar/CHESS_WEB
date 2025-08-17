export interface DownloadFile {
    id: string;
    name: string;
    description: string;
    type: 'fasta' | 'gtf.gz' | 'gff3.gz' | 'fai';
    size?: string;
    lastModified?: string;
    downloadUrl: string;
    assembly_id: number;
    nomenclature: string;
    sva_id?: number;
    file_type?: string;
  }
  
  export interface DownloadsState {
    files: DownloadFile[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
  }