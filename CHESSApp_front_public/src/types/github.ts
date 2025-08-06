// GitHub API Types
export interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  body: string;
  html_url: string;
  zipball_url: string;
  tarball_url: string;
  published_at: string;
  assets: GitHubAsset[];
}

export interface GitHubAsset {
  id: number;
  name: string;
  browser_download_url: string;
  size: number;
  updated_at: string;
}

// Parsed Release Data Types
export interface ReleaseSummary {
  [key: string]: {
    genes: string;
    transcripts: string;
    type?: string;
  };
}

export interface ReleaseFile {
  filenames: string[];
  types: string[];
  genome: string;
  summary: string;
  description: string;
}

export interface ParsedReleaseData {
  statement: string;
  summary: ReleaseSummary;
  files: ReleaseFile[];
}

export interface ReleaseInfo {
  release: GitHubRelease;
  parsedData: ParsedReleaseData;
} 