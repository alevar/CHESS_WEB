import { GitHubRelease, ParsedReleaseData, ReleaseSummary, ReleaseFile } from '../types/github';

// Fetch GitHub releases
export const fetchGitHubReleases = async (): Promise<GitHubRelease[]> => {
  try {
    const response = await fetch('https://api.github.com/repos/chess-genome/chess/releases');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub releases:', error);
    throw error;
  }
};

// Fetch latest release
export const fetchLatestRelease = async (): Promise<GitHubRelease> => {
  try {
    const response = await fetch('https://api.github.com/repos/chess-genome/chess/releases/latest');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest release:', error);
    throw error;
  }
};

// Parse release body markdown - Updated to match the working JS implementation
export const parseGitReleaseBody = (body: string): ParsedReleaseData => {
  
  const lines = body.split('\n');
  const files: ReleaseFile[] = [];
  const summary: ReleaseSummary = {};
  let currentTable = '';
  let contentsSet = false;
  let statement = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('###')) {
      contentsSet = false;
      currentTable = line.trim().replace('### ', '').trim();
    } else if (currentTable === 'Files' && line.includes('|')) {
      const fileContents = line.split('|');
      // Remove leading/trailing empty elements
      if (!fileContents[0]) fileContents.splice(0, 1);
      if (!fileContents[fileContents.length - 1]) fileContents.splice(-1, 1);

      if (fileContents[0]?.trim().startsWith('-----')) {
        contentsSet = true;
      } else if (contentsSet && fileContents[0] && fileContents.length >= 4) {
        const fnames = fileContents[0].trim().split(',');
        const types: string[] = [];
        
        for (let f = 0; f < fnames.length; f++) {
          const pieces = fnames[f].trim().split('.');
          let ext = pieces[pieces.length - 1].toUpperCase();
          if (ext === 'GZ') {
            ext = pieces[pieces.length - 2].toUpperCase();
          }
          types.push(ext);
        }

        const genome = fileContents[1].trim();
        const curSummary = fileContents[2].trim();
        const description = fileContents[3].trim();
        
        files.push({
          filenames: fnames,
          types: types,
          genome: genome,
          summary: curSummary,
          description: description
        });
      }
    } else if (currentTable === 'Summary' && line.includes('|')) {
      const summaryContents = line.split('|');
      // Remove leading/trailing empty elements
      if (!summaryContents[0]) summaryContents.splice(0, 1);
      if (!summaryContents[summaryContents.length - 1]) summaryContents.splice(-1, 1);

      if (summaryContents[0]?.trim().startsWith('-----')) {
        contentsSet = true;
      } else if (contentsSet && summaryContents[0] && summaryContents.length >= 3) {
        const type = summaryContents[0].trim();
        const genes = summaryContents[1].trim();
        const transcripts = summaryContents[2].trim();
        
        // Handle different possible key names
        let key = type.toLowerCase().replace(/\s+/g, '_');
        if (key === 'protein_coding' || key === 'protein-coding') {
          key = 'protein_coding';
        } else if (key === 'alt_scaffolds' || key === 'alt-scaffolds') {
          key = 'alt_scaffolds';
        }
        
        summary[key] = { genes, transcripts, type };
      }
    } else if (currentTable === 'Statement' && line) {
      statement += line;
    }
  }

  return { statement, summary, files };
};

// Calculate total genes and transcripts - Updated to match JS implementation
export const calculateTotals = (summary: ReleaseSummary) => {
  const proteinCoding = summary.protein_coding || { genes: '0', transcripts: '0' };
  const lncRNA = summary.lncRNA || { genes: '0', transcripts: '0' };
  const other = summary.other || { genes: '0', transcripts: '0' };

  const totalGenes = parseInt(proteinCoding.genes) + parseInt(lncRNA.genes) + parseInt(other.genes);
  const totalTranscripts = parseInt(proteinCoding.transcripts) + parseInt(lncRNA.transcripts) + parseInt(other.transcripts);

  return { totalGenes, totalTranscripts };
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}; 