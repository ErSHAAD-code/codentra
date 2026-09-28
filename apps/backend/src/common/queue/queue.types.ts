export const QUEUE_NAMES = {
  REPOSITORY_PROCESSING: 'repository-processing',
  ANALYSIS: 'analysis',
} as const;

export interface RepositoryProcessingJob {
  repositoryId: string;
  uploadId: string;
  storagePath?: string; // local disk path — set for zip/single-file
  archiveType: 'zip' | 'single-file' | 'github';
  github?: { url: string; token: string }; // set for archiveType = 'github'
}

export interface AnalysisJob {
  analysisId: string;
  repositoryId: string;
}
